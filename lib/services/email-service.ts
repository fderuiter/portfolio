import { Resend } from "resend";
import crypto from "crypto";
import * as Sentry from "@sentry/nextjs";
import { env, getEnv } from "@/lib/env";
import { prisma } from "@/lib/db";
import { ContactSubmission, ResendWebhookEvent } from "@/lib/schemas";
import {
  renderContactAdminEmail,
  renderContactConfirmationEmail,
  renderFeedbackNotificationEmail,
  renderNewsletterWelcomeEmail,
  FeedbackNotificationPayload,
} from "@/lib/email-templates";

export interface RawEmailOptions {
  to: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  tags?: Array<{ name: string; value: string }>;
  skipQueue?: boolean;
}

export interface EmailDispatchResult {
  success: boolean;
  data?: { id: string };
  error?: string;
  simulated?: boolean;
  queued?: boolean;
  queueId?: string;
}

export interface ContactDispatchResult {
  success: boolean;
  adminResult: EmailDispatchResult;
  confirmationResult?: EmailDispatchResult;
}

export interface SvixVerifyParams {
  payload: string;
  svixId?: string | null;
  svixTimestamp?: string | null;
  svixSignature?: string | null;
  secret?: string;
}

/**
 * Singleton holder for the Resend client instance.
 */
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendClient) return resendClient;
  const apiKey = getEnv().RESEND_API_KEY || env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * Verifies Svix cryptographic signature for incoming Resend deliverability webhooks.
 */
export function verifySvixSignature({
  payload,
  svixId,
  svixTimestamp,
  svixSignature,
  secret,
}: SvixVerifyParams): boolean {
  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  const effectiveSecret = secret || getEnv().RESEND_WEBHOOK_SECRET;
  if (!effectiveSecret || effectiveSecret.trim() === "") {
    return false;
  }

  // Prevent timestamp replay attacks (> 5 minutes tolerance)
  const timestampNum = parseInt(svixTimestamp, 10);
  const nowSec = Math.floor(Date.now() / 1000);
  if (isNaN(timestampNum) || Math.abs(nowSec - timestampNum) > 300) {
    return false;
  }

  try {
    const rawSecret = effectiveSecret.startsWith("whsec_")
      ? effectiveSecret.substring(6)
      : effectiveSecret;
    const secretBuffer = Buffer.from(rawSecret, "base64");

    const toSign = `${svixId}.${svixTimestamp}.${payload}`;
    const expectedHmac = crypto
      .createHmac("sha256", secretBuffer)
      .update(toSign)
      .digest("base64");

    const signatures = svixSignature.split(" ");
    for (const versionedSig of signatures) {
      const [version, sig] = versionedSig.split(",");
      if (version === "v1" && sig) {
        const sigBuffer = Buffer.from(sig, "base64");
        const expectedBuffer = Buffer.from(expectedHmac, "base64");
        if (
          sigBuffer.length === expectedBuffer.length &&
          crypto.timingSafeEqual(sigBuffer, expectedBuffer)
        ) {
          return true;
        }
      }
    }
    return false;
  } catch (err) {
    console.error("Failed to verify Svix signature:", err);
    return false;
  }
}

const DEFAULT_FROM_EMAIL = "Frederick de Ruiter <notifications@deruiter.dev>";
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 600000; // 10 minutes

function isRetryableError(errorMessage: string): boolean {
  const lower = errorMessage.toLowerCase();
  return (
    lower.includes("429") ||
    lower.includes("rate_limit") ||
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("timeout") ||
    lower.includes("network") ||
    lower.includes("econnreset") ||
    lower.includes("fetch failed") ||
    lower.includes("internal server error") ||
    lower.includes("500") ||
    lower.includes("502") ||
    lower.includes("503") ||
    lower.includes("504")
  );
}

/**
 * Deep module encapsulating all outbound transactional email workflows,
 * bounce/complaint suppression list defenses, retry queueing, and webhook ingestion.
 */
export class EmailService {
  /**
   * Resets the cached Resend client instance (primarily used for test isolation).
   */
  static resetClient(): void {
    resendClient = null;
  }

  /**
   * Checks if an email address is in the suppression list (bounced, complained, unsubscribed).
   */
  static async isSuppressed(
    email: string
  ): Promise<{ suppressed: boolean; reason?: string }> {
    try {
      const record = await prisma.suppressionList.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (record) {
        return { suppressed: true, reason: record.reason };
      }
      return { suppressed: false };
    } catch {
      // If database is offline or unseeded in tests, defensively fail open
      return { suppressed: false };
    }
  }

  /**
   * Records an email address in the suppression list.
   *
   * Deliberately lets a database failure propagate instead of swallowing it:
   * the caller (`handleWebhookEvent`) depends on this rejecting so it can
   * report the event as unhandled, which in turn makes the webhook route
   * respond with a retryable non-2xx status instead of acknowledging a
   * durable write that never happened. The upsert is idempotent by
   * construction, so a retried delivery (or a partially-failed batch of
   * recipients being reprocessed from the start) is always safe to replay.
   */
  static async recordSuppression(
    email: string,
    reason: "BOUNCE" | "COMPLAINT" | "UNSUBSCRIBE"
  ): Promise<void> {
    await prisma.suppressionList.upsert({
      where: { email: email.toLowerCase().trim() },
      create: { email: email.toLowerCase().trim(), reason },
      update: { reason },
    });
  }

  /**
   * Reads a queued row's `tags` column back into structured tags.
   *
   * Accepts native JSON arrays and, for rows written before tags were stored
   * natively, a JSON-encoded string. Anything unrecognizable yields undefined
   * so a malformed column never reaches the provider.
   */
  private static parseQueuedTags(
    raw: unknown
  ): Array<{ name: string; value: string }> | undefined {
    let value = raw;
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    if (!Array.isArray(value)) return undefined;
    const tags = value.filter(
      (t): t is { name: string; value: string } =>
        !!t &&
        typeof t === "object" &&
        typeof (t as { name?: unknown }).name === "string" &&
        typeof (t as { value?: unknown }).value === "string"
    );
    return tags.length > 0 ? tags : undefined;
  }

  /**
   * Enqueues an email to the persistent OutboundEmailQueue table.
   *
   * Returns the durable queue id, or `null` when the row could not be
   * persisted. A null result means the message is not queued and will not be
   * retried; callers must not present it as accepted for delivery.
   */
  static async queueOutboundEmail(
    options: RawEmailOptions,
    fromAddress?: string,
    errorReason?: string
  ): Promise<string | null> {
    const toAddress = Array.isArray(options.to)
      ? options.to.join(", ")
      : options.to;
    const from =
      fromAddress ||
      options.from ||
      env.RESEND_FROM_EMAIL ||
      DEFAULT_FROM_EMAIL;
    const nextRetryAt = new Date(Date.now() + BASE_RETRY_DELAY_MS);

    try {
      const entry = await prisma.outboundEmailQueue.create({
        data: {
          to: toAddress,
          from,
          replyTo: options.replyTo,
          subject: options.subject,
          html: options.html,
          text: options.text,
          // Jsonb column: persist the structured tags themselves. Stringifying
          // here would store a string scalar that no longer round trips.
          tags: options.tags ?? undefined,
          attempts: 1,
          status: "RETRYING",
          nextRetryAt,
          lastError: errorReason || "Initial dispatch failed",
        },
      });
      return entry.id;
    } catch (err) {
      // Nothing was persisted, so there is no retry and no queue id to hand
      // back. Synthesizing one would read to every caller as a durable entry.
      Sentry.captureException(err);
      console.error("Failed to enqueue outbound email to database:", err);
      return null;
    }
  }

  /**
   * Processes due items from OutboundEmailQueue with exponential backoff.
   */
  static async processRetryQueue(options?: {
    maxBatchSize?: number;
    now?: Date;
  }): Promise<{ processed: number; succeeded: number; failed: number }> {
    const limit = options?.maxBatchSize || 20;
    const now = options?.now || new Date();

    let items: Array<{
      id: string;
      to: string;
      from: string;
      replyTo: string | null;
      subject: string;
      html: string;
      text: string | null;
      tags: unknown;
      attempts: number;
      status: string;
      nextRetryAt: Date;
      lastError: string | null;
    }> = [];

    try {
      items = await prisma.outboundEmailQueue.findMany({
        where: {
          status: { in: ["PENDING", "RETRYING"] },
          nextRetryAt: { lte: now },
        },
        orderBy: { nextRetryAt: "asc" },
        take: limit,
      });
    } catch (err) {
      console.error("Error reading OutboundEmailQueue:", err);
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    let succeeded = 0;
    let failed = 0;

    for (const item of items) {
      const client = getResendClient();
      const rawOptions: RawEmailOptions = {
        to: item.to.includes(",")
          ? item.to.split(",").map((s) => s.trim())
          : item.to,
        from: item.from,
        replyTo: item.replyTo || undefined,
        subject: item.subject,
        html: item.html,
        text: item.text || undefined,
        tags: this.parseQueuedTags(item.tags),
        skipQueue: true,
      };

      // Suppression check
      const toRecipients = Array.isArray(rawOptions.to)
        ? rawOptions.to
        : [rawOptions.to];
      let isAnySuppressed = false;
      for (const rec of toRecipients) {
        const check = await this.isSuppressed(rec);
        if (check.suppressed) {
          isAnySuppressed = true;
          break;
        }
      }

      if (isAnySuppressed) {
        await prisma.outboundEmailQueue.update({
          where: { id: item.id },
          data: {
            status: "FAILED",
            lastError: "Recipient is on suppression list",
          },
        });
        failed++;
        continue;
      }

      const apiKey = getEnv().RESEND_API_KEY || env.RESEND_API_KEY;
      const isVitest = getEnv().VITEST === "1" || env.VITEST === "1";

      // If simulated / test environment without live Resend client
      if (!client || (isVitest && !apiKey)) {
        await prisma.outboundEmailQueue.update({
          where: { id: item.id },
          data: { status: "DELIVERED", updatedAt: new Date() },
        });
        succeeded++;
        continue;
      }

      try {
        const { error } = await client.emails.send({
          from: item.from,
          to: rawOptions.to,
          replyTo: item.replyTo || undefined,
          subject: item.subject,
          html: item.html,
          text: item.text || undefined,
          tags: rawOptions.tags,
        });

        if (error) {
          const nextAttempts = item.attempts + 1;
          if (nextAttempts >= MAX_RETRY_ATTEMPTS) {
            await prisma.outboundEmailQueue.update({
              where: { id: item.id },
              data: {
                status: "FAILED",
                attempts: nextAttempts,
                lastError: error.message,
              },
            });
            failed++;
          } else {
            const delay = Math.min(
              MAX_RETRY_DELAY_MS,
              BASE_RETRY_DELAY_MS * Math.pow(2, nextAttempts)
            );
            await prisma.outboundEmailQueue.update({
              where: { id: item.id },
              data: {
                status: "RETRYING",
                attempts: nextAttempts,
                nextRetryAt: new Date(Date.now() + delay),
                lastError: error.message,
              },
            });
            failed++;
          }
        } else {
          await prisma.outboundEmailQueue.update({
            where: { id: item.id },
            data: { status: "DELIVERED", updatedAt: new Date() },
          });
          succeeded++;
        }
      } catch (sendErr) {
        const nextAttempts = item.attempts + 1;
        const msg =
          sendErr instanceof Error
            ? sendErr.message
            : "Network dispatch failure";
        if (nextAttempts >= MAX_RETRY_ATTEMPTS) {
          await prisma.outboundEmailQueue.update({
            where: { id: item.id },
            data: {
              status: "FAILED",
              attempts: nextAttempts,
              lastError: msg,
            },
          });
          failed++;
        } else {
          const delay = Math.min(
            MAX_RETRY_DELAY_MS,
            BASE_RETRY_DELAY_MS * Math.pow(2, nextAttempts)
          );
          await prisma.outboundEmailQueue.update({
            where: { id: item.id },
            data: {
              status: "RETRYING",
              attempts: nextAttempts,
              nextRetryAt: new Date(Date.now() + delay),
              lastError: msg,
            },
          });
          failed++;
        }
      }
    }

    return { processed: items.length, succeeded, failed };
  }

  /**
   * Processes incoming Resend deliverability webhook event.
   *
   * `handled: false` signals a durable-processing failure (e.g. the
   * suppression-list write threw) rather than a no-op event type; callers
   * must treat that as retryable and must not acknowledge the delivery.
   */
  static async handleWebhookEvent(
    event: ResendWebhookEvent
  ): Promise<{ handled: boolean; suppressed?: boolean; reason?: string }> {
    try {
      if (event.type === "email.bounced" || event.type === "email.complained") {
        const reason = event.type === "email.bounced" ? "BOUNCE" : "COMPLAINT";
        const recipients = event.data.to || [];

        for (const recipient of recipients) {
          if (recipient && typeof recipient === "string") {
            await this.recordSuppression(recipient, reason);
          }
        }

        return { handled: true, suppressed: true, reason };
      }

      return { handled: true, suppressed: false };
    } catch (err) {
      Sentry.captureException(err);
      console.error("Error processing Resend webhook event:", err);
      return { handled: false };
    }
  }

  /**
   * Core dispatcher that transmits an email via Resend SDK or executes simulated delivery.
   */
  static async sendRawEmail(
    options: RawEmailOptions
  ): Promise<EmailDispatchResult> {
    const recipients = Array.isArray(options.to) ? options.to : [options.to];

    // Pre-check suppression list before transmitting
    for (const recipient of recipients) {
      const check = await this.isSuppressed(recipient);
      if (check.suppressed) {
        return {
          success: false,
          error: `Recipient address ${recipient} is suppressed due to previous ${check.reason || "rejection"}.`,
        };
      }
    }

    const client = getResendClient();
    const fromAddress =
      options.from || env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

    const apiKey = getEnv().RESEND_API_KEY || env.RESEND_API_KEY;
    const isVitest = getEnv().VITEST === "1" || env.VITEST === "1";

    // If no API key is provisioned, or running in Vitest test harness without live mocks, simulate delivery
    if (!client || (isVitest && !apiKey)) {
      const simulatedId = `sim_msg_${Math.random().toString(36).substring(2, 10)}`;

      if (env.NODE_ENV === "development") {
        console.log(
          `\x1b[36m[EmailService // Simulated Delivery]\x1b[0m\n  To: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}\n  Subject: ${options.subject}\n  Simulated ID: ${simulatedId}`
        );
      }

      return {
        success: true,
        data: { id: simulatedId },
        simulated: true,
      };
    }

    try {
      const { data, error } = await client.emails.send({
        from: fromAddress,
        to: options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        tags: options.tags,
      });

      if (error) {
        Sentry.captureException(
          new Error(`Resend dispatch error: ${error.message}`)
        );
        console.error("Resend API error:", error);

        if (isRetryableError(error.message) && !options.skipQueue) {
          const queueId = await this.queueOutboundEmail(
            options,
            fromAddress,
            error.message
          );
          if (queueId) {
            return {
              success: true,
              queued: true,
              queueId,
              data: { id: queueId },
            };
          }
          return {
            success: false,
            error: `${error.message} (retry could not be queued; message not delivered)`,
          };
        }

        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: {
          id: data?.id || `msg_${Math.random().toString(36).substring(2, 10)}`,
        },
      };
    } catch (err) {
      Sentry.captureException(err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error sending email";
      console.error("EmailService unhandled exception:", err);

      if (isRetryableError(errorMessage) && !options.skipQueue) {
        const queueId = await this.queueOutboundEmail(
          options,
          fromAddress,
          errorMessage
        );
        if (queueId) {
          return {
            success: true,
            queued: true,
            queueId,
            data: { id: queueId },
          };
        }
        return {
          success: false,
          error: `${errorMessage} (retry could not be queued; message not delivered)`,
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Dispatches an inbound visitor inquiry:
   * 1. Delivers admin notification to CONTACT_NOTIFICATION_EMAIL
   * 2. Delivers automated confirmation receipt to the visitor
   */
  static async sendContactInquiry(
    submission: ContactSubmission,
    connectionHash?: string
  ): Promise<ContactDispatchResult> {
    const adminTemplate = renderContactAdminEmail({
      name: submission.name,
      email: submission.email,
      intent: submission.intent,
      subject: submission.subject,
      message: submission.message,
      connectionHash,
      submittedAt: new Date(),
    });

    const adminEmail =
      getEnv().CONTACT_NOTIFICATION_EMAIL ||
      env.CONTACT_NOTIFICATION_EMAIL ||
      "fpderuiter@gmail.com";

    // 1. Send Admin Notification
    const adminResult = await this.sendRawEmail({
      to: adminEmail,
      replyTo: `${submission.name} <${submission.email}>`,
      subject: adminTemplate.subject,
      html: adminTemplate.html,
      text: adminTemplate.text,
      tags: [
        { name: "category", value: "contact-inquiry" },
        { name: "intent", value: submission.intent },
      ],
    });

    // 2. Send Visitor Confirmation
    const confirmationTemplate = renderContactConfirmationEmail({
      name: submission.name,
      intent: submission.intent,
      subject: submission.subject,
      message: submission.message,
    });

    const confirmationResult = await this.sendRawEmail({
      to: submission.email,
      replyTo: adminEmail,
      subject: confirmationTemplate.subject,
      html: confirmationTemplate.html,
      text: confirmationTemplate.text,
      tags: [{ name: "category", value: "contact-confirmation" }],
    });

    return {
      success: adminResult.success,
      adminResult,
      confirmationResult,
    };
  }

  /**
   * Dispatches an alert email to the admin when visitor feedback is submitted on a case study.
   */
  static async sendFeedbackNotification(
    payload: FeedbackNotificationPayload
  ): Promise<EmailDispatchResult> {
    const template = renderFeedbackNotificationEmail(payload);
    const adminEmail =
      getEnv().CONTACT_NOTIFICATION_EMAIL ||
      env.CONTACT_NOTIFICATION_EMAIL ||
      "fpderuiter@gmail.com";

    return this.sendRawEmail({
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: "category", value: "case-study-feedback" },
        { name: "case-study", value: payload.caseStudySlug },
      ],
    });
  }

  /**
   * Dispatches a newsletter subscription workflow:
   * 1. Delivers welcome confirmation email to the subscriber
   * 2. Alerts admin of the new subscription
   */
  static async subscribeNewsletter(
    email: string,
    connectionHash?: string
  ): Promise<EmailDispatchResult> {
    const welcomeTemplate = renderNewsletterWelcomeEmail({ email });
    const adminEmail =
      getEnv().CONTACT_NOTIFICATION_EMAIL ||
      env.CONTACT_NOTIFICATION_EMAIL ||
      "fpderuiter@gmail.com";

    // 1. Deliver Welcome Confirmation to Subscriber
    const welcomeResult = await this.sendRawEmail({
      to: email,
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html,
      text: welcomeTemplate.text,
      tags: [{ name: "category", value: "newsletter-welcome" }],
    });

    // 2. Alert Admin of New Subscriber
    if (welcomeResult.success) {
      await this.sendRawEmail({
        to: adminEmail,
        subject: `[Newsletter] New Subscriber: ${email}`,
        html: `<p>New subscriber registered: <strong>${email}</strong></p><p>Fingerprint: ${connectionHash || "anonymous"}</p>`,
        text: `New subscriber registered: ${email}\nFingerprint: ${connectionHash || "anonymous"}`,
        tags: [{ name: "category", value: "newsletter-admin-alert" }],
      });
    }

    return welcomeResult;
  }
}

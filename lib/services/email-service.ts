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
}

export interface EmailDispatchResult {
  success: boolean;
  data?: { id: string };
  error?: string;
  simulated?: boolean;
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
  const apiKey = env.RESEND_API_KEY;
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
    const expectedHmac = crypto.createHmac("sha256", secretBuffer).update(toSign).digest("base64");

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

/**
 * Deep module encapsulating all outbound transactional email workflows,
 * bounce/complaint suppression list defenses, and webhook ingestion.
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
   */
  static async recordSuppression(
    email: string,
    reason: "BOUNCE" | "COMPLAINT" | "UNSUBSCRIBE"
  ): Promise<void> {
    try {
      await prisma.suppressionList.upsert({
        where: { email: email.toLowerCase().trim() },
        create: { email: email.toLowerCase().trim(), reason },
        update: { reason },
      });
    } catch (err) {
      console.error(`Failed to record suppression for ${email}:`, err);
    }
  }

  /**
   * Processes incoming Resend deliverability webhook event.
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
  static async sendRawEmail(options: RawEmailOptions): Promise<EmailDispatchResult> {
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
    const fromAddress = options.from || env.RESEND_FROM_EMAIL || "Frederick de Ruiter <onboarding@resend.dev>";

    // If no API key is provisioned, or running in Vitest test harness without live mocks, simulate delivery
    if (!client || (env.VITEST === "1" && !env.RESEND_API_KEY)) {
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
        Sentry.captureException(new Error(`Resend dispatch error: ${error.message}`));
        console.error("Resend API error:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data: { id: data?.id || `msg_${Math.random().toString(36).substring(2, 10)}` },
      };
    } catch (err) {
      Sentry.captureException(err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error sending email";
      console.error("EmailService unhandled exception:", err);
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

    const adminEmail = env.CONTACT_NOTIFICATION_EMAIL || "fpderuiter@gmail.com";

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
    const adminEmail = env.CONTACT_NOTIFICATION_EMAIL || "fpderuiter@gmail.com";

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
    const adminEmail = env.CONTACT_NOTIFICATION_EMAIL || "fpderuiter@gmail.com";

    // 1. Deliver Welcome Confirmation to Subscriber
    const welcomeResult = await this.sendRawEmail({
      to: email,
      subject: welcomeTemplate.subject,
      html: welcomeTemplate.html,
      text: welcomeTemplate.text,
      tags: [
        { name: "category", value: "newsletter-welcome" },
      ],
    });

    // 2. Alert Admin of New Subscriber
    if (welcomeResult.success) {
      await this.sendRawEmail({
        to: adminEmail,
        subject: `[Newsletter] New Subscriber: ${email}`,
        html: `<p>New subscriber registered: <strong>${email}</strong></p><p>Fingerprint: ${connectionHash || "anonymous"}</p>`,
        text: `New subscriber registered: ${email}\nFingerprint: ${connectionHash || "anonymous"}`,
        tags: [
          { name: "category", value: "newsletter-admin-alert" },
        ],
      });
    }

    return welcomeResult;
  }
}

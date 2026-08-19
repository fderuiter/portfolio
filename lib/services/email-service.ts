import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import { env } from "@/lib/env";
import { ContactSubmission } from "@/lib/schemas";
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
 * Deep module encapsulating all outbound transactional email workflows.
 * Provides resilient hybrid fallback with simulation mode during development,
 * CI testing, or when Resend API credentials are not provisioned.
 */
export class EmailService {
  /**
   * Resets the cached Resend client instance (primarily used for test isolation).
   */
  static resetClient(): void {
    resendClient = null;
  }

  /**
   * Core dispatcher that transmits an email via Resend SDK or executes simulated delivery.
   */
  static async sendRawEmail(options: RawEmailOptions): Promise<EmailDispatchResult> {
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


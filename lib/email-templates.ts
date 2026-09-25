import DOMPurify from "isomorphic-dompurify";

/**
 * Escapes raw strings for safe inclusion in HTML templates.
 */
export function escapeHtml(input: string): string {
  if (!input) return "";
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  return String(sanitized)
    .replace(/&(?!(amp|lt|gt|quot|#039);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface ContactAdminEmailPayload {
  name: string;
  email: string;
  intent: string;
  subject: string;
  message: string;
  connectionHash?: string;
  submittedAt?: Date;
}

export interface ContactConfirmationEmailPayload {
  name: string;
  intent: string;
  subject: string;
  message: string;
}

export interface FeedbackNotificationPayload {
  caseStudySlug: string;
  takeaways: string[];
  comments: string;
  connectionHash?: string;
  submittedAt?: Date;
}

export interface RenderedEmail {
  html: string;
  text: string;
  subject: string;
}

/**
 * Renders an admin alert email for a new visitor inquiry.
 */
export function renderContactAdminEmail(
  payload: ContactAdminEmailPayload
): RenderedEmail {
  const safeName = escapeHtml(payload.name);
  const safeEmail = escapeHtml(payload.email);
  const safeIntent = escapeHtml(payload.intent.toUpperCase());
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br />");
  const safeHash = escapeHtml(payload.connectionHash || "anonymous-edge");
  const timestamp = (payload.submittedAt || new Date()).toUTCString();

  const emailSubject = `[Inquiry: ${safeIntent}] ${safeSubject} (from ${safeName})`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0e11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0e11; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #13151a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; background-color: #181b22; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: bold; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.25); padding: 3px 8px; border-radius: 6px;">
                      INBOUND INQUIRY // ${safeIntent}
                    </span>
                  </td>
                  <td align="right" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #71717a;">
                    ${timestamp}
                  </td>
                </tr>
              </table>
              <h1 style="margin: 16px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                ${safeSubject}
              </h1>
            </td>
          </tr>

          <!-- Sender Details -->
          <tr>
            <td style="padding: 20px 28px 12px 28px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0e11; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 12px 16px;">
                <tr>
                  <td style="font-size: 12px; color: #a1a1aa; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                    <strong>Sender:</strong> ${safeName} &lt;<a href="mailto:${safeEmail}" style="color: #06b6d4; text-decoration: none;">${safeEmail}</a>&gt;
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 4px; font-size: 11px; color: #71717a; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
                    <strong>Connection Fingerprint:</strong> ${safeHash}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 12px 28px 24px 28px;">
              <div style="font-size: 14px; line-height: 1.6; color: #e4e4e7; background-color: #181b22; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 16px;">
                ${safeMessage}
              </div>
            </td>
          </tr>

          <!-- Reply CTA -->
          <tr>
            <td style="padding: 0 28px 28px 28px;" align="center">
              <a href="mailto:${safeEmail}?subject=${encodeURIComponent("Re: " + payload.subject)}" style="display: inline-block; background-color: #06b6d4; color: #09090b; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; font-weight: bold; padding: 10px 24px; border-radius: 8px; text-decoration: none;">
                Reply to ${safeName} &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px; background-color: #0d0e11; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #52525b;">
                Dispatched by Portfolio Transactional Engine &bull; https://deruiter.dev
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `[INBOUND INQUIRY // ${safeIntent}]
Subject: ${payload.subject}
From: ${payload.name} <${payload.email}>
Timestamp: ${timestamp}
Connection Fingerprint: ${payload.connectionHash || "anonymous-edge"}

--------------------------------------------------
${payload.message}
--------------------------------------------------

Reply directly to: ${payload.email}`;

  return { html, text, subject: emailSubject };
}

/**
 * Renders an automated confirmation receipt email for the visitor.
 */
export function renderContactConfirmationEmail(
  payload: ContactConfirmationEmailPayload
): RenderedEmail {
  const safeName = escapeHtml(payload.name);
  const safeSubject = escapeHtml(payload.subject);
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br />");
  const emailSubject = `Message received: "${safeSubject}"`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0e11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0e11; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #13151a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; background-color: #181b22; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: bold; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.25); padding: 3px 8px; border-radius: 6px;">
                MESSAGE CONFIRMATION
              </span>
              <h1 style="margin: 16px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Thanks for reaching out, ${safeName}!
              </h1>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 24px 28px 16px 28px;">
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #d4d4d8;">
                Your message has been delivered to Frederick de Ruiter's inbox. I typically review inquiries and follow up within 24–48 hours.
              </p>
              <div style="background-color: #0d0e11; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.5; color: #a1a1aa;">
                <strong style="color: #ffffff; display: block; margin-bottom: 8px;">Your Message Copy:</strong>
                ${safeMessage}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; background-color: #0d0e11; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #71717a;">
                Frederick de Ruiter &bull; Software &amp; Systems Architecture &bull; <a href="https://deruiter.dev" style="color: #06b6d4; text-decoration: none;">deruiter.dev</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Thanks for reaching out, ${payload.name}!

Your message has been delivered to Frederick de Ruiter's inbox. I typically follow up within 24-48 hours.

Your Message Copy:
"${payload.subject}"
${payload.message}

--
Frederick de Ruiter
https://deruiter.dev`;

  return { html, text, subject: emailSubject };
}

/**
 * Renders an admin alert email when feedback is submitted on a case study.
 */
export function renderFeedbackNotificationEmail(
  payload: FeedbackNotificationPayload
): RenderedEmail {
  const safeSlug = escapeHtml(payload.caseStudySlug);
  const safeComments = escapeHtml(payload.comments).replace(/\n/g, "<br />");
  const safeTakeaways = payload.takeaways.map((t) => escapeHtml(t));
  const safeHash = escapeHtml(payload.connectionHash || "anonymous-edge");
  const timestamp = (payload.submittedAt || new Date()).toUTCString();

  const emailSubject = `[Case Study Feedback] New commentary on "${safeSlug}"`;

  const takeawaysHtml = safeTakeaways
    .map(
      (t) =>
        `<li style="margin-bottom: 4px; color: #f4f4f6; font-size: 13px;">${t}</li>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0e11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0e11; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #13151a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; background-color: #181b22; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: bold; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25); padding: 3px 8px; border-radius: 6px;">
                CASE STUDY FEEDBACK
              </span>
              <h1 style="margin: 16px 0 0 0; font-size: 18px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Feedback submitted on <code style="color: #06b6d4; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${safeSlug}</code>
              </h1>
            </td>
          </tr>

          <!-- Feedback Details -->
          <tr>
            <td style="padding: 20px 28px 12px 28px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #a1a1aa; text-transform: uppercase;">
                Key Takeaways Selected:
              </p>
              <ul style="margin: 0 0 16px 0; padding-left: 20px;">
                ${takeawaysHtml}
              </ul>

              <p style="margin: 0 0 8px 0; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #a1a1aa; text-transform: uppercase;">
                Visitor Commentary:
              </p>
              <div style="background-color: #0d0e11; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.5; color: #e4e4e7;">
                ${safeComments}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 28px; background-color: #0d0e11; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #52525b;">
                Fingerprint: ${safeHash} &bull; Timestamp: ${timestamp}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `[CASE STUDY FEEDBACK]
Target: ${payload.caseStudySlug}
Timestamp: ${timestamp}
Fingerprint: ${payload.connectionHash || "anonymous-edge"}

Takeaways:
${payload.takeaways.map((t) => `- ${t}`).join("\n")}

Comments:
${payload.comments}`;

  return { html, text, subject: emailSubject };
}

export interface NewsletterWelcomePayload {
  email: string;
  /** One-click unsubscribe link; rendered in the footer when present. */
  unsubscribeUrl?: string;
}

/**
 * Renders a confirmation / welcome receipt for a new newsletter subscriber.
 */
export function renderNewsletterWelcomeEmail(
  payload: NewsletterWelcomePayload
): RenderedEmail {
  const safeEmail = escapeHtml(payload.email);
  const emailSubject = `Welcome to Frederick de Ruiter's Engineering & Systems Dispatch`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${emailSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0e11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0e11; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #13151a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; background-color: #181b22; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: bold; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.25); padding: 3px 8px; border-radius: 6px;">
                      SYSTEMS DISPATCH // SUBSCRIBED
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 16px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                Welcome to the Engineering Dispatch
              </h1>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 24px 28px 16px 28px; font-size: 14px; line-height: 1.6; color: #d4d4d8;">
              <p style="margin: 0 0 16px 0;">
                Thanks for subscribing with <strong style="color: #ffffff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${safeEmail}</strong>.
              </p>
              <p style="margin: 0 0 16px 0;">
                You&#39;ll receive infrequent, high-density technical retrospectives covering:
              </p>
              <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #a1a1aa;">
                <li style="margin-bottom: 6px;"><strong style="color: #f4f4f6;">Formal Verification &amp; Logic ASTs</strong> — Deductive proof assistants, type theory, and constraint solvers.</li>
                <li style="margin-bottom: 6px;"><strong style="color: #f4f4f6;">Clinical Data Systems</strong> — CDISC CDASH, ODM-XML interoperability, and 21 CFR Part 11 architectures.</li>
                <li style="margin-bottom: 6px;"><strong style="color: #f4f4f6;">Embedded Simulators &amp; Browser Physics</strong> — Custom canvas physics, Monkey C runtimes, and WebAssembly.</li>
              </ul>
              <p style="margin: 0;">
                No spam, no fluff, zero automated tracking beacons.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px; background-color: #0d0e11; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #71717a;">
                Frederick de Ruiter &bull; Systems Architecture &amp; Engineering
              </p>
              <p style="margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; color: #52525b;">
                You received this email because you subscribed on deruiter.dev.${
                  payload.unsubscribeUrl
                    ? ` <a href="${escapeHtml(payload.unsubscribeUrl)}" style="color: #71717a;">Unsubscribe</a>.`
                    : ""
                }
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Welcome to the Engineering Dispatch

Thanks for subscribing with ${payload.email}.

You'll receive infrequent, high-density technical retrospectives covering:
- Formal Verification & Logic ASTs
- Clinical Data Systems & CDISC Interoperability
- Embedded Simulators & Browser Physics

No spam, zero tracking.

Frederick de Ruiter
Systems Architecture & Engineering
https://deruiter.dev${payload.unsubscribeUrl ? `\n\nUnsubscribe: ${payload.unsubscribeUrl}` : ""}`;

  return { html, text, subject: emailSubject };
}

/**
 * Wraps newsletter message content in the dispatch card layout shared by the
 * confirmation and post-announcement emails.
 */
function renderNewsletterCard(options: {
  title: string;
  badge: string;
  heading: string;
  bodyHtml: string;
  footerHtml: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0e11; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d0e11; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #13151a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 24px 28px; background-color: #181b22; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: bold; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.25); padding: 3px 8px; border-radius: 6px;">
                ${escapeHtml(options.badge)}
              </span>
              <h1 style="margin: 16px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.3;">
                ${escapeHtml(options.heading)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 28px 16px 28px; font-size: 14px; line-height: 1.6; color: #d4d4d8;">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 28px; background-color: #0d0e11; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; color: #52525b;">
              ${options.footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Payload for the double opt-in confirmation email. */
export interface NewsletterConfirmationPayload {
  email: string;
  confirmUrl: string;
}

/**
 * Renders the double opt-in email that asks a new subscriber to confirm the
 * address before any dispatch is sent to it.
 */
export function renderNewsletterConfirmationEmail(
  payload: NewsletterConfirmationPayload
): RenderedEmail {
  const subject = "Confirm your Systems Dispatch subscription";
  const safeUrl = escapeHtml(payload.confirmUrl);
  const html = renderNewsletterCard({
    title: subject,
    badge: "SYSTEMS DISPATCH // CONFIRM",
    heading: "One click to confirm",
    bodyHtml: `<p style="margin: 0 0 16px 0;">Someone, hopefully you, asked to subscribe <strong style="color: #ffffff; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${escapeHtml(payload.email)}</strong> to the Systems Dispatch.</p>
              <p style="margin: 0 0 20px 0;"><a href="${safeUrl}" style="display: inline-block; padding: 10px 16px; border-radius: 10px; background-color: #06b6d4; color: #0d0e11; font-weight: 700; text-decoration: none;">Confirm subscription</a></p>
              <p style="margin: 0; color: #a1a1aa;">If this wasn't you, ignore this email. Nothing is sent to an unconfirmed address.</p>`,
    footerHtml: "Frederick de Ruiter &bull; deruiter.dev",
  });
  const text = `Confirm your Systems Dispatch subscription

Someone, hopefully you, asked to subscribe ${payload.email} to the Systems Dispatch.

Confirm: ${payload.confirmUrl}

If this wasn't you, ignore this email. Nothing is sent to an unconfirmed address.`;
  return { html, text, subject };
}

/** Payload for a new-post announcement sent to confirmed subscribers. */
export interface NewsletterDispatchPayload {
  title: string;
  dek: string;
  postUrl: string;
  unsubscribeUrl: string;
}

/**
 * Renders the Systems Dispatch announcement of a newly published blog post.
 * Every dispatch carries a visible unsubscribe link alongside the
 * List-Unsubscribe headers the sender attaches.
 */
export function renderNewsletterDispatchEmail(
  payload: NewsletterDispatchPayload
): RenderedEmail {
  const subject = `New dispatch: ${payload.title}`;
  const html = renderNewsletterCard({
    title: subject,
    badge: "SYSTEMS DISPATCH // NEW POST",
    heading: payload.title,
    bodyHtml: `<p style="margin: 0 0 20px 0;">${escapeHtml(payload.dek)}</p>
              <p style="margin: 0;"><a href="${escapeHtml(payload.postUrl)}" style="display: inline-block; padding: 10px 16px; border-radius: 10px; background-color: #06b6d4; color: #0d0e11; font-weight: 700; text-decoration: none;">Read the post</a></p>`,
    footerHtml: `You receive the Systems Dispatch because you confirmed a subscription on deruiter.dev. <a href="${escapeHtml(payload.unsubscribeUrl)}" style="color: #71717a;">Unsubscribe</a> with one click.`,
  });
  const text = `${payload.title}

${payload.dek}

Read the post: ${payload.postUrl}

Unsubscribe with one click: ${payload.unsubscribeUrl}`;
  return { html, text, subject };
}

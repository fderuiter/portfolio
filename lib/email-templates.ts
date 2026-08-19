import DOMPurify from "isomorphic-dompurify";

/**
 * Escapes raw strings for safe inclusion in HTML templates.
 */
export function escapeHtml(input: string): string {
  if (!input) return "";
  const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
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
export function renderContactAdminEmail(payload: ContactAdminEmailPayload): RenderedEmail {
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
                Dispatched by Portfolio Transactional Engine &bull; https://www.deruiter.dev
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
export function renderContactConfirmationEmail(payload: ContactConfirmationEmailPayload): RenderedEmail {
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
                Frederick de Ruiter &bull; Software &amp; Systems Architecture &bull; <a href="https://www.deruiter.dev" style="color: #06b6d4; text-decoration: none;">deruiter.dev</a>
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
https://www.deruiter.dev`;

  return { html, text, subject: emailSubject };
}

/**
 * Renders an admin alert email when feedback is submitted on a case study.
 */
export function renderFeedbackNotificationEmail(payload: FeedbackNotificationPayload): RenderedEmail {
  const safeSlug = escapeHtml(payload.caseStudySlug);
  const safeComments = escapeHtml(payload.comments).replace(/\n/g, "<br />");
  const safeTakeaways = payload.takeaways.map((t) => escapeHtml(t));
  const safeHash = escapeHtml(payload.connectionHash || "anonymous-edge");
  const timestamp = (payload.submittedAt || new Date()).toUTCString();

  const emailSubject = `[Case Study Feedback] New commentary on "${safeSlug}"`;

  const takeawaysHtml = safeTakeaways
    .map(
      (t) => `<li style="margin-bottom: 4px; color: #f4f4f6; font-size: 13px;">${t}</li>`
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

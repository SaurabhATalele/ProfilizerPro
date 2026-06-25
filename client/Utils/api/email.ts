import { Resend } from "resend";
import type { ReactElement } from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender. Without a verified domain, Resend only allows the shared
// `onboarding@resend.dev` address (which can deliver to your own account in
// test mode). Set EMAIL_FROM to a verified-domain address in production.
const DEFAULT_FROM = "ProfilizePro <onboarding@resend.dev>";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  /** Raw HTML body. Provide this or `react`. */
  html?: string;
  /** A React element to render as the email body (takes precedence over html). */
  react?: ReactElement;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email via Resend. Returns a normalized result instead of throwing,
 * so callers can handle failures gracefully.
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  react,
  from,
}: SendEmailInput): Promise<SendEmailResult> => {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured");
    return { success: false, error: "Email service is not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || process.env.EMAIL_FROM || DEFAULT_FROM,
      to,
      subject,
      ...(react ? { react } : { html: html || "" }),
    } as Parameters<typeof resend.emails.send>[0]);

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Failed to send email:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
};

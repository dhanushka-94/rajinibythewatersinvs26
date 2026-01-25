/**
 * Email sending: Resend API (recommended for Vercel) or SMTP fallback.
 *
 * Resend API (Vercel-friendly, no SMTP ports):
 * - RESEND_API_KEY: your Resend API key (re_...)
 * When set, we use Resend HTTP API instead of SMTP. Use this on Vercel.
 *
 * SMTP fallback (Gmail, Brevo, Resend SMTP, etc.):
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
 *
 * From / Reply-To:
 * - SMTP_FROM_EMAIL, SMTP_FROM_NAME, SMTP_REPLY_TO
 */

import nodemailer from "nodemailer";
import { Resend } from "resend";

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "smtp.resend.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  return { host, port, secure, user, password };
}

export function isSmtpConfigured(): boolean {
  const { user, password } = getSmtpConfig();
  return Boolean(user && password);
}

export type SenderAddress = { fromEmail: string; fromName: string };

export function getSenderAddress(hotelEmail?: string, hotelName?: string): SenderAddress {
  const fromOverride = process.env.SMTP_FROM_EMAIL;
  const nameOverride = process.env.SMTP_FROM_NAME;
  const smtpUser = process.env.SMTP_USER;

  if (fromOverride) {
    return {
      fromEmail: fromOverride,
      fromName: nameOverride || hotelName || "Invoice System",
    };
  }

  if (smtpUser && hotelEmail) {
    const smtpDomain = smtpUser.split("@")[1];
    const hotelDomain = hotelEmail.split("@")[1];
    const useHotel = smtpDomain === hotelDomain;
    return {
      fromEmail: useHotel ? hotelEmail : smtpUser,
      fromName: hotelName || "Invoice System",
    };
  }

  return {
    fromEmail: hotelEmail || smtpUser || "noreply@example.com",
    fromName: hotelName || "Invoice System",
  };
}

export function isEmailConfigured(): boolean {
  return isResendConfigured() || isSmtpConfigured();
}

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  from: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  // Prefer Resend API when API key is set (works on Vercel; no SMTP ports)
  if (isResendConfigured()) {
    return sendViaResendApi({ to, subject, html, from, replyTo });
  }

  if (isSmtpConfigured()) {
    return sendViaSmtp({ to, subject, html, from, replyTo });
  }

  return {
    success: false,
    error:
      "Email is not configured. On Vercel: add RESEND_API_KEY in Project Settings → Environment Variables. " +
      "Locally: set RESEND_API_KEY in .env.local, or SMTP_USER + SMTP_PASSWORD for SMTP.",
  };
}

async function sendViaResendApi({
  to,
  subject,
  html,
  from,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  from: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY is not set." };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
      ...(replyTo && { replyTo }),
    });

    if (error) {
      console.error("Resend API error:", error);
      return {
        success: false,
        error: typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: string }).message)
          : String(error),
      };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email via Resend";
    console.error("Resend send error:", err);
    return { success: false, error: message };
  }
}

async function sendViaSmtp({
  to,
  subject,
  html,
  from,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  from: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { host, port, secure, user, password } = getSmtpConfig();

  if (!user || !password) {
    return {
      success: false,
      error:
        "SMTP is not configured. Set SMTP_USER and SMTP_PASSWORD. " +
        "On Vercel, prefer RESEND_API_KEY instead (no SMTP ports).",
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
    tls: { rejectUnauthorized: false },
  });

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: subject,
      ...(replyTo && { replyTo }),
    });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("SMTP send error:", err);
    return { success: false, error: message };
  }
}

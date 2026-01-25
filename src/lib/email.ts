/**
 * SMTP email sending. Supports any provider (Zoho, Gmail, Brevo, etc.)
 * and your own domain email.
 *
 * Env vars (use SMTP_* for provider-agnostic; ZOHO_* kept for backward compatibility):
 * - SMTP_HOST / ZOHO_SMTP_HOST
 * - SMTP_PORT / ZOHO_SMTP_PORT (default 587)
 * - SMTP_SECURE / ZOHO_SMTP_SECURE ("true" for 465)
 * - SMTP_USER / ZOHO_SMTP_USER (login email, e.g. bookings@yourdomain.com)
 * - SMTP_PASSWORD / ZOHO_SMTP_PASSWORD (app password, not login password)
 *
 * Own-domain "From" address (optional):
 * - SMTP_FROM_EMAIL: exact address to send as (e.g. invoices@yourdomain.com)
 * - SMTP_FROM_NAME: display name (defaults to hotel name)
 * If not set, we use hotel email when domain matches SMTP user, else SMTP user.
 */

import nodemailer from "nodemailer";

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST || process.env.ZOHO_SMTP_HOST || "smtp.zoho.com";
  const port = parseInt(
    process.env.SMTP_PORT || process.env.ZOHO_SMTP_PORT || "587",
    10
  );
  const secure =
    process.env.SMTP_SECURE === "true" ||
    process.env.ZOHO_SMTP_SECURE === "true" ||
    port === 465;
  const user = process.env.SMTP_USER || process.env.ZOHO_SMTP_USER;
  const password = process.env.SMTP_PASSWORD || process.env.ZOHO_SMTP_PASSWORD;

  return { host, port, secure, user, password };
}

export function isSmtpConfigured(): boolean {
  const { user, password } = getSmtpConfig();
  return Boolean(user && password);
}

export type SenderAddress = { fromEmail: string; fromName: string };

/**
 * Resolve "From" address for sending. Prefers SMTP_FROM_EMAIL / SMTP_FROM_NAME
 * (your own domain), then hotel email when domain matches SMTP user.
 */
export function getSenderAddress(hotelEmail?: string, hotelName?: string): SenderAddress {
  const fromOverride = process.env.SMTP_FROM_EMAIL;
  const nameOverride = process.env.SMTP_FROM_NAME;
  const smtpUser = process.env.SMTP_USER || process.env.ZOHO_SMTP_USER;

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
  const { host, port, secure, user, password } = getSmtpConfig();

  if (!user || !password) {
    return {
      success: false,
      error:
        "SMTP is not configured. Set SMTP_USER and SMTP_PASSWORD (or ZOHO_SMTP_USER / ZOHO_SMTP_PASSWORD) in .env.local.",
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

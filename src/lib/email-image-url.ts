/**
 * Email logo URL. Override via EMAIL_LOGO_URL in .env.local.
 */
const DEFAULT_LOGO_URL =
  "https://www.rajinihotels.com/_next/image?url=%2Flogo.png&w=256&q=75";

export function getEmailImageBaseUrl(): string {
  const base =
    process.env.EMAIL_IMAGE_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.rajinihotels.com";
  return base.replace(/\/$/, "");
}

/**
 * Absolute URL for the invoice email logo.
 * Uses EMAIL_LOGO_URL if set, otherwise the default rajinihotels.com logo.
 */
export function getAbsoluteLogoUrl(_logoPath?: string): string {
  return (
    process.env.EMAIL_LOGO_URL ||
    DEFAULT_LOGO_URL
  );
}

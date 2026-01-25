# Resend email setup

Invoice emails and test emails are sent via **Resend** SMTP.

## Configuration

**`.env.local`**:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASSWORD=re_xxxxxxxx   # Your Resend API key
SMTP_FROM_EMAIL=noreply@rajinihotels.com
SMTP_FROM_NAME=Rajini by The Waters Hotel
SMTP_REPLY_TO=bookings@rajinihotels.com
EMAIL_IMAGE_BASE_URL=https://rajinihotels.com
```

- **SMTP_FROM_EMAIL**: Sender address (e.g. `noreply@rajinihotels.com`).
- **SMTP_REPLY_TO**: Where replies go (e.g. `bookings@rajinihotels.com`). Set this so recipients can reply to a monitored inbox.
- **EMAIL_IMAGE_BASE_URL**: Your app’s **public URL** (e.g. `https://rajinihotels.com` or `https://app.rajinihotels.com`). The logo is loaded from `{EMAIL_IMAGE_BASE_URL}/api/email-assets/logo`.

## Requirements

1. **Resend account** – [resend.com](https://resend.com) → Sign up
2. **API key** – Dashboard → **API Keys** → Create → copy the `re_...` key
3. **Domain verification** – Dashboard → **Domains** → Add **rajinihotels.com**  
   Add the DNS records (MX, TXT, etc.) at your DNS provider. Emails can only be sent from verified domains.
4. **Logo** – The app serves the logo at `/api/email-assets/logo`. Deploy this app at the URL you set for `EMAIL_IMAGE_BASE_URL` (e.g. `https://rajinihotels.com` or `https://app.rajinihotels.com`) so the logo loads in emails.

## Test

1. Restart the dev server after changing `.env.local`.
2. Go to **Test Email** (`/test-email`), enter a recipient, and send.
3. Send an invoice email from an invoice detail page.

## Troubleshooting

- **"Domain not verified"** – Complete domain verification in Resend for `rajinihotels.com`.
- **"Invalid API key"** – Regenerate the key in Resend and update `SMTP_PASSWORD`.
- **Connection errors** – Ensure port **465** and **SMTP_SECURE=true**. Some networks block 465; try **587** with **SMTP_SECURE=false** if needed.
- **Images not loading / Gmail warnings** – Set `EMAIL_IMAGE_BASE_URL` to your app’s deployed URL. The logo is served at `{BASE}/api/email-assets/logo`.

## Security

- Never commit `.env.local` or your API key.
- Rotate your API key if it was ever exposed.

# Resend email setup

Invoice and test emails are sent via **Resend**. Use the **Resend API** (not SMTP) when deployed on **Vercel** — SMTP often fails there due to blocked outbound ports.

## Vercel (recommended): Resend API

**Vercel → Project → Settings → Environment Variables:**

| Name | Value | Notes |
|------|--------|------|
| `RESEND_API_KEY` | `re_xxxx...` | Resend Dashboard → API Keys |
| `SMTP_FROM_EMAIL` | `noreply@rajinihotels.com` | Verified domain email |
| `SMTP_FROM_NAME` | `Rajini by The Waters Hotel` | Display name |
| `SMTP_REPLY_TO` | `bookings@rajinihotels.com` | Reply-to address |

When `RESEND_API_KEY` is set, the app uses Resend’s **HTTP API** (no SMTP). No ports, no connection timeouts — works on Vercel.

## Local dev: API or SMTP

**`.env.local`** (same vars as above for API):

```env
RESEND_API_KEY=re_xxxxxxxx
SMTP_FROM_EMAIL=noreply@rajinihotels.com
SMTP_FROM_NAME=Rajini by The Waters Hotel
SMTP_REPLY_TO=bookings@rajinihotels.com
```

Optionally use **SMTP** locally (e.g. `SMTP_HOST=smtp.resend.com`, `SMTP_USER=resend`, `SMTP_PASSWORD=re_...`). If both are set, **Resend API is used first**; SMTP is only a fallback when `RESEND_API_KEY` is missing.

## Requirements

1. **Resend account** – [resend.com](https://resend.com) → Sign up  
2. **API key** – Dashboard → **API Keys** → Create → copy the `re_...` key  
3. **Domain verification** – Dashboard → **Domains** → Add your domain, add DNS records. Emails must be sent from a verified domain.

## Test

1. Restart dev server or redeploy after changing env vars.  
2. **Test Email** (`/test-email`) → enter recipient → Send.  
3. Send an invoice email from an invoice detail page.

## Troubleshooting

- **"Email is not configured" / "SMTP is not configured... use RESEND_API_KEY"** – Your **deployed** app (e.g. Vercel) does **not** use `.env.local`. Add `RESEND_API_KEY` in **Vercel → Project → Settings → Environment Variables** for Production (and Preview if you test there). Redeploy after adding.
- **SMTP errors on Vercel** – Use **Resend API**: set `RESEND_API_KEY` in Vercel env vars. Do **not** rely on SMTP (port 465/587) on Vercel.  
- **"Domain not verified"** – Finish domain verification in Resend.  
- **"Invalid API key"** – Regenerate the key in Resend and update `RESEND_API_KEY`.  
- **Images not loading** – Set `EMAIL_LOGO_URL` or ensure the logo is served from your app’s deployed URL.

## Security

- Never commit `.env.local` or your API key.  
- Add env vars only in Vercel (or your host) UI, not in code.  
- Rotate the API key if it was ever exposed.

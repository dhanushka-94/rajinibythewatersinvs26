# Login Page – Enhancement Ideas

Practical ideas to improve the **Login** page (`/login`). The app uses cookie-based sessions (`invoice-session`), username/password, and roles (admin, manager, staff, viewer). Ideas are grouped by area, with **effort** (S/M/L).

---

## ✅ Implemented (excluding §7 Optional/Future)

**UX & accessibility:** Show/hide password toggle; clear error on input change; remember username + “Remember me” (localStorage); “Forgot password?” → /forgot-password; aria-labels, role=alert, focus management; loading skeleton (Suspense fallback); disable submit when username or password empty.

**Visual & layout:** Sri Lanka time clock (top-right); logo fallback on error; “Visit website” when `hotelInfo.website` exists; reserved space for logo (min-height).

**Security & validation:** Rate limiting on login API (5 attempts / 15 min per IP); generic “Invalid username or password” for 401; allow password managers (autocomplete=username, current-password); validate redirect (same-origin only, no `//`).

**Feedback & errors:** Toast on success; network vs auth error (5xx vs 401, 429); “Try again” in error UI; session-expired message when `?expired=1`; clear session cookie when expired/invalid (middleware).

**Redirect & post-login:** “Return to…” hint when `?redirect=` set; brief delay before redirect after success.

**Technical:** Hotel info via `/api/hotel-info`; handle fetch error with fallback; skeleton fallback for Suspense.

**Forgot-password:** Placeholder page at /forgot-password (contact admin); added to public routes and conditional layout.

**§7 (Optional/Future)** not implemented: Magic link, SSO, 2FA, login history, consent/terms.

---

## Current State (Summary)

- **Layout:** Centered card on gradient background (blue–indigo).
- **Content:** Hotel logo, “Invoice Management System”, hotel name; username + password form; error banner; Login button; “Powered by / Developed by” footer.
- **Behaviour:** Redirect via `?redirect=`; loading state; focus on username; golden accent `#D4AF37`.
- **Suspense:** Wraps form for `useSearchParams`; “Loading...” fallback.

---

## 1. UX & Accessibility

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 1.1 | **Show/hide password toggle** | Let users confirm what they typed | S |
| 1.2 | **Clear error on input change** | Error disappears when user corrects credentials | S |
| 1.3 | **Remember username** | `localStorage`; optional “Remember me” | S |
| 1.4 | **“Forgot password?” link** | Placeholder for future reset flow | S |
| 1.5 | **aria-labels, roles, focus management** | Better screen-reader and keyboard UX | S |
| 1.6 | **Loading skeleton** | Replace “Loading...” with skeleton card | S |
| 1.7 | **Enter to submit** | Already standard for forms; ensure no duplicate submit | - |
| 1.8 | **Disable submit when fields empty** | Avoid unnecessary requests | S |

---

## 2. Visual & Layout

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 2.1 | **Sri Lanka time on login** | Small clock (e.g. “Sri Lanka 14:32”) for consistency | S |
| 2.2 | **Subtle branding** | Use hotel colours/logo more consistently | S |
| 2.3 | **Responsive tweaks** | Safe padding, font sizes on small screens | S |
| 2.4 | **Dark mode** | Optional dark theme for login | M |
| 2.5 | **Animated gradient or pattern** | Slightly more distinctive background | M |
| 2.6 | **Logo fallback** | Placeholder if `logoPath` fails to load | S |
| 2.7 | **“Back to site” / “Visit website”** | Link to hotel site when available | S |

---

## 3. Security & Validation

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 3.1 | **Rate limiting (API)** | Throttle failed attempts per IP/user | M |
| 3.2 | **Generic error message** | “Invalid username or password” for auth failures (no “user exists”) | S |
| 3.3 | **No autocomplete=off** | Allow password managers; avoid `autocomplete="off"` on username | S |
| 3.4 | **CAPTCHA / bot protection** | If you add public-facing login later | L |
| 3.5 | **HTTPS reminder** | Dev-only note or checklist for production | S |

---

## 4. Feedback & Errors

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 4.1 | **Toast on success** | “Logged in” before redirect | S |
| 4.2 | **Clear, accessible error** | Keep error in alert, ensure focus moves to it | S |
| 4.3 | **Network error vs auth error** | Different messages for 5xx vs 401 | S |
| 4.4 | **Retry / “Try again”** | Button to resubmit after error | S |
| 4.5 | **Session expired message** | When redirected from middleware with `?expired=1` | S |

---

## 5. Redirect & Post-Login

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 5.1 | **Validate redirect URL** | Only allow same-origin paths; avoid open redirect | S |
| 5.2 | **Default redirect** | Keep `/` as default when no `?redirect=` | - |
| 5.3 | **“Return to…” hint** | e.g. “You’ll be redirected to /invoices” when `redirect` is set | S |
| 5.4 | **Redirect after brief delay** | Optional 0.5s so user sees “Logged in” | S |

---

## 6. Technical & Performance

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 6.1 | **Preconnect / preload** | For logo or external assets if used | S |
| 6.2 | **Avoid layout shift** | Reserve space for logo so page doesn’t jump | S |
| 6.3 | **Suspense fallback** | Skeleton instead of “Loading...” | S |
| 6.4 | **Handle hotel info load error** | Show form even if logo/name fetch fails | S |

---

## 7. Optional / Future

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 7.1 | **Magic link / OTP** | Passwordless login (needs email/SMS) | L |
| 7.2 | **SSO / OAuth** | Google, Microsoft, etc. | L |
| 7.3 | **2FA** | TOTP or backup codes | L |
| 7.4 | **Login history** | Last login time, IP (admin view) | M |
| 7.5 | **Consent / terms** | “By logging in you agree to…” checkbox | M |

---

## Quick Wins (recommended first)

1. **Show/hide password** – Eye icon to toggle type.
2. **Clear error on input change** – Remove error when user edits username or password.
3. **Remember username** – `localStorage` + optional “Remember me”.
4. **Loading skeleton** – Replace “Loading...” with skeleton card in Suspense fallback.
5. **Logo load error** – Fallback image or placeholder if logo fails.
6. **Generic auth error** – Use “Invalid username or password” for 401.
7. **Network vs auth error** – Different message for 5xx.
8. **Validate redirect** – Only allow same-origin `?redirect=` paths.
9. **Disable submit when empty** – Both fields required before enabling Login.
10. **aria-labels** – On form, inputs, and submit button.
11. **“Forgot password?”** – Link (can 404 for now) for future reset.
12. **Sri Lanka time** – Small clock in corner or under form.

---

## Next Phase

- **“Return to…” hint** when `?redirect=` is present.
- **Session expired** – `?expired=1` handling and message.
- **Rate limiting** on login API.
- **Dark mode** toggle.
- **“Back to site”** link when hotel URL exists.

---

## Out of Scope / Notes

- **Password reset** – Needs email flow, tokens; document as future work.
- **2FA / SSO** – Larger changes; mention only.
- **Session cookie** – Already httpOnly, secure in prod; no change needed for ideas above.
- **Middleware** – Redirect and `?redirect=` stay as-is unless you add `?expired=1` etc.

---

## Implementation Notes

- Use **Sri Lanka time** for any clock (`todaySL`, or `Asia/Colombo` via `Intl`).
- **Remember me:** store only username (or a non-sensitive identifier), never password.
- **Redirect:** use `new URL(redirect, origin)` or similar to restrict to same origin.
- **Focus:** after error, `focus()` the error region or first invalid field for a11y.
- Keep **hotel branding** (logo, name) from `getHotelInfo`; enhance fallbacks and layout only.

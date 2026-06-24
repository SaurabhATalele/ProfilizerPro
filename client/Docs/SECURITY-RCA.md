# RCA: ProfilizePro Security Audit

## Summary

A code-level security review of the ProfilizePro client (Next.js App Router + MongoDB/Mongoose, JWT auth) found **multiple critical and high-severity vulnerabilities**, most reducing to one principle violation:

> **Never trust input from the client, and never rely on the client to enforce a security control.**

The most serious issues are a **full account-takeover password-reset flow** (the OTP is sent to the browser and never verified server-side), **unauthenticated admin/write API routes** (anyone can create, edit, or delete assessments), and a **forgeable score/attempt submission** (the client computes and submits its own score and target email — the exact class of bug described in the original leaderboard RCA). Several supporting weaknesses (no token expiry, JS-readable auth cookie, weak/committed secrets, no rate limiting) compound the impact.

**Overall severity:** Critical. Account takeover + broken access control are directly exploitable today with nothing more than DevTools / `curl`.

This document is a findings register intended for remediation planning. No code was changed as part of writing it.

---

## How to read this

Each finding has: **What**, **Where** (file), **Root cause**, **Exploit**, **Impact**, **Severity**, and **Fix**. Severities: Critical / High / Medium / Low.

---

## Vulnerabilities found

### V1 — Password reset is a full account-takeover (OTP returned to the client, never verified server-side)
- **Severity:** Critical (account takeover)
- **Where:** `Utils/api/Controllers/UserController.ts` (`sendEmail`), `app/api/v1/users/generate-otp/route.ts`, `Components/Otp/Otp.tsx`, `Components/Otp/Reset.tsx`, `app/api/v1/users/reset-pass/route.ts`, `UserController.changePassword`
- **What:** The "forgot password" OTP is generated server-side but **returned in the HTTP response body** (`return { ..., otp }`), and the client compares it (`Otp.tsx`: `if (userOtp === otp)`). Worse, the actual reset endpoint `POST /api/v1/users/reset-pass` calls `changePassword({ email, password })` with **no OTP / token / session check at all**.
- **Root cause:** Security control (OTP verification) placed entirely on the untrusted client; the server-side reset has no verification of email ownership.
- **Exploit:**
  1. `POST /api/v1/users/reset-pass` with `{ "email": "victim@x.com", "password": "attacker123" }` → password changed. No OTP needed.
  2. Or read the OTP straight from the `generate-otp` JSON response for any email.
- **Impact:** Any account (including admins) can be taken over by knowing only the email address.
- **Fix:** Verify email ownership server-side before resetting. Reuse the registration pattern already in the codebase: issue a signed, short-lived token (HMAC/JWT) or store an OTP hash server-side (HttpOnly cookie or DB), and require it in `reset-pass`. **Never** return the OTP in the response.

### V2 — Admin / write API routes have no authorization
- **Severity:** Critical (broken access control)
- **Where:** `app/api/v1/assignment/route.ts` (`POST` create, `PUT` updateScore, `PATCH` updateAssignment, `DELETE`), and supporting controllers in `Utils/api/Controllers/AssignmentController.ts`. Admin is gated **only** in the UI (`user.isAdmin` in `Components/Admin/*`, `app/admin/page.tsx`).
- **What:** The assessment CRUD endpoints perform no token/role check. The UI hides admin features from non-admins, but the API routes are open to anyone.
- **Root cause:** Authorization enforced on the client (conditional rendering) rather than at the API boundary.
- **Exploit:** `fetch('/api/v1/assignment', { method: 'DELETE', body: JSON.stringify({ id }) })` or `POST` a new assignment — from any browser console, logged in or not.
- **Impact:** Any user (or anonymous) can create, modify, or delete every assessment in the platform. Destructive + integrity.
- **Fix:** Add server-side auth+admin checks to every mutating route (verify JWT, load user, require `isAdmin`). Centralize in a helper and apply to POST/PUT/PATCH/DELETE.

### V3 — Forgeable scores and cross-user attempt injection (`updateScore`)
- **Severity:** High (integrity / impersonation)
- **Where:** `AssignmentController.updateScore` via `PUT /api/v1/assignment`; client computes score in `Components/examDash/ExamDash.tsx` and sends `{ id, email, score, total, questions }`.
- **What:** The server stores the client-supplied `score`, `total`, and **`email`** directly into `attemptedBy`. Unauthenticated, and the `email` is chosen by the caller.
- **Root cause:** Trust-boundary violation — score is computed on the client and the attempt's owner identity is taken from the request body instead of the session.
- **Exploit:** `PUT /api/v1/assignment` with any `email`, `score`, `total` → record an arbitrary score attributed to any user. This is the same class as the leaderboard-forgery RCA.
- **Impact:** Stats/dashboard integrity destroyed; one user can pollute another user's attempt history; admin analytics (`getTopNCandidates`, `getCandidatesByMonths`) become untrustworthy.
- **Fix:** Require auth; derive `email`/owner from the verified JWT, not the body. Recompute correctness server-side from stored correct answers rather than trusting `score`. (Custom assessments already resolve the owner from the JWT in `createOrUpdateCustomAssignment` — apply the same pattern here.)

### V4 — JWTs never expire
- **Severity:** High
- **Where:** `Utils/api/Models/Users.ts` → `GenerateToken` calls `jwt.sign(user, secret)` with **no `expiresIn`**.
- **Root cause:** Missing token lifetime.
- **Exploit:** A token leaked once (XSS, shared device, logs) is valid forever; logout only deletes the local copy, it cannot be invalidated.
- **Impact:** Permanent credential if stolen; no way to force re-auth.
- **Fix:** Sign with `expiresIn` (e.g., `"7d"`); consider refresh tokens / server-side revocation list if stronger guarantees are needed.

### V5 — Auth cookie is JS-readable and not hardened
- **Severity:** High
- **Where:** `UserController.loginUser` → `(await cookies()).set("token", token)` (no flags). Token is also stored in `localStorage` client-side (`Login.tsx`, `getUser` reads it).
- **What:** The auth cookie is set without `httpOnly`, `secure`, or `sameSite`, and the token additionally lives in `localStorage`.
- **Root cause:** Cookie not hardened; token duplicated into JS-accessible storage.
- **Exploit:** Any XSS reads the token from `localStorage`/cookie → full account compromise. Lax cookie defaults also widen CSRF exposure for cookie-trusting endpoints.
- **Impact:** Token theft via XSS; CSRF surface.
- **Fix:** Set the auth cookie `httpOnly: true, secure: true, sameSite: "lax"`. Prefer the HttpOnly cookie as the single source of truth and stop storing the token in `localStorage`. Add CSRF protection for any cookie-authenticated mutation.

### V6 — Weak, hardcoded, and committed secrets
- **Severity:** High
- **Where:** `.env.local` (in the repo): `SECRET_KEY=thisisthesecretkeythathasnottobechangedatanypointoftime`, plus a real-looking `GOOGLE_GENERATIVE_AI_API_KEY`, Gmail `PASS_KEY`, etc. `SECRET_KEY` is imported widely (`Utils/constants.ts`).
- **Root cause:** Predictable signing secret + secrets committed to the working tree.
- **Exploit:** A guessable/known `SECRET_KEY` lets an attacker **forge valid JWTs** (including `isAdmin: true`) → instant admin. Committed API keys/passwords are exposed to anyone with repo access / git history.
- **Impact:** Complete auth bypass + leaked third-party credentials.
- **Fix:** Generate a high-entropy random `SECRET_KEY`; rotate all committed credentials (Gemini key, Gmail app password); ensure `.env*` is git-ignored and purge from history; load secrets only from the environment.

### V7 — No rate limiting on auth-sensitive endpoints
- **Severity:** Medium (High in combination)
- **Where:** `login`, `register`, `generate-otp`, `send-registration-otp`, `reset-pass` routes.
- **Root cause:** No throttling.
- **Exploit:** Brute-force passwords; brute-force the **4-digit OTP** (10,000 combinations) which is generated with `Math.random()` (`generateOTP`) — not cryptographically random; enumerate accounts; spam emails (cost/abuse).
- **Impact:** Credential brute force, OTP guessing, email-bomb / cost abuse.
- **Fix:** Per-IP and per-account rate limits + lockout/backoff on auth + OTP endpoints. Increase OTP length to 6, generate with `crypto.randomInt`, cap attempts, expire quickly.

### V8 — User/account enumeration
- **Severity:** Low/Medium
- **Where:** `loginUser` returns `404 "User Not Found"` vs `403 "Incorrect Password"`; `generate-otp`/`sendEmail` returns `"User Not Found"`; register returns `"User Already Exists"`.
- **Root cause:** Distinct responses reveal whether an email/username exists.
- **Exploit:** Probe which emails are registered.
- **Impact:** Aids targeted phishing/brute force; privacy.
- **Fix:** Use uniform, generic responses ("If an account exists, a code was sent" / "Invalid credentials").

### V9 — Possible NoSQL operator injection in auth queries
- **Severity:** Medium (needs verification)
- **Where:** `loginUser` / `sendEmail` / others doing `User.findOne({ email })` with `email` taken straight from `req.json()`.
- **Root cause:** Unvalidated object passed into a query filter.
- **Exploit:** Bodies like `{ "email": { "$gt": "" } }` can subvert intended equality matching on loosely-typed paths. Mongoose casts to the schema's `String` type which mitigates many cases, but inputs are not explicitly validated/typed before querying.
- **Impact:** Potential auth/logic bypass depending on query shape.
- **Fix:** Validate/coerce inputs to `string` (the project already uses Zod — `Utils/validation/`); reject non-string `email`/`password`. Apply consistently to all request bodies at the API boundary.

### V10 — Route matcher middleware is a no-op (no real route protection)
- **Severity:** Medium
- **Where:** `middleware.ts` returns `NextResponse.next()` for `/dashboard`, `/admin`, `/test/*` — it enforces nothing. A second `verifyToken` helper exists in `Utils/api/Controllers/middleware.ts` but is **not wired into any route**.
- **Root cause:** Protection scaffolding present but unused; all gating is client-side.
- **Exploit:** Navigate directly to protected pages / call APIs without a session (compounds V2).
- **Impact:** No server-enforced access control on "protected" areas.
- **Fix:** Implement real checks in `middleware.ts` (verify token, redirect unauthenticated; check `isAdmin` for `/admin`) and/or enforce per-route in the API handlers.

### V11 — `reset-pass` closes the shared Mongoose connection
- **Severity:** Medium (availability / correctness)
- **Where:** `app/api/v1/users/reset-pass/route.ts` → `mongoose.connection.close()` after each request.
- **Root cause:** Closing a process-wide pooled connection per request.
- **Exploit/Impact:** Subsequent DB operations across the app can fail or thrash reconnects (DoS-ish, flaky behavior).
- **Fix:** Remove the `close()` call; rely on the shared connection (`connectDB`).

### V12 — Verbose errors and sensitive logging
- **Severity:** Low
- **Where:** Many controllers `console.log(error)` and some return raw `error.message` to the client (e.g., `registerUser`, `getAttemptedAssignments`). OTPs are `console.log`ed (`sendEmail`: `console.log("otp is", otp)`).
- **Root cause:** Debug logging left in; raw errors surfaced.
- **Impact:** Information disclosure (stack/DB details to clients; OTPs in server logs).
- **Fix:** Return generic error messages; remove secret/OTP logging; use a leveled logger with redaction.

### V13 — Authorization header parsing is inconsistent / fragile
- **Severity:** Low
- **Where:** `verifyUser` uses `headersList.get("authorization")!.split(" ")[1]` (expects `Bearer`), while `getAttemptedAssignments` uses `split(" ")[0]` (expects raw token); non-null assertions throw on missing header.
- **Root cause:** No single auth-extraction utility; mixed conventions.
- **Impact:** Brittle auth, harder to reason about, easy to introduce bypasses.
- **Fix:** One `getAuthUser(req)` helper that accepts `Bearer <token>`, verifies, and returns the user or null; use everywhere.

---

## The single root cause

Like the leaderboard RCA, the findings collapse to **trusting the client**:

- The client is trusted to **verify the OTP** (V1) and to **enforce admin access** (V2, V10).
- The client is trusted to **report the score and the owner email** (V3).
- The token has **no expiry** and lives **where JS can read it** (V4, V5).
- The signing secret is **guessable and committed**, so even the token itself can be forged (V6).

Every control that matters must move to, or be duplicated on, the server.

---

## Severity overview

| ID | Title | Severity |
|----|-------|----------|
| V1 | Password-reset account takeover (OTP client-side, reset unverified) | Critical |
| V2 | Unauthenticated admin/write API routes | Critical |
| V3 | Forgeable scores + cross-user attempt injection | High |
| V4 | JWTs never expire | High |
| V5 | JS-readable, unhardened auth cookie + localStorage token | High |
| V6 | Weak, hardcoded, committed secrets | High |
| V7 | No rate limiting; weak 4-digit `Math.random` OTP | Medium |
| V8 | Account enumeration | Low/Medium |
| V9 | Possible NoSQL operator injection | Medium |
| V10 | No-op route middleware (no server-side gating) | Medium |
| V11 | `reset-pass` closes shared DB connection | Medium |
| V12 | Verbose errors / OTP logging | Low |
| V13 | Inconsistent auth header parsing | Low |

---

## Remediation plan (suggested order)

1. **Stop the bleeding (Critical):**
   - V1: Verify reset server-side (signed short-lived token or hashed OTP in HttpOnly cookie/DB); never return the OTP. Reuse the registration-OTP pattern already in `UserController`.
   - V2/V10: Add a server-side `requireAuth` / `requireAdmin` guard and apply to all mutating API routes and `/admin`.
   - V6: Rotate and randomize `SECRET_KEY` + all committed third-party keys; remove `.env*` from version control.
2. **High:**
   - V3: Auth + derive owner from JWT + recompute correctness server-side for `updateScore`.
   - V4: Add JWT `expiresIn`.
   - V5: Harden cookie (`httpOnly/secure/sameSite`); drop `localStorage` token; add CSRF protection.
3. **Medium/Low:**
   - V7 rate limiting + stronger OTP (`crypto.randomInt`, 6 digits, attempt cap).
   - V9 Zod-validate all request bodies (string coercion).
   - V8 uniform responses; V11 remove `connection.close()`; V12 strip OTP/error logging; V13 single auth helper.

---

## Verification checklist (after fixes)

- [ ] `POST /api/v1/users/reset-pass` rejects requests lacking a valid server-issued verification token.
- [ ] `generate-otp` response body contains **no** OTP.
- [ ] Mutating `assignment` routes return 401/403 without a valid admin token (test via `curl`).
- [ ] `PUT /api/v1/assignment` ignores body `email`/`score`; owner from JWT; correctness recomputed.
- [ ] JWTs include `exp`; expired tokens are rejected.
- [ ] Auth cookie is `HttpOnly; Secure; SameSite`; no token in `localStorage`.
- [ ] `SECRET_KEY` is random + env-only; old committed secrets rotated; `.env*` git-ignored.
- [ ] Auth + OTP endpoints are rate-limited; OTP is 6-digit crypto-random with attempt caps.
- [ ] Request bodies validated with Zod; non-string `email`/`password` rejected.
- [ ] `reset-pass` no longer closes the shared Mongoose connection.
- [ ] `npm run build` + typecheck pass.

---

## Reference: key files

| File | Relevance |
|------|-----------|
| `Utils/api/Controllers/UserController.ts` | `sendEmail` (returns OTP), `changePassword`, `loginUser` (cookie), `registerUser` |
| `app/api/v1/users/reset-pass/route.ts` | Unverified password reset (V1, V11) |
| `app/api/v1/users/generate-otp/route.ts` | Returns OTP to client (V1) |
| `Components/Otp/Otp.tsx`, `Reset.tsx` | Client-side OTP compare + reset call (V1) |
| `app/api/v1/assignment/route.ts` | Unauthenticated CRUD (V2, V3) |
| `Utils/api/Controllers/AssignmentController.ts` | `updateScore` trusts client score/email (V3) |
| `Utils/api/Models/Users.ts` | `GenerateToken` (no expiry), `ValidateToken` (V4) |
| `middleware.ts` | No-op route matcher (V10) |
| `Utils/api/Controllers/middleware.ts` | Unused `verifyToken` helper (V10, V13) |
| `Utils/constants.ts` / `.env.local` | `SECRET_KEY` + committed secrets (V6) |

> Note: the original "Leaderboard Score Integrity" RCA that previously lived in this file referenced a different project (Supabase/Thock Mania) and has been replaced by this ProfilizePro-specific audit. The leaderboard RCA remains a good design reference for the server-authoritative scoring pattern that V3 should adopt.

---

## Remediation status (this pass)

| ID | Status | Notes |
|----|--------|-------|
| V1 | **Fixed** | Reset OTP now verified server-side via a hashed, 10-min HttpOnly `reset_otp` cookie (JWT). OTP no longer returned to the client; `changePassword` requires a matching code + 8-char min. |
| V2 | **Fixed** | `assignment` POST/PATCH/DELETE require admin (`requireAdmin`); PUT requires auth. Server-side `Utils/api/auth.ts`. |
| V3 | **Partial** | Owner email now derived from the JWT (no cross-user injection); score/total validated and bounded (`0 ≤ score ≤ total`). True server recompute still needs server-owned questions (tests are AI-generated client-side) — documented residual, same pattern as the leaderboard RCA. |
| V4 | **Fixed** | `GenerateToken` signs with `expiresIn: "7d"`. |
| V5 | **Partial** | Auth cookie now `httpOnly + sameSite=lax + secure (prod)`; `getUser`/Login read the token from `localStorage`. Residual: token still lives in `localStorage` (XSS-reachable). Full fix = cookie-only session; deferred (larger auth migration). |
| V6 | **Fixed** | Strong random `SECRET_KEY` set; `.env*.local` already git-ignored. **Action still required:** rotate the committed Gemini key + Gmail app password and keep secrets env-only. |
| V7 | **Partial** | OTP now `crypto.randomInt` (was `Math.random`). Kept 4 digits to avoid changing the OTP input UI. Rate limiting **not** added (needs a store) — deferred. |
| V8 | **Open** | Left as-is; changing login 404/403 messages would alter existing client toast behavior. |
| V9 | **Partial** | `email`/`password` coerced/validated to `string` in `loginUser`/`changePassword`/`sendEmail`; `id` validated in `updateScore`. Mongoose string-casting covers the rest. Full Zod-at-every-boundary deferred. |
| V10 | **Open** | `middleware.ts` still a no-op; access control now enforced in the API handlers (V2) instead. Page-level redirect middleware deferred. |
| V11 | **Fixed** | Removed `mongoose.connection.close()` from `reset-pass`. |
| V12 | **Fixed** | Removed OTP/`email` logging; auth-header log removed; generic error messages in routes. |
| V13 | **Fixed** | Single `getAuthUser()` helper (`Utils/api/auth.ts`) handles `Bearer`/raw/cookie token. |

**Deferred (explicitly out of this pass):** full RSC migration / "POST-only on frontend" rearchitecture, cookie-only session (drop `localStorage`), persistent rate limiting, and page-level auth middleware. These are larger architectural changes; the criticals (V1, V2) and most highs are closed.

# Rhockstar Connect: Laptop Handoff (Work Laptop to Personal Laptop)

Written 14 Nov 2026 on the work laptop. At handoff, `main` was at commit `75ee048`. Nothing was uncommitted, unpushed or stashed.

> **This repo is PUBLIC.** No secret values are in this folder, and none must ever be added here.
> `.env.local` must be rebuilt on the new machine. Section 2 explains how.

## 1. Working rules
These come from `AGENTS.md` in the repo root, so they are already on the new machine:
- Before fixing a bug, reproduce it with evidence.
- Before every push, run `npx tsc --noEmit`, then `npm run test:auth` (5 probes), then `npm run build` (exit 0).
- Guest onboarding uses server API routes only (Firebase Admin).
- Collaborator (Eniola) branches: fetch, review the diff, build and smoke-test before merging.

## 2. Rebuilding `.env.local` (secrets are NOT in git)

The file `.env.local` lives in the project root and is gitignored. It needs these 11 keys, plus the 7 Firebase web-config keys listed below the table:

| Key | Where to get the value |
|---|---|
| `FIREBASE_PROJECT_ID` | `rhockstar-connect-v2` |
| `FIREBASE_CLIENT_EMAIL` | Netlify env vars, or the Firebase service-account JSON (`client_email`) |
| `FIREBASE_PRIVATE_KEY` | Netlify env vars, or Firebase Console > Project settings > Service accounts > Generate new private key (`private_key`). Wrap it in double quotes and keep the `\n` sequences. |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Netlify env vars, or Firebase Console > Cloud Messaging > Web Push certificates |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dkayul64b` |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Netlify env vars, or Cloudinary dashboard > API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard. **Use the newly rotated secret** (see open item 1). |
| `CLOUDINARY_URL` | `cloudinary://<API_KEY>:<API_SECRET>@dkayul64b` |
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Netlify env vars, or Flutterwave dashboard > Settings > API |
| `FLUTTERWAVE_SECRET_KEY` | Netlify env vars, or Flutterwave dashboard > Settings > API |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Netlify env vars, or Google Analytics > Admin > Data streams |

**Also add these 7 Firebase web-config keys.** They were missing from the work laptop's `.env.local` too.
Without them, `src/lib/firebase.ts` silently falls back to DUMMY values: the build still passes, but login and Firestore will not work locally.
Get them from Netlify env vars, or from Firebase Console > Project settings > General > Your apps > Web app config:
`NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`,
`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`,
`NEXT_PUBLIC_FIREBASE_DATABASE_URL`.

Easiest route: in Netlify, go to **Site configuration > Environment variables** and click each variable to reveal it. The site owner can see every value.
Compare the full Netlify list with this table and copy anything else that's there too.

## 3. Recently shipped
- PWA now launches on `/feed`, and push-notification registration was restored.
- `@username` mentions in feed posts (autocomplete, links, notifications).
- Community attachments plus PhotoEditor, and a searchable members directory with profile links.
- Cloudinary sign route: hardcoded secret and unsigned-token fallback removed, strict `verifyIdToken` added (commit `3ebe373`).
- Feed "Connection is slow" banner: waits 60 s and can be dismissed (commit `75ee048`).

## 4. OPEN ITEMS (pick up here, in this order)
1. **URGENT: rotate the Cloudinary API secret.** The old secret appears in this public repo's git history (commits `90c2dc1`, `3eb4c14`, `3ebe373`).
   Generate a new secret in Cloudinary, update it in Netlify (`CLOUDINARY_API_SECRET`, `CLOUDINARY_URL`) and in local `.env.local`, then redeploy.
   Rewriting git history does not help, because the old secret is already public. Rotation is the fix.
2. **Production `/api/notify` and `/api/cloudinary/sign` return HTTP 500 even with no auth header** (checked 14 Nov 06:46).
   A healthy route would return 401 or 503 for that request, so the function is crashing before the handler runs. Follow the proof-first rule:
   reproduce with curl, read the Netlify function logs, and check the `FIREBASE_PRIVATE_KEY` formatting in Netlify. Only then change code.
3. Change Eniola's Netlify role from *Reviewer* to *Developer* so he can see the logs.
4. Check Elijah's remaining requests on the live app: nested/unlimited comment replies, mentions in comments/replies,
   and the photo editor in DMs and the feed (crop, blur, draw, text, rotate).
5. Eniola's suggestion: split large components (`messages/page.tsx`, `feed/page.tsx`) gradually, as related features are touched.
6. Next.js 16 deprecation: rename `middleware.ts` to `proxy`. Low priority.

## 5. Context files
`docs/handoff/artifacts/` holds plans and walkthroughs from the Antigravity sessions on the work laptop.
The security audit reports and `.agents/teamwork` notes were deliberately kept out of this public repo.

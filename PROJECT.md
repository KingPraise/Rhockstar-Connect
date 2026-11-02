# Project: Rhockstar Connect Full-Codebase Quality Audit & Hardening Blueprint

## Architecture
- **Framework**: Next.js 16 (App Router) with React 19, Tailwind CSS.
- **Backend / BaaS**: Firebase Authentication, Cloud Firestore, Firebase Admin SDK, Cloudinary (media upload), Flutterwave (payments).
- **Security & Authorization**: `firestore.rules` (client-side RBAC & immutable fields enforcement), `src/middleware.ts` (API rate limiting), Next.js Route Handlers (`src/app/api/`) utilizing Firebase Admin SDK.
- **Application Structure**:
  - `src/app/`: 48 routes (38 UI pages across public, auth/onboarding, dashboard, company, ATS, admin; 8 API route files / 9 HTTP handlers; 2 metadata routes).
  - `src/components/`: Core UI modules (auth, feed, messages, dating, jobs, ads, subscriptions, admin, layout).
  - `src/lib/services/`: Client Firestore services (users, posts, messages, communities, dating, jobs, ads, subscriptions, referrals, connections).
  - `src/lib/firebase/`: Client Firebase initialization (`client.ts`) and Admin SDK initialization (`admin.ts`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 48 App Routes Catalog & Health Audit | Catalog all 48 Next.js routes, assess health (Healthy, Warning, Broken), client/server rendering, layout and error boundary wrapping | M1 | Survey Explorer Routes |
| 2 | Root Error Boundary Analysis | Diagnose root error boundary (`src/app/error.tsx`) blast radius, false "Connecting to Feed..." states, and missing nested boundaries | M1 | Survey Explorer Routes |
| 3 | Client SearchParams Suspense Boundaries | Audit 6 dashboard routes using `useSearchParams` without Suspense boundaries | M1 | Survey Explorer Routes |
| 4 | Auth & Session Lifecycle Verification | Verify atomic registration, profile hydration, session recovery, role enforcement, and bans | M2 | Survey Explorer Features |
| 5 | Feed, Posts & Content Moderation | Verify post creation, reaction, comments, image rendering, and safety moderation filters | M2 | Survey Explorer Features |
| 6 | Direct & Community Messaging | Verify real-time chat, unread badges, typing status, community channels, and subcollection access | M2 | Survey Explorer Features |
| 7 | Dating Module & Stardom Gamification | Verify discovery swiping, Double-Blind Incognito mode, match timers/reactivation, Stardom XP calculation | M2 | Survey Explorer Features |
| 8 | Jobs & Employer ATS Lifecycle | Verify job posting, application readiness check, candidate ATS pipeline, and authentication race conditions | M2 | Survey Explorer Features |
| 9 | Monetization, Subscriptions & Reminders | Verify subscription lifecycle, countdown reminders (7d/5d/3d/1d), Flutterwave integration, and expiry banners | M2 | Survey Explorer Features |
| 10 | Super Admin Operations | Verify user moderation, role assignment, ad review/approval, and orphan auth sync audit | M2 | Survey Explorer Features |
| 11 | Firestore Security Rules Verification | Audit firestore.rules against all client collections, verify field discrepancies (communities, jobs, connections, ads, referrals) | M3 | Survey Explorer Security |
| 12 | Backend API Security Diagnostics | Audit 8 API route files for auth guards, webhook validation, JWT verification, and rate limiting | M3 | Survey Explorer Features / Security |
| 13 | Build & TypeScript Diagnostics | Audit `npm run test:auth`, `npm run build`, and `npx tsc --noEmit` compiler warnings and errors | M3 | Survey Explorer Security |
| 14 | Quality Audit Artifact Synthesis | Generate comprehensive audit report artifact with exact `file:///` paths, reproduction journeys, and 3-tier roadmap | M4 | Master Orchestrator |
| 15 | Multi-Agent Review & Forensic Verification | Independent review, adversarial challenge, and forensic audit verification of findings and recommendations | M5 | Reviewers / Challengers / Auditor |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Route & Layout Audit | Verify all 48 routes, health statuses, error boundaries, and Suspense guards | Survey | DONE |
| M2 | Feature & Interactive Flow Verification | Verify 7 core functional areas (Auth, Feed, Messages, Dating, Jobs, Monetization, Admin) | Survey | DONE |
| M3 | Security Rules & API Diagnostics | Audit firestore.rules discrepancies, 8 API route files, and TypeScript compiler health | Survey | DONE |
| M4 | Master Audit Report Artifact | Synthesize all findings into developer-executable audit report artifact with reproduction journeys & 3-tier roadmap | M1, M2, M3 | DONE |
| M5 | Review & Forensic Integrity Gate | Dual Reviewers, Dual Challengers, and Forensic Integrity Auditor verification | M4 | DONE |

## Interface Contracts
### Client Services ↔ Firestore Security Rules
- Collection `/communities/{communityId}/messages`: Must allow authenticated community members read/write.
- Collection `/communities/{communityId}`: Allowed update key must match code property (`memberCount` vs `membersCount`).
- Collection `/jobs/{jobId}`: Job document schema must reconcile `employerId` vs `companyId`. Applicant increment of `applicantsCount` must be permitted.
- Collection `/connections/{connectionId}`: Query and document fields must reconcile `fromUserId`/`toUserId` with rule schema.
- Collection `/advertisements/{adId}`: Must permit impression/click counter increments from viewers and status pause/resume by company owners.

### Client Services ↔ Backend API Handlers
- Client mutations to restricted user fields (`subscriptionTier`, `subscriptionStatus`, `claimedRewards`, `premiumUntil`) must execute via Firebase Admin API routes (`/api/payments/verify`, `/api/referrals/claim`), not direct client `updateDoc`.
- Payment Webhook (`/api/payments/webhook`): Must reject all requests with missing or invalid signature header (`verif-hash`), regardless of whether environment secrets are set.
- Media Uploads (`/api/cloudinary/sign`): Must verify caller identity via `adminAuth.verifyIdToken`.
- Notifications (`/api/notify`): Must verify caller authorization before sending notifications to target `userId`.

## Code Layout
- Agent state & metadata: `.agents/teamwork/`
- App Router routes: `src/app/`
- Component modules: `src/components/`
- Shared services & helpers: `src/lib/`
- Security rules: `firestore.rules`
- Project root configurations: `package.json`, `tsconfig.json`, `next.config.ts`

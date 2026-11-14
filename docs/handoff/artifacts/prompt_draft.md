# Teamwork Project Prompt — Draft

> Status: Completed (VICTORY CONFIRMED)
> Final Deliverable: [`file:///c:/Users/PraiseTaiwo/Documents/Rhockstar-Connect/RHOCKSTAR_CONNECT_QUALITY_AUDIT_REPORT.md`](file:///c:/Users/PraiseTaiwo/Documents/Rhockstar-Connect/RHOCKSTAR_CONNECT_QUALITY_AUDIT_REPORT.md)
> Requested team: Full team (Quality Assurance, System Audit, & Architecture Hardening)

Perform a comprehensive full-codebase quality audit of Rhockstar Connect. Systematically test every route, user journey, interactive feature, and backend handler to identify broken pages, non-functioning features, unhandled error states, and security or performance gaps, then deliver a prioritized hardening roadmap.

Working directory: c:\Users\PraiseTaiwo\Documents\Rhockstar-Connect
Integrity mode: demo

## Requirements

### R1. Complete Route & Page Audit
Inspect and test all 48 Next.js application routes (public landing pages, guest onboarding, dashboard modules, company pages, employer ATS, and admin portal). Identify any pages that trigger the root error boundary ("Connecting to Feed..."), fail server-side data fetching, or render blank states.

### R2. Feature & Interactive Flow Verification
Verify the end-to-end functionality of core application features:
- Authentication & Session Lifecycle (registration, login, password reset, session recovery, role enforcement)
- Feed, Post Interactions, & Media Uploads (post creation, reactions, comments, image rendering)
- Direct & Community Messaging (real-time chat, unread badges, user typing status, community channels)
- Dating Module (discovery swiping, prospect inspection, match reactivation, stardom XP)
- Jobs & Employer ATS (job posting, applicant pipeline, ATS candidate status updates)
- Monetization & Subscriptions (payment verification, reminder triggers, tier perks, expiry banner)
- Super Admin Operations (user moderation, role assignment, ad approvals, auth sync audit)

### R3. Security Rules & API Handler Diagnostics
Audit client-side Firestore security rules (`firestore.rules`) and Next.js backend API routes (`/api/*`) for missing authentication guards, rate-limiting gaps, unhandled exceptions, and orphaned references.

### R4. Prioritized Hardening Blueprint
Produce a comprehensive audit report detailing:
- Every defective page or feature, complete with file paths and root causes
- Reproduction journeys and impact levels (Critical, High, Medium, Low)
- A clear, step-by-step remediation plan to solidify stability, eliminate runtime friction, and scale the platform.

## Acceptance Criteria

### Audit Coverage
- [ ] 100% of defined app routes (`/`, `/feed`, `/messages`, `/jobs`, `/dating`, `/admin/*`, etc.) are cataloged with operational status (Healthy, Warning, Broken).
- [ ] Automated build (`npm run build`) and type check (`npx tsc --noEmit`) logs are analyzed for latent compiler warnings or hidden runtime exceptions.
- [ ] All 10 backend API endpoints under `/src/app/api/` are checked for proper input validation, error handling, and authorization guards.

### Defect Documentation & Actionability
- [ ] Every identified defect provides exact file links (`file:///...`), triggering user conditions, and the underlying cause.
- [ ] The remediation roadmap categorizes fixes into Immediate Blockers (crashes/broken pages), UX Polish (loading states/navigation), and Scalability (caching, security rules, database indexing).
- [ ] Audit report is written to an artifact file for immediate developer execution.

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*

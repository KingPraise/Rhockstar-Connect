<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:deployment-rules -->
# Pre-Deployment Validation

Always run a full local build (e.g., `npm run build`) and ensure it completes successfully before running any `git push` commands. Never push code to the repository without local build verification to prevent breaking production deployments.
<!-- END:deployment-rules -->

<!-- BEGIN:bug-triage-rules -->
# User Bug Triage & Verification Protocol (Proof-First Rule)

When the user reports an issue, failure, or bug on Rhockstar Connect:

1. **Reproduce & Isolate Before Modifying Code (Non-Negotiable)**:
   - NEVER make speculative code edits without first proving the bug exists.
   - Trace the exact user journey, data requirements, and conditions described.
   - Create or run an empirical reproduction probe (e.g. targeted node test script, API curl, or isolated unit check) to trigger the exact failure mode.
   - Document the failure evidence (e.g., HTTP 500, unhandled exception, bad payload, or UI mismatch).

2. **If the Bug is Confirmed (True)**:
   - Identify the exact failure point (client state, service call, Firestore security rule, or API endpoint).
   - Implement the targeted fix.
   - Re-run the exact reproduction probe from step 1 to prove that the bug is resolved (e.g., HTTP 200 or expected state returned).

3. **If Unable to Replicate (False / Works as Expected)**:
   - Do NOT simply dismiss the issue or say "it works on my end".
   - Investigate *why* that specific user encountered the issue:
     - Account state differences (e.g., guest vs. logged in, missing profile fields, specific subscription tier, account type like employer vs. regular user).
     - Permission/role barriers (e.g., admin vs. user, connection status, blocked status).
     - Network/device/environment edge cases (e.g., offline mode, mobile viewport, service worker caching, Safari vs. Chromium).
     - UI state or race conditions (e.g., unhandled loading/error states, empty states masquerading as bugs).
   - Clarify the root cause and provide actionable guidance or defensive safeguards.

4. **Mandatory Post-Fix Regression Guard**:
   - Always execute type checking (`npx tsc --noEmit`).
   - Execute the auth integrity suite if auth/user/rules were touched (`npm run test:auth`).
   - Run a clean production build (`npm run build`) and confirm exit code 0 before finalizing.
<!-- END:bug-triage-rules -->

<!-- BEGIN:collaborator-update-rules -->
# Collaborator (Eniola) Update Protocol

Whenever Eniola (or any collaborator) pushes an update or a branch is ready for review:

1. **Fetch & Inspect**:
   - Run `git fetch --all --prune` to detect all remote branch updates.
   - Check out the branch locally and inspect commit logs and file diffs (`git log main..HEAD`, `git diff main..HEAD`).
   - Audit all code modifications for breaking changes, missing dependencies, external assets, or type/lint regressions.

2. **Verify Assets & Dependencies**:
   - Check that any referenced local static files (images, configs, scripts) exist in the repository.
   - Verify that any newly introduced libraries or configurations are compatible with the existing architecture.

3. **Build & Local Test Verification**:
   - Always run a clean local production build (`npm run build`) and confirm exit code 0.
   - Test modified routes and key user journeys locally (e.g. running smoke tests against a local instance) to verify runtime rendering and HTTP status codes before proceeding.

4. **Review & Gate Before Merge**:
   - Present a clear, structured summary of changes and test findings to the user.
   - Do NOT merge into `main` or push to production until local review, build validation, and smoke tests are confirmed.
<!-- END:collaborator-update-rules -->

<!-- BEGIN:auth-onboarding-rules -->
# Core Authentication & Onboarding Architecture Standards

To guarantee that registration and onboarding remain 100% stable at scale (thousands of users) and never suffer from permission regressions:

1. **Server-Side Exclusivity for Guest Onboarding**:
   - Public visitor onboarding (account provisioning, username availability verification, initial profile document generation, and referral attribution) MUST NEVER rely on client-side direct Firestore reads or writes.
   - All onboarding operations MUST be conducted through server-side API endpoints (such as `/api/auth/register`) powered by the Firebase Admin SDK.
   - The Firebase Admin SDK operates with server-level privileges, ensuring that client-side Firestore security rules (`firestore.rules`) can never block or break new user sign-ups.

2. **Defense-in-Depth for Security Rules**:
   - Client Firestore security rules exist to protect authenticated user data from unauthorized tampering and scraping.
   - Never write code that assumes unauthenticated guests can query or write to protected collections like `/users`.

3. **Mandatory Auth Health Verification**:
   - Whenever authentication, onboarding, security rules, or user models are modified, always execute the automated auth health suite:
     `npm run test:auth`
   - Confirm all 5 probes pass before proceeding with local build validation (`npm run build`) and deployment.
<!-- END:auth-onboarding-rules -->

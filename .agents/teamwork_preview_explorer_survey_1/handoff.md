# 5-Component Handoff Report: Frontend Deep-Dive Audit

**Auditor Agent**: `teamwork_preview_explorer_survey_1`
**Date**: September 10, 2026
**Target**: Rhockstar Connect Frontend (`src/app/`, `src/components/`, `public/`)
**Recipient**: Parent Orchestrator (`796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`)
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation

Direct observations and evidence collected from code inspection and CLI builds:

1. **Build & Type Checking**:
   - `npx tsc --noEmit` executed with exit code 0 (zero static TypeScript compiler errors).
   - `npm run build` (`next build --webpack`) completed successfully in 24.1s. Next.js 16.2.10 generated 41 static and dynamic routes.
2. **Routing & Guards**:
   - `src/components/auth/ProtectedRoute.tsx:35-39`:
     ```tsx
     const isPublicRoute =
       pathname === "/" ||
       pathname === "/login" ||
       pathname === "/register" ||
       pathname === "/privacy" ||
       pathname === "/terms";
     ```
     `/company/[username]` is not listed. Visiting as a guest immediately triggers `router.replace("/login")`.
   - `src/app/(dashboard)/notifications/page.tsx:58`:
     ```tsx
     router.push(`/messages?chatId=${notif.link.split('id=')[1] || ''}`);
     ```
     Meanwhile `src/app/(dashboard)/messages/page.tsx:53` only evaluates:
     ```tsx
     const targetUserId = searchParams.get("user") || searchParams.get("uid");
     ```
     The `chatId` query parameter is ignored; notifications fail to select the conversation.
3. **Global Error Boundary**:
   - `src/app/error.tsx:23-40`:
     ```tsx
     <h2 className="text-xl font-bold text-white mb-2">Connecting to Feed...</h2>
     <p className="text-slate-400 text-sm mb-6 max-w-sm">
       We're having trouble loading your feed. Please try again or check your internet connection.
     </p>
     <button onClick={() => reset()} ...>
       <RefreshCw className="w-4 h-4" /> Reload Feed
     </button>
     ```
     Renders feed-specific text on any route error.
4. **Hydration & DOM Violations**:
   - `src/app/(dashboard)/search/page.tsx:224-226`:
     ```tsx
     <Link key={result.id} href={result.link} className="block">
       <PostCard post={result.data} />
     </Link>
     ```
     Wraps `<PostCard>` which itself contains `<Link href={'/profile?uid=...'}>` (at `PostCard.tsx:236`), generating invalid nested `<a>` elements in the DOM tree.
   - `src/components/profile/ProfileHeader.tsx:252`:
     ```tsx
     Joined {format(new Date(), "MMMM yyyy")}
     ```
     Evaluates `new Date()` at render time rather than using `profile.createdAt`.
   - `src/app/(dashboard)/dating/profile/page.tsx:183`:
     ```tsx
     src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
     ```
     Calls `URL.createObjectURL(photo)` on every render of the photo list.
5. **Dead Interactive Controls**:
   - `src/app/(dashboard)/settings/page.tsx:283-300`: "Change Password" inputs have no form wrapper, state bindings, or submit button.
   - `src/app/(dashboard)/settings/page.tsx:318`: "Verify Phone" button has no `onClick`.
   - `src/app/(dashboard)/settings/page.tsx:544-550`: Notification toggles only trigger `toast.success` and do not persist to Firestore.
   - `src/app/(dashboard)/company/[username]/page.tsx:109`: "Follow Company" button has no `onClick`.
   - `src/app/admin/(protected)/jobs/page.tsx:116`: Job deletion Trash icon button has no `onClick`.
   - `src/components/feed/PostCard.tsx:273,276`: "Report Post" and "Block User" only invoke `toast.success(...)`.
   - `src/app/(dashboard)/resources/career/page.tsx:68`: Cards styled with pointer and external link icons have no `onClick` or `href`.
6. **Data Integrity & Account Lockout Bug**:
   - `src/components/profile/EditProfileModal.tsx:95-103`:
     ```tsx
     if (age < 18) {
       await updateDoc(doc(db, "users", profile.uid), {
         isLocked: true,
         lockReason: "Underage (Must be 18+ to use Rhockstar Connect)"
       });
       toast.error("You must be at least 18 years old. Your account has been locked.");
       await auth.signOut();
       return;
     }
     ```
     Typing an erroneous birth year immediately locks the existing user account in Firestore and logs them out.
   - `src/components/profile/EditProfileModal.tsx:360-369`: Social link inputs lack `value` and `onChange` attributes; links are discarded on submit.
   - `src/app/(dashboard)/profile/page.tsx:247-264`: Hardcoded static "Software Developer at Acme Corp" work experience card rendered for all users.
   - `src/app/(dashboard)/company/[username]/ats/page.tsx:22-28`: Static `MOCK_CANDIDATES` rendered instead of querying `job_applications`.

---

## 2. Logic Chain

1. **From Observation 2 to Broken Navigation**:
   Because `notifications/page.tsx:58` routes to `?chatId=...` while `messages/page.tsx:53` checks `user` or `uid`, clicking a message notification will never load the conversation, leaving users trapped on an empty state.
2. **From Observation 2 to B2B Acquisition Barrier**:
   Because `ProtectedRoute.tsx:35-39` omits `/company/*`, external job seekers or prospective enterprise clients clicking a company profile link shared on LinkedIn or Twitter are forced to `/login` before seeing company credentials or open jobs.
3. **From Observation 3 to User Confusion in Global Errors**:
   Because `src/app/error.tsx` specifies "Reload Feed" and "Connecting to Feed...", any unexpected client error during checkout (`/premium`), employer ad configuration (`/employer/ads`), or administrative management (`/admin/users`) confuses the user into believing their session was redirected or lost.
4. **From Observation 4 to React Hydration Warnings**:
   Because HTML specifications prohibit interactive descendants inside an `<a>` element, wrapping `<PostCard>` (which contains author `<Link>`) with an outer `<Link>` in `search/page.tsx` causes React 19 hydration mismatch warnings and breaks nested click event propagation.
5. **From Observation 5 to Feature Incompleteness**:
   The presence of UI inputs without `onChange`/`onSubmit` (Password Change in Settings), buttons without `onClick` (Phone Verification, Follow Company, Admin Job Deletion), and toast-only mock actions (Report/Block, Job Details) demonstrates that several user journeys terminate in dead ends.
6. **From Observation 6 to Critical User Lockout Risk**:
   Executing a database write `isLocked: true` and signing out a user directly from an edit profile modal upon an age validation check converts a simple user input typo into an irreversible account termination event requiring database intervention.

---

## 3. Caveats

1. **Read-Only Scope**: In strict accordance with the explorer archetype rules, zero code modifications were committed to `src/`. All findings are documented in `findings.md` with line numbers and recommended fixes for subsequent implementers.
2. **Runtime Backend Connectivity**: The local survey ran against mock/development Firebase environment configurations; cloud storage bucket quotas or live Paystack webhook completions were not live-tested in production.
3. **Edge Functions**: The build warning `⚠ Using edge runtime on a page currently disables static generation for that page` is expected for dynamic API routes (`/api/notify`, `/api/og`).

---

## 4. Conclusion

The Rhockstar Connect frontend demonstrates modern visual design, complete TypeScript coverage, and a passing production build. However, the user experience suffers from critical gaps:
1. Public company profiles are inaccessible to logged-out users.
2. Message notification click-throughs are broken due to parameter mismatch.
3. Critical settings (password change, privacy toggles, social links) do not function or persist.
4. Account edit modal possesses a hazardous lockout trap on birth date entry.
5. Production UI retains multiple hardcoded mock surfaces (experience, ATS candidates, visitor insights).

Resolving the high-priority items documented in `findings.md` will elevate the frontend to full production readiness.

---

## 5. Verification Method

To verify all findings independently:

1. **Verify TypeScript & Production Build**:
   ```powershell
   npx tsc --noEmit
   npm run build
   ```
   Both commands exit with code 0.
2. **Verify Public Route Lockout**:
   - Inspect `src/components/auth/ProtectedRoute.tsx:35-39`. Note missing `/company`.
   - Run dev server (`npm run dev`) and visit `http://localhost:3000/company/paystack` in an Incognito window. Observe redirect to `/login`.
3. **Verify Notification Query Mismatch**:
   - Compare `src/app/(dashboard)/notifications/page.tsx:58` (`router.push('/messages?chatId=...')`) with `src/app/(dashboard)/messages/page.tsx:53` (`searchParams.get("user") || searchParams.get("uid")`).
4. **Verify Dead Password Change Form**:
   - Inspect `src/app/(dashboard)/settings/page.tsx:283-300`. Confirm absence of form, input state handlers, and submit button.
5. **Verify Age Lockout Trap**:
   - Inspect `src/components/profile/EditProfileModal.tsx:95-103`. Confirm `updateDoc(..., { isLocked: true })` and `auth.signOut()` on `age < 18`.
6. **Detailed Findings File**:
   - Inspect `.agents/teamwork_preview_explorer_survey_1/findings.md` for exact code lines and remediation steps for all 22 identified defects.

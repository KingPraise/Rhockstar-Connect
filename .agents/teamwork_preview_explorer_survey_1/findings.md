# Frontend Pages & UI Components Comprehensive Audit Report
**Rhockstar Connect Platform Audit**
**Date**: September 10, 2026
**Auditor**: Teamwork Explorer (Survey Agent 1)
**Scope**: All pages under `src/app/` and UI components under `src/components/`

---

## Executive Summary

A comprehensive, read-only frontend deep dive was conducted across the entire Rhockstar Connect application. While the TypeScript build (`next build --webpack`) passes with zero compiler errors across 41 static/dynamic routes, a significant number of functional defects, dead interactive controls, hydration risks, hardcoded mock data in production surfaces, and broken navigation links were identified.

### Breakdown by Severity
- **Critical**: 2 issues (Global error boundary copy mismatch, public route lockouts on company profiles)
- **High**: 8 issues (Notification chatId routing mismatch, dead social links in profile editor, instantaneous account locking bug, hardcoded mock data in profile/ATS, non-functional password change & privacy toggles, dead post deletion in admin)
- **Medium**: 8 issues (Nested `<a>` DOM hydration invalidations in search, unsafe `createObjectURL` in render loop, hardcoded date join calculations, mock profile visitors, dead report/block moderation actions, dead "Follow Company" button, dead "View Details" button)
- **Low**: 4 issues (Duplicate unreachable clearTimeout, character encoding artifacts, outdated netlify.app fallback domain, unused component refs)

---

## Table of Contents
1. [Routing, Auth & Error Handling](#1-routing-auth--error-handling)
2. [Hydration, SSR & DOM Validity](#2-hydration-ssr--dom-validity)
3. [Dead Buttons, Links & Non-Functional Features](#3-dead-buttons-links--non-functional-features)
4. [Data Integrity & Production Mock Surfaces](#4-data-integrity--production-mock-surfaces)
5. [UI, Layout & Responsiveness](#5-ui-layout--responsiveness)
6. [Prioritized Remediation Matrix](#6-prioritized-remediation-matrix)

---

## 1. Routing, Auth & Error Handling

### ISSUE-ROUT-01: Public Company Profile Blocked by Protected Route Guard
- **Severity**: Critical
- **File**: `src/components/auth/ProtectedRoute.tsx:35-39`
- **User Flow / Reproduction**:
  1. As an unauthenticated guest user, receive a link to a company profile (e.g., `https://rhockstarconnect.com/company/paystack`).
  2. Open the link in a private/incognito browser tab.
  3. Instead of viewing the company public profile and job postings, the user is immediately redirected to `/login`.
- **Suspected Root Cause**:
  `ProtectedRoute.tsx` defines `isPublicRoute` to allow unauthenticated access to landing, login, register, privacy, and terms, but omits `/company/`.
- **Evidence Snippet**:
  ```tsx
  // src/components/auth/ProtectedRoute.tsx:35-39
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/privacy" ||
    pathname === "/terms";
  ```
- **Recommended Fix**:
  Update `isPublicRoute` to include `/company`:
  ```tsx
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname.startsWith("/company");
  ```

---

### ISSUE-ROUT-02: Message Notification Link Query Parameter Mismatch
- **Severity**: High
- **Files**:
  - Notification link trigger: `src/app/(dashboard)/notifications/page.tsx:58`
  - Messages page query parser: `src/app/(dashboard)/messages/page.tsx:53`
- **User Flow / Reproduction**:
  1. A user receives a direct message notification.
  2. Navigate to the Notifications page (`/notifications`).
  3. Click on the message notification item.
  4. The router navigates to `/messages?chatId=<uid>`.
  5. The Messages page loads, but **no conversation is opened**; the user remains on the empty "Select a conversation or start a new chat" screen.
- **Suspected Root Cause**:
  `notifications/page.tsx` constructs query param `chatId`: `router.push('/messages?chatId=...')`. However, `messages/page.tsx` line 53 only reads `searchParams.get("user") || searchParams.get("uid")`. It completely ignores `chatId`.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/notifications/page.tsx:58
  } else if (notif.type === 'message') {
    router.push(`/messages?chatId=${notif.link.split('id=')[1] || ''}`);
  }
  ```
  ```tsx
  // src/app/(dashboard)/messages/page.tsx:53
  const targetUserId = searchParams.get("user") || searchParams.get("uid");
  // Does not read "chatId"
  ```
- **Recommended Fix**:
  Update `messages/page.tsx` line 53 to check for `chatId`:
  ```tsx
  const targetUserId = searchParams.get("user") || searchParams.get("uid") || searchParams.get("chatId");
  ```
  And in `notifications/page.tsx`:
  ```tsx
  const targetId = notif.link.includes('id=') ? notif.link.split('id=')[1] : notif.link;
  router.push(`/messages?user=${targetId}`);
  ```

---

### ISSUE-ROUT-03: Global Error Boundary Hardcoded for Feed Route
- **Severity**: High
- **File**: `src/app/error.tsx:23-40`
- **User Flow / Reproduction**:
  1. A runtime exception occurs on any non-feed page (e.g., `/settings`, `/dating`, `/admin/jobs`, `/employer/ads`).
  2. Next.js triggers the nearest error boundary (`src/app/error.tsx`).
  3. The error screen renders: *"Connecting to Feed..."* with subtitle *"We're having trouble loading your feed. Please try again or check your internet connection."* and button *"Reload Feed"*.
  4. Users are confused thinking they were redirected to the Feed when they were actually updating payment settings or submitting an ad.
- **Suspected Root Cause**:
  The global `error.tsx` was copy-pasted from an earlier feed error widget and contains hardcoded text specific to the feed.
- **Evidence Snippet**:
  ```tsx
  // src/app/error.tsx:23-40
  <h2 className="text-xl font-bold text-white mb-2">Connecting to Feed...</h2>
  <p className="text-slate-400 text-sm mb-6 max-w-sm">
    We're having trouble loading your feed. Please try again or check your internet connection.
  </p>
  <button
    onClick={() => reset()}
    className="neo-button-primary px-6 py-2.5 text-sm flex items-center justify-center gap-2"
  >
    <RefreshCw className="w-4 h-4" /> Reload Feed
  </button>
  ```
- **Recommended Fix**:
  Replace feed-specific copy with generic application error copy:
  ```tsx
  <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
  <p className="text-slate-400 text-sm mb-6 max-w-sm">
    An unexpected error occurred while loading this page. Please try again or return to the homepage.
  </p>
  <div className="flex gap-3">
    <button onClick={() => reset()} className="neo-button-primary px-5 py-2 text-sm flex items-center gap-2">
      <RefreshCw className="w-4 h-4" /> Try Again
    </button>
    <Link href="/feed" className="px-5 py-2 text-sm bg-slate-800 text-white rounded-xl hover:bg-slate-700">
      Back to Home
    </Link>
  </div>
  ```

---

## 2. Hydration, SSR & DOM Validity

### ISSUE-HYD-01: Nested Interactive Anchor Tags in Global Search Results
- **Severity**: Medium
- **Files**:
  - `src/app/(dashboard)/search/page.tsx:224-226`
  - `src/components/feed/PostCard.tsx:236`
- **User Flow / Reproduction**:
  1. Open Global Search (`/search?q=rhockstar`).
  2. Observe posts in the search results tab.
  3. Clicking on a post author or avatar inside the post card fails or causes erratic navigation.
  4. React logs console errors: `Warning: validateDOMNesting(...): <a> cannot appear as a descendant of <a>`.
- **Suspected Root Cause**:
  `search/page.tsx` wraps the entire `<PostCard post={post} />` inside a `<Link href={result.link}>`. However, `PostCard.tsx` internally renders `<Link href={/profile?uid=...}>` for the user's avatar and name. In HTML5 and React 19, nested `<a>` elements are invalid and cause hydration mismatches.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/search/page.tsx:224-226
  <Link key={result.id} href={result.link} className="block">
    <PostCard post={result.data} />
  </Link>
  ```
- **Recommended Fix**:
  Do not wrap `PostCard` in `<Link>`. Instead, allow `PostCard` to manage its own links or pass an `onPostClick` callback.

---

### ISSUE-HYD-02: Hardcoded Current Date in Profile Join Calculation
- **Severity**: Medium
- **File**: `src/components/profile/ProfileHeader.tsx:252`
- **User Flow / Reproduction**:
  1. Visit any user's profile (`/profile?uid=123`).
  2. Inspect the "Joined [Date]" badge.
  3. Every user—whether registered 3 years ago or 2 days ago—displays "Joined September 2026" (current month and year).
  4. SSR renders the server's current timestamp; if client timezone differs, hydration mismatch can occur.
- **Suspected Root Cause**:
  Line 252 evaluates `format(new Date(), "MMMM yyyy")` instead of checking `profile.createdAt`.
- **Evidence Snippet**:
  ```tsx
  // src/components/profile/ProfileHeader.tsx:251-253
  <span className="flex items-center gap-1.5">
    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Joined {format(new Date(), "MMMM yyyy")}
  </span>
  ```
- **Recommended Fix**:
  Check `profile.createdAt`:
  ```tsx
  const joinedDate = profile.createdAt?.toDate ? profile.createdAt.toDate() : profile.createdAt?.seconds ? new Date(profile.createdAt.seconds * 1000) : null;
  const joinedText = joinedDate ? format(joinedDate, "MMMM yyyy") : "Recently";
  ```

---

### ISSUE-HYD-03: Memory Leak & Re-render Object URL Creation in Dating Profile
- **Severity**: Medium
- **File**: `src/app/(dashboard)/dating/profile/page.tsx:183`
- **User Flow / Reproduction**:
  1. Go to `/dating/profile` and select photo files to upload.
  2. Every time the user types in bio, changes interests, or toggles preferences, the component re-renders.
  3. `URL.createObjectURL(file)` is called directly inside JSX during rendering.
  4. Memory usage steadily increases and previous object URLs are never revoked.
- **Suspected Root Cause**:
  `URL.createObjectURL` is invoked in JSX expression instead of in the file change event handler or within a memoized/effect hook.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/dating/profile/page.tsx:181-185
  {photos.map((photo, i) => (
    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden ...">
      <img
        src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
        alt={`Dating photo ${i + 1}`}
        className="w-full h-full object-cover"
      />
  ```
- **Recommended Fix**:
  Convert files to preview URLs in `handlePhotoSelect` and revoke them on unmount.

---

### ISSUE-HYD-04: Clickable Parent Div Wrapping Interactive Button in Premium Page
- **Severity**: Medium
- **File**: `src/app/(dashboard)/premium/page.tsx:193-202`
- **User Flow / Reproduction**:
  1. Open `/premium`.
  2. Click on a subscription tier card near the "Upgrade Now" button.
  3. The outer container triggers `handleSelectTier(plan.id)` while the nested `PaymentButton` simultaneously attempts to launch the payment modal, creating duplicate event triggers.
- **Suspected Root Cause**:
  An outer interactive `<div onClick="...">` wraps a button with its own `onClick`.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/premium/page.tsx:193-202
  <div onClick={() => handleSelectTier(plan.id)} className="cursor-pointer ...">
    ...
    <PaymentButton ... />
  </div>
  ```
- **Recommended Fix**:
  Remove `onClick` from the outer card wrapper and keep click handling confined to the `<PaymentButton>`.

---

## 3. Dead Buttons, Links & Non-Functional Features

### ISSUE-DEAD-01: Non-Functional Change Password Form in Settings
- **Severity**: High
- **File**: `src/app/(dashboard)/settings/page.tsx:283-300`
- **User Flow / Reproduction**:
  1. Navigate to `/settings`.
  2. Scroll to the "Security & Authentication" section.
  3. Locate the "Change Password" card.
  4. Enter "Current Password", "New Password", and "Confirm New Password".
  5. There is **no submit button**, no form submission handler, and input fields do not store values in React state.
- **Suspected Root Cause**:
  The password inputs are purely static mockup JSX without `value`, `onChange`, or a submit action.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/settings/page.tsx:283-300
  <div className="space-y-4">
    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Current Password</label>
      <input type="password" placeholder="••••••••" className="w-full neo-input py-3 px-4 text-sm text-white" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">New Password</label>
        <input type="password" placeholder="••••••••" className="w-full neo-input py-3 px-4 text-sm text-white" />
      </div>
      <div>
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Confirm New Password</label>
        <input type="password" placeholder="••••••••" className="w-full neo-input py-3 px-4 text-sm text-white" />
      </div>
    </div>
  </div>
  // No submit button follows this section
  ```
- **Recommended Fix**:
  Wire the section to a form handler with `ResetPasswordModal` or use Firebase `updatePassword(auth.currentUser, newPassword)` with a dedicated "Update Password" button.

---

### ISSUE-DEAD-02: Phone Verification Button Without Action
- **Severity**: Medium
- **File**: `src/app/(dashboard)/settings/page.tsx:318`
- **User Flow / Reproduction**:
  1. In `/settings` under Security, find "Phone Verification".
  2. Click the "Verify Phone" button.
  3. Nothing happens.
- **Suspected Root Cause**:
  The button has no `onClick` handler.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/settings/page.tsx:318
  <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-white/10">
    Verify Phone
  </button>
  ```
- **Recommended Fix**:
  Attach an `onClick` opening a phone verification modal or label as "Coming Soon".

---

### ISSUE-DEAD-03: Privacy & Notification Settings Toggles Do Not Persist
- **Severity**: High
- **File**: `src/app/(dashboard)/settings/page.tsx:473-605`
- **User Flow / Reproduction**:
  1. In `/settings`, toggle "Incognito Mode", "Hide Online Status", "Hide Read Receipts", or "Private Dating Albums".
  2. Also toggle "Job Alerts" or "Marketing Emails".
  3. Refresh the page.
  4. All toggles reset to default values. No Firestore update is ever sent.
- **Suspected Root Cause**:
  The toggles lack state and `onChange` handlers, or in notification preferences, only trigger `toast.success("Notification preferences updated")` without saving to Firestore.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/settings/page.tsx:544-550
  <input
    type="checkbox"
    defaultChecked
    className="sr-only peer"
    onChange={() => toast.success("Notification preferences updated")}
  />
  ```
- **Recommended Fix**:
  Add `privacySettings` and `notificationSettings` fields to user profile and call `updateUserProfile` on toggle.

---

### ISSUE-DEAD-04: "Follow Company" Button Has No Handler
- **Severity**: Medium
- **File**: `src/app/(dashboard)/company/[username]/page.tsx:109`
- **User Flow / Reproduction**:
  1. Visit any company page (e.g. `/company/paystack`).
  2. Click the "Follow Company" button in the header.
  3. No state change occurs; no follow event is sent.
- **Suspected Root Cause**:
  Missing `onClick` handler.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/company/[username]/page.tsx:109
  <button className="neo-button-secondary px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
    <Building2 className="w-4 h-4" /> Follow Company
  </button>
  ```
- **Recommended Fix**:
  Add `handleFollowCompany` calling a follow service to store followed companies on user profile.

---

### ISSUE-DEAD-05: Post / User Report and Block Actions Are Cosmetic Only
- **Severity**: High
- **Files**:
  - `src/components/feed/PostCard.tsx:273,276`
  - `src/app/(dashboard)/dating/page.tsx:304,307`
- **User Flow / Reproduction**:
  1. On any feed post or dating card, click the options menu.
  2. Click "Report Post" or "Block User".
  3. A toast displays: *"Post reported to admins"* or *"User blocked"*.
  4. The post or user remains visible on feed. No record is added to the admin reports database.
- **Suspected Root Cause**:
  Handlers only execute `toast.success()` and do not call `createReport` or `blockUser`.
- **Evidence Snippet**:
  ```tsx
  // src/components/feed/PostCard.tsx:273-277
  <button onClick={() => { setShowMenu(false); toast.success("Post reported to admins."); }} className="...">
    <Flag className="w-4 h-4" /> Report Post
  </button>
  <button onClick={() => { setShowMenu(false); toast.success("User blocked. You will no longer see their posts."); }} className="...">
    <X className="w-4 h-4" /> Block User
  </button>
  ```
- **Recommended Fix**:
  Call `createReport({ targetId: post.id, targetType: 'post', reporterId: profile.uid, reason: 'user_flagged' })` and update user's `blockedUsers` list.

---

### ISSUE-DEAD-06: Admin Jobs Delete Button Lacks onClick
- **Severity**: High
- **File**: `src/app/admin/(protected)/jobs/page.tsx:116`
- **User Flow / Reproduction**:
  1. Log into Admin Dashboard (`/admin/jobs`).
  2. View active curated jobs list.
  3. Click the red Trash button next to any job.
  4. Nothing happens; the job cannot be deleted.
- **Suspected Root Cause**:
  Missing `onClick` handler on the delete button.
- **Evidence Snippet**:
  ```tsx
  // src/app/admin/(protected)/jobs/page.tsx:116-118
  <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
    <Trash2 className="h-5 w-5" />
  </button>
  ```
- **Recommended Fix**:
  Add `onClick={() => handleDeleteJob(job.id)}` with confirmation.

---

### ISSUE-DEAD-07: Resource Masterclass & Article Cards Have Pointer Cursors but No Links
- **Severity**: Medium
- **Files**:
  - `src/app/(dashboard)/resources/career/page.tsx:68-94`
  - `src/app/(dashboard)/resources/dating/page.tsx:68-94`
- **User Flow / Reproduction**:
  1. Go to Career Resources (`/resources/career`) or Dating Resources (`/resources/dating`).
  2. Hover over "Featured Masterclass" cards or "Curated Guides".
  3. The cursor becomes a pointer and an `ExternalLink` icon appears.
  4. Clicking the cards does nothing.
- **Suspected Root Cause**:
  The cards are `<div>` elements with hover styles but without `<a>`, `<Link>`, or `onClick` handlers.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/resources/career/page.tsx:68-75
  <div key={idx} className="neo-card p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3 cursor-pointer group hover:border-brand/30 transition-all">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand px-2 py-0.5 rounded-full bg-brand/10">
        {item.category}
      </span>
      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
    </div>
  ```
- **Recommended Fix**:
  Add an `href` attribute or modal player for masterclass videos and articles.

---

### ISSUE-DEAD-08: Job Search "View Details" Only Triggers Toast
- **Severity**: Medium
- **File**: `src/app/(dashboard)/jobs/page.tsx:342`
- **User Flow / Reproduction**:
  1. On the Job Board (`/jobs`), select any job card.
  2. Click "View Details" in the job card footer.
  3. Instead of expanding the job description or navigating to a job detail view, it shows a toast: *"Job details expanded"*.
- **Suspected Root Cause**:
  Placeholder action without full drawer/modal implementation.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/jobs/page.tsx:342
  <button 
    onClick={() => toast("Job details expanded", { icon: "ℹ️" })}
    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-white/10"
  >
    View Details
  </button>
  ```
- **Recommended Fix**:
  Set `selectedJob(job)` to open a detailed modal or navigate to `/jobs?jobId=${job.id}`.

---

## 4. Data Integrity & Production Mock Surfaces

### ISSUE-DATA-01: Profile Editor Discards Social Media Links
- **Severity**: High
- **File**: `src/components/profile/EditProfileModal.tsx:360-369`
- **User Flow / Reproduction**:
  1. Go to Profile (`/profile`) and click "Edit Profile".
  2. Scroll down to Social Links (LinkedIn, Twitter, GitHub, Instagram).
  3. Enter profile URLs into all inputs.
  4. Click "Save Changes".
  5. The profile refreshes; none of the social links are saved.
- **Suspected Root Cause**:
  The input fields have no `name`, `value`, or `onChange` handlers; the `handleSubmit` payload does not include social link state.
- **Evidence Snippet**:
  ```tsx
  // src/components/profile/EditProfileModal.tsx:360-369
  <div>
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">LinkedIn URL</label>
    <input type="url" placeholder="https://linkedin.com/in/username" className="w-full neo-input py-2.5 px-4 text-sm text-white" />
  </div>
  <div>
    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Twitter / X</label>
    <input type="url" placeholder="https://x.com/username" className="w-full neo-input py-2.5 px-4 text-sm text-white" />
  </div>
  ```
- **Recommended Fix**:
  Bind inputs to state (`socials.linkedin`, `socials.twitter`, etc.) and save them under `profile.socialLinks`.

---

### ISSUE-DATA-02: Immediate Account Lockout Trap on Minor Age Typo
- **Severity**: High
- **File**: `src/components/profile/EditProfileModal.tsx:95-103`
- **User Flow / Reproduction**:
  1. An existing adult user edits their profile.
  2. In the date of birth field, they accidentally select or type an invalid year making calculated age < 18.
  3. They click "Save Changes".
  4. The system **instantly writes `isLocked: true` to their user record in Firestore** and calls `auth.signOut()`.
  5. The user is logged out permanently and cannot log back in without manual database intervention.
- **Suspected Root Cause**:
  Underage policy enforcement should reject the form submission with a validation error rather than locking an already-registered account into permanent lockout.
- **Evidence Snippet**:
  ```tsx
  // src/components/profile/EditProfileModal.tsx:95-103
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
- **Recommended Fix**:
  Prevent form submission with a form validation message without mutating the Firestore account to locked status:
  ```tsx
  if (age < 18) {
    toast.error("You must be at least 18 years old. Please verify your date of birth.");
    return;
  }
  ```

---

### ISSUE-DATA-03: Hardcoded Mock Work Experience & Languages on Every User Profile
- **Severity**: High
- **File**: `src/app/(dashboard)/profile/page.tsx:247-264, 449-455`
- **User Flow / Reproduction**:
  1. View your own profile or any other member's profile.
  2. Scroll down to "Work Experience" and "Languages".
  3. Every user displays: *"Software Developer at Acme Corp (2022 - Present)"* and *"English (Native)"*.
  4. Clicking the plus icon to add experience does nothing (`profile/page.tsx:242` has no `onClick`).
- **Suspected Root Cause**:
  Static placeholder elements were hardcoded directly in JSX rather than read from `profile.experience` or `profile.languages`.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/profile/page.tsx:247-254
  <div className="flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/5">
    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
      <Briefcase className="w-5 h-5" />
    </div>
    <div>
      <h4 className="text-white font-bold text-sm">Software Developer</h4>
      <p className="text-slate-400 text-xs">Acme Corp • 2022 - Present</p>
    </div>
  </div>
  ```
- **Recommended Fix**:
  Render `profile.experience?.length > 0` and display an empty state ("No work experience added yet") when empty, with a functional Add Experience modal.

---

### ISSUE-DATA-04: Mock ATS Candidate Pipeline Never Persisted
- **Severity**: High
- **File**: `src/app/(dashboard)/company/[username]/ats/page.tsx:22-28, 45-55`
- **User Flow / Reproduction**:
  1. Go to company ATS pipeline (`/company/testcorp/ats`).
  2. Move candidate cards between "Applied", "Screening", "Interview", and "Hired" columns.
  3. Refresh the page.
  4. The candidates reset to the static hardcoded list (`MOCK_CANDIDATES`: "Alex Chen", "Sarah Jenkins", "Michael Chang"). Real applicants are not fetched from Firestore.
- **Suspected Root Cause**:
  The page uses local React state initialized with `MOCK_CANDIDATES`. It does not query the `job_applications` collection.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/company/[username]/ats/page.tsx:22-28
  const MOCK_CANDIDATES: Candidate[] = [
    { id: "c1", name: "Alex Chen", role: "Senior Frontend Engineer", stage: "applied", matchScore: 94, avatar: "..." },
    { id: "c2", name: "Sarah Jenkins", role: "Product Designer", stage: "screening", matchScore: 88, avatar: "..." },
  ```
- **Recommended Fix**:
  Fetch real job applications matching company job IDs from Firestore and persist drag-and-drop stage updates.

---

### ISSUE-DATA-05: Mock Visitor Data in Insights Page
- **Severity**: Medium
- **File**: `src/app/(dashboard)/insights/page.tsx:102`
- **User Flow / Reproduction**:
  1. Open Insights (`/insights`).
  2. Look at "Recent Profile Visitors".
  3. The displayed visitors are simply the first 4 users from `allUsers.slice(0, 4)`, not actual profile viewers.
- **Suspected Root Cause**:
  Arbitrary slicing of registered users rather than querying a real `profile_views` collection.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/insights/page.tsx:102
  const recentVisitors = allUsers.slice(0, 4);
  ```
- **Recommended Fix**:
  Track profile views in a subcollection `users/{uid}/views` or display an accurate "No recent views recorded" state.

---

## 5. UI, Layout & Responsiveness

### ISSUE-UI-01: Character Encoding Artifact in Employer Salary Range
- **Severity**: Low
- **File**: `src/app/(dashboard)/employer/page.tsx:309`
- **User Flow / Reproduction**:
  1. Visit `/employer` dashboard.
  2. Inspect the active job listing card salary placeholder.
  3. The salary reads `?600k - ?1.2M` due to a failed character encoding of the Naira sign (`₦`).
- **Suspected Root Cause**:
  File was saved or copied with ISO-8859-1 or unrecognized glyph encoding.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/employer/page.tsx:309
  <p className="text-xs text-slate-400 mt-0.5">?600k - ?1.2M • Lagos, Nigeria</p>
  ```
- **Recommended Fix**:
  Replace `?` with `₦` or `NGN`.

---

### ISSUE-UI-02: Referral Share Fallback Points to Netlify Subdomain
- **Severity**: Low
- **File**: `src/app/(dashboard)/referrals/page.tsx:30`
- **User Flow / Reproduction**:
  1. Go to Referrals (`/referrals`).
  2. Copy referral link or share via WhatsApp/Twitter when running on custom domain.
  3. If `window.location.origin` is undefined (SSR), the fallback URL is `https://rhockstarconnect.netlify.app/?ref=...` rather than the official production domain `https://rhockstarconnect.com`.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/referrals/page.tsx:30
  const referralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${referralCode}` 
    : `https://rhockstarconnect.netlify.app/register?ref=${referralCode}`;
  ```
- **Recommended Fix**:
  Update fallback domain to `https://rhockstarconnect.com`.

---

### ISSUE-UI-03: Duplicate Unreachable clearTimeout in Jobs Page
- **Severity**: Low
- **File**: `src/app/(dashboard)/jobs/page.tsx:75-76`
- **Suspected Root Cause**:
  Copy-paste error resulting in duplicate cleanup statement.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/jobs/page.tsx:74-77
  return () => clearTimeout(timer);
  return () => clearTimeout(timer);
  ```
- **Recommended Fix**:
  Remove the duplicate line.

---

### ISSUE-UI-04: Unused Video Input Reference in Post Composer
- **Severity**: Low
- **File**: `src/components/feed/PostComposer.tsx:19, 285`
- **Suspected Root Cause**:
  `videoInputRef` is defined on line 19, but the Video button on line 285 clicks `fileInputRef.current?.click()`.
- **Evidence Snippet**:
  ```tsx
  // src/components/feed/PostComposer.tsx:19
  const videoInputRef = useRef<HTMLInputElement>(null);
  ...
  // line 285:
  <button type="button" onClick={() => fileInputRef.current?.click()} ...>
    <Video className="w-4 h-4 text-purple-400" />
  </button>
  ```
- **Recommended Fix**:
  Either remove `videoInputRef` or attach it to a dedicated video-only input with `accept="video/*"`.

---

## 6. Prioritized Remediation Matrix

| ID | Issue Title | File Location | Severity | Estimated Effort |
|---|---|---|---|---|
| **ISSUE-ROUT-01** | Whitelist `/company/*` in public route guard | `ProtectedRoute.tsx:35-39` | Critical | 10 mins |
| **ISSUE-ROUT-02** | Support `chatId` query parameter in Messages router | `messages/page.tsx:53`, `notifications/page.tsx:58` | High | 15 mins |
| **ISSUE-ROUT-03** | Replace feed copy in global error boundary | `src/app/error.tsx:23-40` | High | 15 mins |
| **ISSUE-DATA-01** | Wire social links in EditProfileModal to state & DB | `EditProfileModal.tsx:360-369` | High | 30 mins |
| **ISSUE-DATA-02** | Prevent automatic permanent account lockout on DOB edit | `EditProfileModal.tsx:95-103` | High | 15 mins |
| **ISSUE-DEAD-01** | Implement functional Change Password form | `settings/page.tsx:283-300` | High | 45 mins |
| **ISSUE-DEAD-03** | Persist privacy & notification settings to Firestore | `settings/page.tsx:473-605` | High | 45 mins |
| **ISSUE-DEAD-05** | Wire Report & Block actions to moderation service | `PostCard.tsx:273,276`, `dating/page.tsx:304` | High | 45 mins |
| **ISSUE-DEAD-06** | Wire delete job button in Admin Jobs | `admin/(protected)/jobs/page.tsx:116` | High | 15 mins |
| **ISSUE-HYD-01** | Remove nested `<a>` tag inside Global Search results | `search/page.tsx:224-226` | Medium | 15 mins |
| **ISSUE-HYD-02** | Use actual user join date instead of `new Date()` | `ProfileHeader.tsx:252` | Medium | 15 mins |
| **ISSUE-HYD-03** | Fix memory leak in dating profile photo previews | `dating/profile/page.tsx:183` | Medium | 20 mins |
| **ISSUE-HYD-04** | Decouple nested onClick on Premium plan cards | `premium/page.tsx:193-202` | Medium | 15 mins |
| **ISSUE-DEAD-04** | Add Follow Company action | `company/[username]/page.tsx:109` | Medium | 30 mins |
| **ISSUE-DEAD-08** | Implement functional Job Details drawer/modal | `jobs/page.tsx:342` | Medium | 45 mins |
| **ISSUE-DATA-03** | Replace hardcoded work experience & languages with dynamic lists | `profile/page.tsx:247-264` | Medium | 45 mins |
| **ISSUE-DATA-04** | Connect ATS pipeline to real applicants collection | `company/[username]/ats/page.tsx` | Medium | 60 mins |
| **ISSUE-DATA-05** | Replace sliced user visitors with real visitor tracking | `insights/page.tsx:102` | Medium | 45 mins |
| **ISSUE-UI-01** | Fix `?` encoding artifact to `₦` in employer salary | `employer/page.tsx:309` | Low | 5 mins |
| **ISSUE-UI-02** | Update referral link fallback domain to `.com` | `referrals/page.tsx:30` | Low | 5 mins |
| **ISSUE-UI-03** | Remove duplicate `clearTimeout` in jobs page | `jobs/page.tsx:75-76` | Low | 5 mins |
| **ISSUE-UI-04** | Clean up unused `videoInputRef` in PostComposer | `PostComposer.tsx:19` | Low | 5 mins |

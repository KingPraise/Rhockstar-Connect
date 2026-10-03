# 🛡️ Rhockstar Connect — Consolidated QA & Security Audit Report

**Platform**: Rhockstar Connect  
**Audit Date**: September 10, 2026  
**Auditor**: Teamwork QA Synthesis Worker (`teamwork_preview_worker_qa_report`)  
**Source Survey Teams**:
- Explorer 1: Frontend Routing, UI Components & Hydration (`teamwork_preview_explorer_survey_1`)
- Explorer 2: Backend APIs, Firebase Database & Security (`teamwork_preview_explorer_survey_2`)
- Explorer 3: Workflows, Business Logic & Third-Party Integrations (`teamwork_preview_explorer_survey_3`)  
**Integrity Mode**: Development / Deep Forensic Verification  
**Status**: Completed & Codebase-Verified

---

## 1. Executive Summary

### 1.1 High-Level Platform Health Assessment
An exhaustive, multi-agent forensic code audit of the entire **Rhockstar Connect** codebase was conducted across all 41 Next.js routes, UI component hierarchies, Firebase Firestore/Storage security rules, backend API endpoints, and client services.

While the application compiles without static TypeScript errors (`tsc --noEmit` exits with code 0) and Next.js 16 successfully builds production chunks, the platform in its current state is **unfit for production deployment**. The codebase exhibits severe vulnerabilities that expose user data to catastrophic destruction, unauthorized access, privilege escalation, and financial bypass, alongside major gaps in core user flows.

### 1.2 Summary Statistics & Distributions

#### Severity Distribution
| Severity Level | Count | Percentage | Definition & Platform Impact |
| :--- | :---: | :---: | :--- |
| **Critical** | **13** | 20.0% | Complete remote database wipe, unauthenticated notification spoofing, SuperAdmin takeover, unverified payments, open Storage write/delete, missing Firestore security rules blocking production. |
| **High** | **23** | 35.4% | Broken DM routing, fake ATS statuses, unrestricted employer access to competitor candidates, self-locking profile updates, silent notifications, missing runtime indexes, Next.js image crashes, plaintext password bypass. |
| **Medium** | **23** | 35.4% | Feed-specific copy on platform error boundary, unpersisted privacy/notification toggles, date of birth dropped at signup, unenforced bans, infinite subscription access, pricing discrepancies, join request memory leaks, hydration DOM violations. |
| **Low** | **6** | 9.2% | Misleading cursor-pointer on static cards, character encoding glitches (`?` instead of `₦`), Netlify fallback URLs, duplicate return statements, dead video refs, hardcoded mock AI assistant responses. |
| **Total Issues** | **65** | **100%** | **65 Distinct, Code-Verified Defects across 8 Functional Domains** |

#### Subsystem & Category Distribution
| Category Identifier | Category / Domain | Issue Count | Critical | High | Medium | Low |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **SEC** | Security, Authentication & Access Control | 10 | 7 | 2 | 1 | 0 |
| **PAY** | Payments, Billing & Monetization | 5 | 1 | 2 | 2 | 0 |
| **DATA** | Database Architecture & Firestore Security Rules | 10 | 2 | 5 | 3 | 0 |
| **ATS** | Job Board & Applicant Tracking System (ATS) | 6 | 0 | 2 | 4 | 0 |
| **ROUT** | Frontend Routing, Auth Guards & Hydration | 9 | 1 | 3 | 4 | 1 |
| **DEAD** | Interactive Controls & Dead UI Elements | 10 | 0 | 4 | 5 | 1 |
| **DATA-UI** | Data Integrity, State Synchronization & Mock Surfaces | 12 | 0 | 4 | 4 | 4 |
| **ARCH** | Architectural & Third-Party Integration Gaps | 3 | 2 | 1 | 0 | 0 |
| **TOTALS** | **All Categories** | **65** | **13** | **23** | **23** | **6** |

---

### 1.3 Top 10 Critical Risks Requiring Immediate Remediation

1. **Unauthenticated Remote Database Wipe (`/api/clear-connections`)**: A public HTTP GET endpoint permanently erases the entire `connections` collection in Firestore without checking authentication or authorization.
2. **Plaintext Password Storage & Backdoor Login (`resetPasswordDirect`)**: "Forgot Password" allows resetting any user's password directly to Firestore as plaintext (`updatedPasswordHint`), bypassing Firebase Auth and granting instant administrative privileges if applied to `elijah@rhockstarconnect.com`.
3. **SuperAdmin Privilege Escalation via Open Rules (`firestore.rules`)**: Authenticated users can modify their own user document to `{ role: 'admin' }`, immediately passing `isAdmin()` checks across the entire database.
4. **IDOR on All Private Direct Messages (`firestore.rules`)**: The `/messages/{messageId}` match rule allows any logged-in user to read all direct messages across the entire platform.
5. **Universal Cloud Storage Overwrite & Deletion (`storage.rules`)**: Storage rules use a blanket wildcard allowing any authenticated user to overwrite or delete any file (avatars, resumes, chat media) with no file size or MIME restrictions.
6. **Production Failure on 11 Core Collections (`firestore.rules`)**: Missing security rules for `chats`, `jobs`, `job_applications`, `connections`, `follows`, `dating_interactions`, and `notifications` cause client SDK operations to fail with `permission-denied` in production.
7. **Client-Side Free Subscription & Ad Activation Exploits (`premium/page.tsx`, `ads.ts`)**: Membership tier upgrades are handled entirely by client-side callbacks without server verification; ad activation features a simulation button that publishes ads live to the feed for free.
8. **Hardcoded Production SuperAdmin Credentials in Git (`scripts/createAdmin.js`)**: Plaintext production email and passwords (`RhockstarAdmin2026`) are committed to version control.
9. **Self-Locking User Profile Update Batch Failure (`users.ts`)**: Updating a user's name or avatar cascades updates across all posts containing their comments. If the post is authored by another user, `firestore.rules` rejects the batch, permanently blocking profile edits.
10. **Public Company Profile Locked Out by Route Guard (`ProtectedRoute.tsx`)**: Unauthenticated guests clicking shared company profile URLs (`/company/[username]`) are redirected to `/login`, blocking prospective applicants and clients.

---

## 2. Issue Catalog

---

### Category 1: Security, Authentication & Access Control (SEC)

#### SEC-01: Unauthenticated Remote Database Wipe via Public GET Endpoint
- **Severity**: **Critical**
- **Component**: Backend API Route / Database Integrity
- **File & Lines**: `src/app/api/clear-connections/route.ts:4-22`
- **User Flow / Scenario**: An unauthenticated web crawler, search engine indexer, or malicious external user sends an HTTP `GET` request to `https://rhockstarconnect.com/api/clear-connections`.
- **Suspected Root Cause**: A test database wipe script was committed and exposed as a public Next.js API route without authentication, authorization, or rate limiting. Using `adminDb`, it bypasses all Firestore rules. Furthermore, attempting to delete all documents in a single unchunked Firestore `writeBatch` will crash with an unhandled exception if documents exceed 500.
- **Evidence Snippet**:
  ```ts
  // src/app/api/clear-connections/route.ts:4-18
  export async function GET() {
    try {
      const querySnapshot = await adminDb.collection('connections').get();
      let count = 0;
      const batch = adminDb.batch();
      for (const d of querySnapshot.docs) {
        batch.delete(d.ref);
        count++;
      }
      await batch.commit();
      return NextResponse.json({ success: true, count });
  ```
- **Recommended Fix**:
  Delete `src/app/api/clear-connections/route.ts` immediately. If administrative cleanup utilities are required, create a protected script or restrict behind `adminAuth.verifyIdToken(token)` with SuperAdmin role validation.

---

#### SEC-02: Plaintext Password Storage and Backdoor Fake Login Bypass
- **Severity**: **Critical**
- **Component**: Authentication & Credential Storage
- **File & Lines**: `src/lib/auth.ts:144-165, 177-205`, `src/components/auth/ResetPasswordModal.tsx:45-56`
- **User Flow / Scenario**: An attacker selects "Forgot Password" on `/login`, supplies any targeted email or username (e.g. `elijah@rhockstarconnect.com`), and enters a new password. The attacker then logs in with that password.
- **Suspected Root Cause**: `resetPasswordDirect` writes the new password as plaintext into the user document field `updatedPasswordHint` without verification, email confirmation, or token hashing. During `loginUser`, when Firebase Auth fails, a fallback checks `userData.updatedPasswordHint === password`. If matched, it manufactures a fake user session and automatically assigns `updateData.role = "admin"` if the email is `elijah@rhockstarconnect.com`. Because no Firebase Auth session is created, `auth.currentUser` is `null`, breaking all subsequent Firebase SDK operations.
- **Evidence Snippet**:
  ```ts
  // src/lib/auth.ts:148-163
  if (userData.updatedPasswordHint && userData.updatedPasswordHint === password) {
    const fakeUser: any = {
      uid: userDoc.id,
      email: userData.email,
      displayName: userData.fullName
    };
    const updateData: any = { lastLogin: serverTimestamp() };
    if (userData.email?.toLowerCase() === "elijah@rhockstarconnect.com") {
      updateData.role = "admin";
    }
    await setDoc(doc(db, "users", userDoc.id), updateData, { merge: true });
    await syncAuthStore(userDoc.id, fakeUser);
    return { user: fakeUser, error: null };
  }
  // src/lib/auth.ts:196-199
  await updateDoc(doc(db, "users", userDoc.id), {
    passwordUpdated: serverTimestamp(),
    updatedPasswordHint: newPassword
  });
  ```
- **Recommended Fix**:
  1. Completely remove `resetPasswordDirect` and the catch-block fallback in `loginUser`.
  2. Implement standard Firebase password recovery using `sendPasswordResetEmail(auth, email)`.
  3. Delete the `updatedPasswordHint` field from all documents in the `users` Firestore collection.

---

#### SEC-03: Arbitrary Privilege Escalation to SuperAdmin via Open Firestore Rules
- **Severity**: **Critical**
- **Component**: Authorization & Firestore Security Rules
- **File & Lines**: `firestore.rules:14-24`, `src/lib/auth.ts:124-126`, `src/lib/services/users.ts:255`
- **User Flow / Scenario**: Any standard registered user opens the browser developer console and executes:
  `updateDoc(doc(db, "users", auth.currentUser.uid), { role: "admin" })`.
- **Suspected Root Cause**:
  1. `firestore.rules` verifies admin privileges by reading `data.role == 'admin'` on the caller's user document.
  2. The `/users/{userId}` match block permits `isOwner(userId)` to create and update their document with no field restriction.
  3. A user can write `role: 'admin'`, immediately becoming a SuperAdmin for all security rule evaluations and gaining full access to the admin portal (`/admin`).
- **Evidence Snippet**:
  ```firestore-rules
  // firestore.rules:14-24
  function isAdmin() {
    return isAuthenticated() && 
      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  }
  match /users/{userId} {
    allow read: if isAuthenticated();
    allow create, update: if isOwner(userId) || isAdmin();
    allow delete: if isAdmin();
  }
  ```
- **Recommended Fix**:
  1. Restrict user self-updates in `firestore.rules` to prevent modifying privileged fields:
     ```firestore-rules
     allow update: if isOwner(userId) && 
       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'isBanned', 'subscriptionTier', 'subscriptionStatus', 'stardomXP', 'stardomRank'])
       || isAdmin();
     ```
  2. Transition administrative role verification to Firebase Auth Custom Claims (`request.auth.token.admin == true`).

---

#### SEC-04: Insecure Direct Object Reference (IDOR) on Private Direct Messages
- **Severity**: **Critical**
- **Component**: Firestore Security Rules / Data Privacy
- **File & Lines**: `firestore.rules:48-50`
- **User Flow / Scenario**: An authenticated user queries `collection(db, 'messages')` using the Firebase Client SDK.
- **Suspected Root Cause**: The security rule for `/messages/{messageId}` allows any authenticated user unrestricted read access: `allow read, create: if isAuthenticated();`. Any logged-in user can intercept and inspect all private messages across the platform.
- **Evidence Snippet**:
  ```firestore-rules
  // firestore.rules:48-50
  // Direct Messages
  match /messages/{messageId} {
    allow read, create: if isAuthenticated();
  }
  ```
- **Recommended Fix**:
  Scope message access strictly to chat participants:
  ```firestore-rules
  match /chats/{chatId} {
    allow read, write: if isAuthenticated() && request.auth.uid in resource.data.participants;
    match /messages/{messageId} {
      allow read: if isAuthenticated() && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.senderId && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
  ```

---

#### SEC-05: Unrestricted Cloud Storage Overwrite, Deletion & Missing Quotas
- **Severity**: **Critical**
- **Component**: Firebase Storage Security Rules
- **File & Lines**: `storage.rules:8-11`
- **User Flow / Scenario**: An authenticated malicious user uploads a 5GB file, overwrites an existing user's resume or avatar, or deletes company logos by passing another user's file path to `deleteObject()`.
- **Suspected Root Cause**: Wildcard rule `match /{allPaths=**} { allow read, write: if request.auth != null; }` grants universal write and delete permissions over the entire storage bucket with zero ownership, MIME type, or file size checks.
- **Evidence Snippet**:
  ```storage-rules
  // storage.rules:8-11
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow read/write access to all authenticated users
      allow read, write: if request.auth != null;
    }
  }
  ```
- **Recommended Fix**:
  Enforce path-scoped storage rules with explicit file size and content-type constraints:
  ```storage-rules
  match /b/{bucket}/o {
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /resumes/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType == 'application/pdf';
    }
  }
  ```

---

#### SEC-06: Production Admin Credentials Hardcoded in Repository Scripts
- **Severity**: **Critical**
- **Component**: Credential Management / Git Hygiene
- **File & Lines**: `scripts/createAdmin.js:19-21`, `scripts/seed-admin.mjs:36-38`, `scratch/testStorage.js:21`
- **User Flow / Scenario**: Anyone with read access to the GitHub repository extracts the plaintext production credentials and logs in as SuperAdmin.
- **Suspected Root Cause**: Administrative creation and seeding scripts contain hardcoded production credentials.
- **Evidence Snippet**:
  ```js
  // scripts/createAdmin.js:19-20
  const email = 'elijah@rhockstarconnect.com';
  const password = 'RhockstarAdmin2026';
  ```
- **Recommended Fix**:
  1. Immediately rotate the password for `elijah@rhockstarconnect.com` in the Firebase Authentication console.
  2. Remove hardcoded credentials and read them from environment variables or interactive CLI prompts.
  3. Add `scratch/` to `.gitignore`.

---

#### SEC-07: Unauthenticated Push Notification Injection & User Oracle
- **Severity**: **Critical**
- **Component**: Backend API Route / Push Notifications
- **File & Lines**: `src/app/api/notify/route.ts:5-68`
- **User Flow / Scenario**: An attacker sends a `POST` request to `https://rhockstarconnect.com/api/notify` with `{ userId: "target_uid", title: "Phishing Alert", body: "Click here: https://evil.com" }`.
- **Suspected Root Cause**: The endpoint parses the request body and broadcasts Firebase Cloud Messages via `adminMessaging` without verifying authentication or session tokens. Furthermore, returning a 404 on missing `userId` allows user enumeration.
- **Evidence Snippet**:
  ```ts
  // src/app/api/notify/route.ts:5-13, 97-102
  export async function POST(req: Request) {
    try {
      const { userId, title, body, icon, url } = await req.json();
      if (!userId || !title || !body) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      ...
      const response = await adminMessaging.sendEachForMulticast(message);
  ```
- **Recommended Fix**:
  Verify the caller's Firebase ID token via `adminAuth.verifyIdToken()` in the `Authorization: Bearer` header, sanitize title and body, and reject untrusted URL protocols.

---

#### SEC-08: Missing Ownership Authorization Check on Employer ATS Job Route
- **Severity**: **High**
- **Component**: Employer ATS Dashboard / Data Privacy
- **File & Lines**: `src/app/(dashboard)/employer/[jobId]/page.tsx:119-122`, `src/lib/services/jobs.ts:227-247`
- **User Flow / Scenario**: An employer with an active Elite plan visits `/employer/[competitor_job_id]`.
- **Suspected Root Cause**: The route validates that the current user has `accountType: 'employer'` and `subscriptionTier: 'elite'`, but fails to verify that `job.companyId === profile.uid`. Any Elite employer can inspect and manipulate applicant resumes and candidate notes for any other company's job.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/employer/[jobId]/page.tsx:119-122
  const isEmployer = profile?.accountType === 'employer' || profile?.role === 'admin' || (profile as any)?.role === 'employer';
  const isElite = profile?.subscriptionTier === 'elite' || profile?.role === 'admin';

  if (!profile || !isEmployer || !isElite) {
    // Rejection only checks employer role and elite tier, NOT job ownership!
  ```
- **Recommended Fix**:
  Compare `job.companyId === profile.uid || profile.role === 'admin'`. If mismatched, return a 403 Access Denied state.

---

#### SEC-09: Banned User Status Is Never Enforced Across Auth and Protected Routes
- **Severity**: **Medium**
- **Component**: Moderation & Access Control
- **File & Lines**: `src/app/admin/(protected)/users/page.tsx:71-79`, `src/lib/auth.ts:80-175`, `src/components/auth/ProtectedRoute.tsx`
- **User Flow / Scenario**: An administrator bans a malicious user via the Admin Dashboard. The banned user refreshes their browser or logs in again.
- **Suspected Root Cause**: `toggleUserBan` writes `isBanned: true` to Firestore, but `loginUser`, `AuthProvider`, `ProtectedRoute`, and `firestore.rules` never inspect `isBanned`. Banned users retain complete access to post, comment, message, and swipe.
- **Evidence Snippet**:
  ```ts
  // src/app/admin/(protected)/users/page.tsx:71-72
  const newBanState = !user.isBanned;
  const res = await toggleUserBan(user.uid, newBanState);
  // toggleUserBan sets isBanned in Firestore, but nowhere in auth or routes is isBanned checked!
  ```
- **Recommended Fix**:
  1. Add an `isBanned` check in `AuthProvider.tsx` and `ProtectedRoute.tsx`, redirecting banned users to a `/banned` notice page.
  2. Reject logins in `loginUser` if `userData.isBanned === true`.
  3. Add `!get(/.../users/$(request.auth.uid)).data.isBanned` checks in `firestore.rules`.

---

#### SEC-10: Client-Side LocalStorage Dating Swipe Limit Bypass
- **Severity**: **High**
- **Component**: Dating Workflow / Monetization Guard
- **File & Lines**: `src/app/(dashboard)/dating/page.tsx:64-71, 80-85`
- **User Flow / Scenario**: A free tier user reaches their daily limit of 5 swipes. The user opens browser DevTools, clears `localStorage`, or opens Incognito, and continues swiping indefinitely.
- **Suspected Root Cause**: Swipe limits are enforced purely on the client via `localStorage.getItem('dating_swipes_YYYY-MM-DD')`.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/dating/page.tsx:81-84
  const newSwipes = swipesToday + 1;
  setSwipesToday(newSwipes);
  const dateKey = new Date().toISOString().split('T')[0];
  localStorage.setItem(`dating_swipes_${dateKey}`, newSwipes.toString());
  ```
- **Recommended Fix**:
  Persist swipe counts in Firestore under `/users/{uid}` or calculate them via `count()` on `dating_interactions` where `fromUserId == uid && createdAt >= startOfDay`.

---

### Category 2: Payments, Billing & Monetization (PAY)

#### PAY-01: Client-Side Payment Verification & Free Lifetime Tier Upgrade Tampering
- **Severity**: **Critical**
- **Component**: Billing & Subscription Flow
- **File & Lines**: `src/app/(dashboard)/premium/page.tsx:42-55, 71-89`
- **User Flow / Scenario**: A user opens `/premium`, selects "Elite", and closes the Flutterwave modal or executes `updateUserProfile(profile.uid, { subscriptionTier: 'elite', subscriptionStatus: 'active' })` in the console.
- **Suspected Root Cause**: Subscription tier updates are performed on the client within the `handleFlutterPayment` success callback. There is no server API route verifying transaction IDs, amounts, or signatures against Flutterwave's API. Additionally, no `premiumUntil` expiration date is written, conferring lifetime access for free.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/premium/page.tsx:43-45, 75-79
  if (response.status === 'successful' || response.status === 'completed') {
    onSuccess(tier);
  }
  ...
  const res = await updateUserProfile(profile.uid, {
    subscriptionTier: tier,
    subscriptionStatus: 'active'
  });
  ```
- **Recommended Fix**:
  1. Create a server endpoint `POST /api/payments/verify` that verifies the `transaction_id` directly with Flutterwave's API (`GET https://api.flutterwave.com/v3/transactions/:id/verify`) using the secret key.
  2. Implement an authenticated webhook endpoint with signature verification (`verif-hash`).
  3. Mutate `subscriptionTier` and `premiumUntil` (`Date.now() + 30 days`) exclusively via `adminDb` on the server.

---

#### PAY-02: Mock Ad Payment Simulation Button Bypasses Payment Processor
- **Severity**: **High**
- **Component**: Employer Advertisements / Monetization
- **File & Lines**: `src/app/(dashboard)/employer/ads/page.tsx:45-60, 224-239`, `src/lib/services/ads.ts:262-278`
- **User Flow / Scenario**: An advertiser submits a campaign that gets approved by an admin with a fee of ₦15,000. The advertiser clicks "Pay ₦15,000 to Activate" and the ad goes live immediately without any real payment.
- **Suspected Root Cause**: The payment button triggers `handleSimulatePayment`, which calls `confirmAdPayment(ad.id)` directly in Firestore. Furthermore, `firestore.rules:30` permits the ad owner to update their own document, allowing arbitrary status changes.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/employer/ads/page.tsx:45-51
  const handleSimulatePayment = async (ad: Advertisement) => {
    try {
      setPayingAdId(ad.id);
      // Simulate Paystack / Flutterwave success callback
      const res = await confirmAdPayment(ad.id);
      if (res.success) {
        toast.success(`Payment confirmed! Advert "${ad.title}" is now LIVE in the Feed! 🚀`);
  ```
- **Recommended Fix**:
  Integrate real Flutterwave/Paystack modal or standard checkout for ad activation, and confirm payment server-side before updating `status: 'active'`. Disallow client updates to `status` in `firestore.rules`.

---

#### PAY-03: Hardcoded Flutterwave Test Key Fallback & Missing Secret Gateway Keys
- **Severity**: **High**
- **Component**: Payment Gateway Configuration
- **File & Lines**: `src/app/(dashboard)/premium/page.tsx:21`, `.env.local`
- **User Flow / Scenario**: A production user initiates payment on `/premium`.
- **Suspected Root Cause**: `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` is undefined in `.env.local`. The application falls back to a hardcoded test key (`FLWPUBK_TEST-78ba9038855272bdb48441ac8989d5aa-X`), meaning transactions run in sandbox mode.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/premium/page.tsx:21
  public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-78ba9038855272bdb48441ac8989d5aa-X',
  ```
- **Recommended Fix**:
  Define `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` and server-side `FLUTTERWAVE_SECRET_KEY` in `.env.local` and Netlify settings, and validate them in `src/lib/env.ts`.

---

#### PAY-04: Unenforced Subscription Expirations Result in Infinite Access
- **Severity**: **Medium**
- **Component**: Subscription Lifecycle
- **File & Lines**: `src/lib/services/admin.ts:125`, `src/lib/services/referrals.ts:155`, `src/app/admin/(protected)/subscriptions/page.tsx:211`
- **User Flow / Scenario**: An admin grants a user 30 days of Pro membership, or a user earns 7 days via referrals. After 30 days elapse, the user continues to retain full Pro privileges.
- **Suspected Root Cause**: `premiumUntil` is saved as a timestamp, but nowhere in `AuthProvider.tsx`, middleware, or API routes is `Date.now() > new Date(profile.premiumUntil)` evaluated to downgrade expired users.
- **Evidence Snippet**:
  ```tsx
  // src/app/admin/(protected)/subscriptions/page.tsx:211
  {sub.premiumUntil ? new Date(sub.premiumUntil).toLocaleDateString() : "Lifetime"}
  ```
- **Recommended Fix**:
  In `AuthProvider.tsx` or on user login, compare `profile.premiumUntil` against the current time. If expired, automatically update `subscriptionTier: 'free'` and `subscriptionStatus: 'inactive'`.

---

#### PAY-05: Pricing Model Discrepancy Between Checkout and Admin Analytics
- **Severity**: **Medium**
- **Component**: Analytics & Financial Reporting
- **File & Lines**: `src/app/(dashboard)/premium/page.tsx:16` vs `src/app/admin/(protected)/subscriptions/page.tsx:48-49`
- **User Flow / Scenario**: Users are charged $2/month (Pro) and $5/month (Elite) at checkout. In the Admin Portal, estimated monthly recurring revenue is calculated as `(proCount * 9.99) + (eliteCount * 19.99)`.
- **Suspected Root Cause**: Discrepancy caused by lack of a centralized pricing constants file.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/premium/page.tsx:16
  const baseUSD = tier === 'pro' ? 2 : 5;

  // src/app/admin/(protected)/subscriptions/page.tsx:48-49
  // Estimated revenue calculation ($9.99/mo Pro, $19.99/mo Elite)
  const estRevenue = (proCount * 9.99) + (eliteCount * 19.99);
  ```
- **Recommended Fix**:
  Define a centralized `src/lib/constants/pricing.ts` exporting single sources of truth for tier prices.

---

### Category 3: Database Architecture & Firestore Security Rules (DATA)

#### DATA-01: Complete Production Failure Due to 11 Missing Collections in Firestore Rules
- **Severity**: **Critical**
- **Component**: Firestore Security Rules / Platform Operation
- **File & Lines**: `firestore.rules:1-65`
- **User Flow / Scenario**: Authenticated users attempt to browse jobs, apply to jobs, send chat messages, join communities, connect with colleagues, swipe on dating profiles, or receive notifications.
- **Suspected Root Cause**: Firestore rules default to DENY for all unlisted collections. The following 11 collections and subcollections used by client services are completely absent from `firestore.rules`:
  1. `jobs`
  2. `job_applications`
  3. `chats`
  4. `chats/{chatId}/messages`
  5. `communities/{communityId}/messages`
  6. `connections`
  7. `dating_interactions`
  8. `matches`
  9. `notifications`
  10. `referrals`
  11. `settings`
- **Evidence Snippet**:
  `firestore.rules` defines rules only for `users`, `advertisements`, `posts`, `communities` (shallow), `messages` (standalone), `mail`, and `reports`.
- **Recommended Fix**:
  Add explicit security rules for all 11 collections and subcollections, enforcing user authentication, participant checks, and document ownership.

---

#### DATA-02: Firestore Rules Reject Feed Likes, Comments, Poll Votes & Ad Tracking
- **Severity**: **Critical**
- **Component**: Feed Interactions & Analytics
- **File & Lines**: `firestore.rules:27-31, 34-38`, `src/lib/services/posts.ts:176, 258, 333`, `src/lib/services/ads.ts:294, 306`
- **User Flow / Scenario**: User B attempts to like, comment on, or vote in a poll on User A's post; visitors view or click on sponsored ads.
- **Suspected Root Cause**:
  1. `posts` rule requires `isAdmin() || (isAuthenticated() && resource.data.authorId == request.auth.uid)`. When User B interacts with User A's post, Firestore rejects the update because User B is not the post author.
  2. In `createPost`, the document records `userId`, not `authorId`. Because `resource.data.authorId` is `null`, even the author cannot edit or delete their own post.
  3. In `advertisements`, updates require `companyId == request.auth.uid`. When feed visitors view or click an ad, `trackAdImpression` or `trackAdClick` is rejected with `PERMISSION_DENIED`.
- **Evidence Snippet**:
  ```firestore-rules
  // firestore.rules:34-38
  match /posts/{postId} {
    allow read: if isAuthenticated();
    allow create: if isAuthenticated();
    allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.authorId == request.auth.uid);
  }
  ```
- **Recommended Fix**:
  1. Normalize field naming to `userId` across `posts.ts` and `firestore.rules`.
  2. Allow non-authors to update only the `likes`, `comments`, and `poll` fields.
  3. Track ad impressions via a backend API route (`POST /api/ads/track`) using `adminDb`.

---

#### DATA-03: Catastrophic Read Overhead, 500-Batch Limit & Permission Denial on Profile Updates
- **Severity**: **High**
- **Component**: User Service Layer / Firestore Performance
- **File & Lines**: `src/lib/services/users.ts:167-246`, `src/lib/services/admin.ts:241-319`
- **User Flow / Scenario**: A user updates their avatar, full name, or username in profile settings.
- **Suspected Root Cause**:
  1. `updateUserProfile` runs `getDocs(query(collection(db, 'posts')))`—downloading every post in the database to the client browser.
  2. It iterates through all comments and adds `batch.update(postDoc.ref, { comments: newComments })`.
  3. Under `firestore.rules:37`, updating another user's post is rejected, causing `batch.commit()` to fail with `Missing or insufficient permissions`.
  4. If total updates exceed 500 (`count > 500`), the batch write crashes with `FirebaseError: A maximum of 500 writes are allowed per batch`.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/users.ts:188-193, 207-208, 244
  const allPostsQuery = query(collection(db, 'posts'));
  const allPostsSnap = await getDocs(allPostsQuery);
  ...
  batch.update(postDoc.ref, { comments: newComments });
  count++;
  ...
  await batch.commit(); // Rejection if any post is authored by another user!
  ```
- **Recommended Fix**:
  Remove client-side collection-wide cascade updates. Render author and commenter details dynamically from the user profile or process denormalization asynchronously via Firebase Cloud Functions in chunked batches of <= 500.

---

#### DATA-04: Read-Modify-Write Race Conditions & 1MB Document Limit in Post Comments
- **Severity**: **High**
- **Component**: Posts Service
- **File & Lines**: `src/lib/services/posts.ts:333-358, 493-517`
- **User Flow / Scenario**: Two users comment simultaneously on a popular post.
- **Suspected Root Cause**: Comments are stored as an array field inside the post document. `addComment` reads the post, appends the comment to the array, and writes it back without a Firestore transaction. Concurrent comments overwrite each other. Additionally, posts with many comments risk exceeding Firestore's 1MB document limit.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/posts.ts:333-358
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  ...
  const existingComments = postData.comments || [];
  const updatedComments = [...existingComments, newComment];
  await updateDoc(postRef, {
    comments: updatedComments,
    commentsCount: increment(1)
  });
  ```
- **Recommended Fix**:
  Store comments in a subcollection `/posts/{postId}/comments/{commentId}` and use `arrayUnion` or Firestore transactions.

---

#### DATA-05: Missing Composite Firestore Indexes Causing Runtime Query Failures
- **Severity**: **High**
- **Component**: Database Indexes
- **File & Lines**: `src/lib/services/notifications.ts:88-93`, `src/lib/services/messages.ts:185-186`, `firestore.indexes.json`
- **User Flow / Scenario**: A user marks all notifications as read or opens an active chat.
- **Suspected Root Cause**: `markAllNotificationsAsRead` queries `where('userId', '==', userId)` and `where('read', '==', false)`. `markMessagesAsRead` queries with inequality `where('senderId', '!=', currentUserId)`. Neither compound index is declared in `firestore.indexes.json`.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/notifications.ts:88-90
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  ```
- **Recommended Fix**:
  Add required compound index definitions to `firestore.indexes.json`:
  ```json
  {
    "collectionGroup": "notifications",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "userId", "order": "ASCENDING" },
      { "fieldPath": "read", "order": "ASCENDING" }
    ]
  }
  ```

---

#### DATA-06: Referral Registration Blocked by User Document Ownership Rule
- **Severity**: **High**
- **Component**: Referral System / Registration
- **File & Lines**: `src/lib/services/referrals.ts:93-102`, `src/lib/auth.ts:69`
- **User Flow / Scenario**: A new user completes signup using a friend's referral code.
- **Suspected Root Cause**: During registration, `recordReferral` is called directly from the new user's browser, attempting to update the referrer's document (`updateDoc(referrerRef, ...)`). Under `firestore.rules:22` (`allow create, update: if isOwner(userId) || isAdmin()`), the update is rejected with `Missing or insufficient permissions`. The referrer never receives credit.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/referrals.ts:93-102
  const referrerRef = doc(db, 'users', referrerId);
  await updateDoc(referrerRef, {
    referralCount: increment(1),
    referredFriends: arrayUnion({
      uid: newUserId,
      name: newUserName,
      registeredAt: new Date().toISOString()
    })
  });
  ```
- **Recommended Fix**:
  Record referral associations via a serverless API route (`/api/referrals/record`) using `adminDb`.

---

#### DATA-07: Unauthenticated Username Login Fails due to Firestore Security Rules
- **Severity**: **High**
- **Component**: Authentication Service
- **File & Lines**: `src/lib/auth.ts:108-118`
- **User Flow / Scenario**: A user enters their username (without `@`) on the login screen and submits.
- **Suspected Root Cause**: `loginUser` attempts to resolve username to email by querying `collection(db, "users")` before authenticating. Because the user is unauthenticated, `firestore.rules:21` (`allow read: if isAuthenticated();`) rejects the read with `permission-denied`.
- **Evidence Snippet**:
  ```ts
  // src/lib/auth.ts:108-113
  if (!inputClean.includes("@")) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", inputClean.toLowerCase().replace('@', '')));
    const snapshot = await getDocs(q); // Fails with PERMISSION_DENIED
  ```
- **Recommended Fix**:
  Create an unauthenticated backend route `POST /api/auth/resolve-username` that queries `adminDb` with rate limiting, or enforce email-based login.

---

#### DATA-08: Discrepant and Unvalidated Environment Variables
- **Severity**: **Medium**
- **Component**: Configuration & Validation
- **File & Lines**: `src/lib/services/notifications.ts:123`, `src/lib/messaging.ts:20`, `src/lib/env.ts:1-33`
- **User Flow / Scenario**: Browser prompts user for Web Push Notification permissions.
- **Suspected Root Cause**:
  1. `notifications.ts` reads `process.env.NEXT_PUBLIC_VAPID_KEY`.
  2. `messaging.ts` reads `process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
  3. `validateEnv()` exists in `src/lib/env.ts` but is dead code (never called).
  4. No `.env.example` file exists in the repository.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/notifications.ts:123
  vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
  // src/lib/messaging.ts:20
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  ```
- **Recommended Fix**:
  Standardize variable naming to `NEXT_PUBLIC_FIREBASE_VAPID_KEY`, call `validateEnv()` in root layout, and add `.env.example`.

---

#### DATA-09: User Registration Schema Gaps Cause Inconsistent States
- **Severity**: **Medium**
- **Component**: User Model & Leaderboard
- **File & Lines**: `src/lib/auth.ts:49-65`, `src/lib/services/users.ts:14-45`
- **User Flow / Scenario**: A new user signs up and visits the leaderboard or views their subscription status.
- **Suspected Root Cause**: The Firestore document created in `registerUser` omits `role`, `subscriptionTier`, `subscriptionStatus`, `avatar`, `stardomXP`, `streakCount`, and `isVerified`. Newly registered users are omitted from queries sorting by `stardomXP` (leaderboard) because Firestore excludes documents missing the sorted field.
- **Evidence Snippet**:
  ```ts
  // src/lib/auth.ts:49-65
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    username: username.toLowerCase().replace('@', ''),
    email,
    accountType,
    bio: "",
    headline: "",
    // Omits: role, subscriptionTier, subscriptionStatus, stardomXP, streakCount, avatar
  ```
- **Recommended Fix**:
  Initialize all schema defaults explicitly in `registerUser`:
  `role: 'user'`, `subscriptionTier: 'free'`, `subscriptionStatus: 'inactive'`, `stardomXP: 0`, `stardomRank: 'Explorer'`, `streakCount: 0`, `avatar: ''`.

---

#### DATA-10: Partial Admin Account Deletion Leaves Orphaned Firebase Auth Records
- **Severity**: **Medium**
- **Component**: Admin Management / User Lifecycle
- **File & Lines**: `src/lib/services/admin.ts:92-100`, `src/app/admin/(protected)/users/page.tsx:81-91`
- **User Flow / Scenario**: An administrator deletes a user account from the Admin Portal.
- **Suspected Root Cause**: `deleteUserAdmin` executes `deleteDoc(doc(db, 'users', userId))` via client SDK. It does not delete the user account from Firebase Authentication. The user can still log in, but has no profile document, leading to application crashes.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/admin.ts:92-100
  export const deleteUserAdmin = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      return { success: true };
  ```
- **Recommended Fix**:
  Create an admin API route `DELETE /api/admin/users/:id` that deletes both Firebase Auth (`adminAuth.deleteUser(uid)`) and associated Firestore documents.

---

### Category 4: Job Board & Applicant Tracking System (ATS)

#### ATS-01: Application Tracker Displays Fabricated Statuses via Array Index Modulo
- **Severity**: **High**
- **Component**: Candidate Application Tracker
- **File & Lines**: `src/components/jobs/ApplicationTracker.tsx:21-38`, `src/app/(dashboard)/jobs/page.tsx:25`
- **User Flow / Scenario**: An applicant applies for jobs, then opens the "My Applications" tab to track their application statuses.
- **Suspected Root Cause**: Applied job IDs are kept in ephemeral React state (`appliedJobIds`) and lost on reload. Furthermore, `ApplicationTracker.tsx` does not fetch real statuses from `job_applications`; instead, it computes status using array index modulo: `statuses[index % statuses.length]`.
- **Evidence Snippet**:
  ```ts
  // src/components/jobs/ApplicationTracker.tsx:34-37
  {appliedJobs.map((job, index) => {
    // Assign random mock status based on index for demo purposes
    const status = statuses[index % statuses.length];
  ```
- **Recommended Fix**:
  Query `getUserApplications(profile.uid)` on mount and render real applicant status (`pending`, `reviewed`, `interviewing`, `accepted`, `rejected`) updated by employers.

---

#### ATS-02: Company ATS Pipeline Uses Hardcoded Mock Candidates & Never Persists
- **Severity**: **High**
- **Component**: Employer ATS Kanban Board
- **File & Lines**: `src/app/(dashboard)/company/[username]/ats/page.tsx:22-28, 45-55`
- **User Flow / Scenario**: An employer navigates to `/company/[username]/ats` to manage candidates across pipeline stages.
- **Suspected Root Cause**: The page uses a static hardcoded array (`MOCK_CANDIDATES`: "Alex Chen", "Sarah Jenkins", "Michael Ross"). Drag-and-drop actions modify only local React state; real applications are never loaded from Firestore.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/company/[username]/ats/page.tsx:22-28
  const MOCK_CANDIDATES: Candidate[] = [
    { id: "c1", name: "Alex Chen", role: "Senior Frontend Engineer", status: "applied", avatar: "A", matchScore: 92, appliedDate: "2 days ago" },
    { id: "c2", name: "Sarah Jenkins", role: "Senior Frontend Engineer", status: "applied", avatar: "S", matchScore: 85, appliedDate: "3 days ago" },
  ```
- **Recommended Fix**:
  Fetch actual applications for the company's posted jobs from `job_applications` and update application status in Firestore on drag-and-drop.

---

#### ATS-03: Silent Candidate Status Transitions Without User In-App Notifications
- **Severity**: **Medium**
- **Component**: Job Application Lifecycle
- **File & Lines**: `src/lib/services/jobs.ts:266-274`, `src/app/(dashboard)/settings/page.tsx:567`
- **User Flow / Scenario**: An employer updates a candidate's status to 'reviewed', 'interviewing', or 'rejected'.
- **Suspected Root Cause**: `updateApplicationStatus` writes to Firestore but does not call `createNotification`. The applicant is never notified of the change.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/jobs.ts:266-273
  export const updateApplicationStatus = async (applicationId: string, status: JobApplication['status']) => {
    try {
      const appRef = doc(db, "job_applications", applicationId);
      await updateDoc(appRef, { status });
      return { success: true };
  ```
- **Recommended Fix**:
  Fetch the application document to obtain `applicantId` and `jobTitle`, and call `createNotification({ userId: applicantId, type: 'job', title: 'Application Update', ... })`.

---

#### ATS-04: Tier 3 Referral Reward (+20 Job Applications) Is Ignored in Application Check
- **Severity**: **Medium**
- **Component**: Referral Rewards / Job Board Limits
- **File & Lines**: `src/lib/services/referrals.ts:165`, `src/app/(dashboard)/jobs/page.tsx:86-91`
- **User Flow / Scenario**: A user refers 5 friends, claims the Tier 3 reward ("+20 Job Applications"), and attempts to apply to a third job.
- **Suspected Root Cause**: `claimReferralReward` increments `extraJobApps` on the user profile in Firestore, but `handleApply` in `jobs/page.tsx` checks only `appliedJobIds.size >= 2` and completely ignores `profile.extraJobApps`.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/jobs/page.tsx:86-90
  const handleApply = async (job: JobListing, isFeatured?: boolean) => {
    const isFree = !profile?.subscriptionTier || profile.subscriptionTier === 'free';
    if (isFree && (appliedJobIds.size >= 2 || isFeatured)) {
      setPremiumLockOpen(true);
      return;
    }
  ```
- **Recommended Fix**:
  Update application limit check: `const allowed = 2 + (profile?.extraJobApps || 0); if (isFree && appliedJobIds.size >= allowed) ...`.

---

#### ATS-05: Employer Upgrade Fails to Persist `accountType` in Database
- **Severity**: **Medium**
- **Component**: Employer Account Transition
- **File & Lines**: `src/lib/services/users.ts:255-257`, `src/app/(dashboard)/jobs/post/page.tsx:83-92`
- **User Flow / Scenario**: A standard user clicks "Upgrade to Employer Account" on `/jobs/post`.
- **Suspected Root Cause**: `becomeEmployer` writes `{ role: 'employer' }` to Firestore, but leaves `accountType` unchanged (`'standard'`). The component updates `accountType: 'employer'` only in Zustand local storage. On refresh or login, `accountType` reverts to `'standard'`, breaking employer views.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/users.ts:255-257
  export const becomeEmployer = async (uid: string) => {
    return updateUserProfile(uid, { role: 'employer' });
  };
  // src/app/(dashboard)/jobs/post/page.tsx:87-88
  if (res.success) {
    useAuthStore.getState().setProfile({ ...profile, role: 'employer', accountType: 'employer' } as any);
  ```
- **Recommended Fix**:
  Update `becomeEmployer` to write `{ role: 'employer', accountType: 'employer' }` in Firestore.

---

#### ATS-06: Job Search "View Details" Only Triggers Ephemeral Toast
- **Severity**: **Medium**
- **Component**: Job Board UI
- **File & Lines**: `src/app/(dashboard)/jobs/page.tsx:342`
- **User Flow / Scenario**: A job seeker browses `/jobs` and clicks the "View Details" icon button on a job card.
- **Suspected Root Cause**: The button only triggers `toast.success('Viewing details for ' + job.title)` without opening a drawer, modal, or navigating to a job detail page.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/jobs/page.tsx:341-346
  <button 
    onClick={() => toast.success(`Viewing details for ${job.title}`)}
    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-white/5 text-xs font-semibold"
  >
    <ExternalLink className="w-4 h-4" />
  </button>
  ```
- **Recommended Fix**:
  Open a detailed job modal or navigate to `/jobs?jobId=${job.id}`.

---

### Category 5: Frontend Routing, Auth Guards & Hydration (ROUT)

#### ROUT-01: Public Company Profile Blocked by Protected Route Guard
- **Severity**: **Critical**
- **Component**: Routing & Auth Guard
- **File & Lines**: `src/components/auth/ProtectedRoute.tsx:35-39`
- **User Flow / Scenario**: An unauthenticated guest or search engine bot accesses a company profile (e.g. `https://rhockstarconnect.com/company/paystack`).
- **Suspected Root Cause**: `isPublicRoute` allows unauthenticated access to `/feed`, `/profile`, `/jobs`, and `/terms`, but omits `/company/`. Unauthenticated visitors are immediately redirected to `/login`.
- **Evidence Snippet**:
  ```tsx
  // src/components/auth/ProtectedRoute.tsx:35-39
  const isPublicRoute = 
    pathname === "/feed" || 
    pathname.startsWith("/profile") || 
    pathname === "/jobs" || 
    pathname === "/terms";
  ```
- **Recommended Fix**:
  Add `pathname.startsWith("/company")` and `pathname === "/privacy"` to `isPublicRoute`.

---

#### ROUT-02: Notification Link Query Parameter Mismatch Breaks DM Navigation
- **Severity**: **High**
- **Component**: Notifications & Direct Messaging Navigation
- **File & Lines**: `src/app/(dashboard)/notifications/page.tsx:58`, `src/app/(dashboard)/messages/page.tsx:53`
- **User Flow / Scenario**: A user receives a direct message notification, goes to `/notifications`, and clicks the notification item.
- **Suspected Root Cause**: `notifications/page.tsx` routes to `/messages?chatId=...`, but `messages/page.tsx` only reads `searchParams.get('user') || searchParams.get('uid')`. The `chatId` query parameter is ignored, leaving the user on an empty chat state.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/notifications/page.tsx:58
  router.push(`/messages?chatId=${notification.targetId || notification.senderId}`);

  // src/app/(dashboard)/messages/page.tsx:53
  const targetUserParam = searchParams.get('user') || searchParams.get('uid');
  ```
- **Recommended Fix**:
  Update `messages/page.tsx` line 53 to check `searchParams.get('chatId') || searchParams.get('user') || searchParams.get('uid')`.

---

#### ROUT-03: Global Error Boundary Hardcoded Specifically for Feed Route
- **Severity**: **Medium**
- **Component**: Global Error Handling
- **File & Lines**: `src/app/error.tsx:23-40`
- **User Flow / Scenario**: A runtime exception occurs on any non-feed page (e.g. `/settings`, `/dating`, `/employer/ads`).
- **Suspected Root Cause**: Root `error.tsx` renders feed-specific text: "Connecting to Feed...", "Syncing your session with Rhockstar Connect", and button "Reload Feed".
- **Evidence Snippet**:
  ```tsx
  // src/app/error.tsx:23-40
  <h2 className="text-2xl font-extrabold mb-2">Connecting to Feed...</h2>
  <p className="text-slate-400 max-w-sm text-sm mb-6">
    Syncing your session with Rhockstar Connect.
  </p>
  <button onClick={() => ...}>
    <RefreshCw className="w-4 h-4" />
    <span>Reload Feed</span>
  </button>
  ```
- **Recommended Fix**:
  Replace feed-specific copy with generic application error copy ("Something went wrong") and a "Try Again" / "Go to Feed" action.

---

#### ROUT-04: Next.js Image Optimization Fatal Crash on Firebase Storage URLs
- **Severity**: **High**
- **Component**: Next.js Configuration / Layout Media
- **File & Lines**: `next.config.ts:15-20`, `src/components/layout/AdminSidebar.tsx:111`, `src/app/(dashboard)/employer/[jobId]/page.tsx:210`, `src/app/admin/(protected)/users/page.tsx:217`
- **User Flow / Scenario**: A user or admin with a Firebase Storage custom avatar visits any page rendering their avatar with Next.js `<Image>`.
- **Suspected Root Cause**: `next.config.ts` configures `images.remotePatterns` with only `images.unsplash.com`. When Next.js encounters `firebasestorage.googleapis.com` or `lh3.googleusercontent.com`, it crashes with `Invalid src prop on next/image, hostname is not configured under images in your next.config.js`.
- **Evidence Snippet**:
  ```ts
  // next.config.ts:14-21
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  ```
- **Recommended Fix**:
  Add `firebasestorage.googleapis.com` and `lh3.googleusercontent.com` to `remotePatterns` in `next.config.ts`.

---

#### ROUT-05: Missing `/icon.png` Causes 404 Network Errors on Every Page Load
- **Severity**: **High**
- **Component**: Public Assets & Layout Images
- **File & Lines**: `src/components/layout/Sidebar.tsx:71, 75`, `src/components/layout/MobileHeader.tsx:125`, `public/firebase-messaging-sw.js:20`, `src/app/(dashboard)/premium/page.tsx:34`
- **User Flow / Scenario**: Visiting any page inside the application loads broken images and triggers 404 network errors for `/icon.png`.
- **Suspected Root Cause**: Components reference `/icon.png`, but `public/` contains only `icon-192x192.png` and `icon-512x512.png`.
- **Evidence Snippet**:
  ```tsx
  // src/components/layout/Sidebar.tsx:71
  <Image src="/icon.png" alt="Rhockstar Connect" width={40} height={40} className="rounded-xl" />
  ```
- **Recommended Fix**:
  Copy `public/icon-192x192.png` to `public/icon.png`.

---

#### ROUT-06: Nested Interactive Anchor Tags in Global Search Results Trigger Hydration Mismatch
- **Severity**: **Medium**
- **Component**: Search Page / DOM Validation
- **File & Lines**: `src/app/(dashboard)/search/page.tsx:224-226`, `src/components/feed/PostCard.tsx:236`
- **User Flow / Scenario**: A user opens `/search?q=rhockstar` and views posts in the search tab.
- **Suspected Root Cause**: `search/page.tsx` wraps `<PostCard />` in a `<Link>` tag. Inside `PostCard.tsx`, the author avatar and name are also wrapped in `<Link>`. In HTML5 and React 19, nested `<a>` elements are invalid, triggering React hydration warnings and breaking navigation event propagation.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/search/page.tsx:224-226
  <Link key={post.id} href={`/feed?postId=${post.id}#post-${post.id}`} className="block hover:opacity-95 transition-opacity">
    <PostCard post={post} />
  </Link>
  ```
- **Recommended Fix**:
  Remove the outer `<Link>` wrapper from `search/page.tsx` and allow `PostCard` to manage internal link clicks.

---

#### ROUT-07: Profile Join Calculation Evaluates Current Date on Every Render
- **Severity**: **Medium**
- **Component**: Profile Header
- **File & Lines**: `src/components/profile/ProfileHeader.tsx:252`
- **User Flow / Scenario**: A user views any user profile (`/profile?uid=...`).
- **Suspected Root Cause**: Line 252 evaluates `Joined {format(new Date(), "MMMM yyyy")}` rather than reading `profile.createdAt`. Every user displays "Joined September 2026" (current month), and server/client timezone differences trigger hydration mismatches.
- **Evidence Snippet**:
  ```tsx
  // src/components/profile/ProfileHeader.tsx:250-253
  <div className="flex items-center gap-1.5 text-slate-400 py-1 px-2 md:py-1.5 md:px-4 rounded-full">
    <Calendar className="w-3.5 h-3.5 shrink-0" />
    <span>Joined {format(new Date(), "MMMM yyyy")}</span>
  </div>
  ```
- **Recommended Fix**:
  Format `profile.createdAt` or fall back to "Recently" if undefined.

---

#### ROUT-08: Memory Leak & Re-render Object URL Creation in Dating Profile
- **Severity**: **Medium**
- **Component**: Dating Profile Photo Upload
- **File & Lines**: `src/app/(dashboard)/dating/profile/page.tsx:183`
- **User Flow / Scenario**: A user selects new photos on `/dating/profile` and types in bio or interests fields.
- **Suspected Root Cause**: `URL.createObjectURL(file)` is called directly inside JSX during rendering on every keystroke, allocating uncollected object URLs and causing memory bloat.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/dating/profile/page.tsx:181-183
  {newPhotos.map((file, i) => (
    <div key={`new-${i}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden group/photo">
      <img src={URL.createObjectURL(file)} alt="New Dating Photo" className="w-full h-full object-cover" />
  ```
- **Recommended Fix**:
  Generate preview URLs once in `handlePhotoAdd` and revoke them via `URL.revokeObjectURL` on component unmount.

---

#### ROUT-09: Misleading cursor-pointer Class on Static Container in Premium Card
- **Severity**: **Low**
- **Component**: Premium Subscription Page (`src/app/(dashboard)/premium/page.tsx:193-208`)
- **File & Lines**: `src/app/(dashboard)/premium/page.tsx:193-208`
- **User Flow / Scenario**: A user hovers/clicks over the Elite plan card container expecting the whole card to be interactive.
- **Suspected Root Cause**: The Elite subscription card container div on lines 193-196 has `cursor-pointer`, but contains no `onClick` handler (the actual payment click is on the child `<PaymentButton>`), presenting a misleading visual affordance that the card body is clickable.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/premium/page.tsx:193-208
  <div className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-brand to-brand-purple p-[1px] transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] mt-auto cursor-pointer">
    <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors z-0" />
    <PaymentButton 
      tier="elite"
      profile={profile}
      currency={currency}
      formatPrice={formatPrice}
      onSuccess={handleSubscribe}
      disabled={processingTier !== null || profile?.subscriptionTier === 'elite'}
      className="relative z-10 w-full flex items-center justify-center gap-2 bg-slate-900 px-6 py-4 rounded-xl group-hover:bg-opacity-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <span className="font-bold text-white tracking-wide">
        {profile?.subscriptionTier === 'elite' ? 'Current Plan' : 'Upgrade to Elite'}
      </span>
    </PaymentButton>
  </div>
  ```
- **Recommended Fix**:
  Remove `cursor-pointer` from the outer wrapper div to avoid confusing clickable styling.

---

### Category 6: Interactive Controls & Feature Completeness (DEAD)

#### DEAD-01: Non-Functional Change Password Form in Settings
- **Severity**: **High**
- **Component**: User Settings / Account Security
- **File & Lines**: `src/app/(dashboard)/settings/page.tsx:288-300`
- **User Flow / Scenario**: A user navigates to `/settings`, enters Current Password and New Password, and looks for a way to save.
- **Suspected Root Cause**: The input fields are static JSX without `value`, `onChange`, form wrapper, or submit button.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/settings/page.tsx:291-299
  <div>
    <label className="block text-sm font-bold text-slate-300 mb-2">Current Password</label>
    <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
  </div>
  <div>
    <label className="block text-sm font-bold text-slate-300 mb-2">New Password</label>
    <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand transition-colors" />
  </div>
  // No submit button follows
  ```
- **Recommended Fix**:
  Bind inputs to state and add an "Update Password" button executing Firebase `updatePassword(auth.currentUser, newPassword)`.

---

#### DEAD-02: Privacy & Notification Settings Toggles Do Not Persist
- **Severity**: **Medium**
- **Component**: User Settings / Preferences
- **File & Lines**: `src/app/(dashboard)/settings/page.tsx:548, 559`
- **User Flow / Scenario**: A user toggles notification preferences in `/settings` and reloads the page.
- **Suspected Root Cause**: Toggles trigger only an ephemeral toast (`toast.success(...)`) and do not persist to Firestore.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/settings/page.tsx:548
  <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => toast.success("Connection alert preference saved!")} />
  // src/app/(dashboard)/settings/page.tsx:559
  <input type="checkbox" defaultChecked className="sr-only peer" onChange={() => toast.success("Post interaction preference saved!")} />
  ```
- **Recommended Fix**:
  Save toggle preferences under `notificationSettings` on `/users/{uid}` in Firestore.

---

#### DEAD-03: Post and User Report / Block Actions Are Cosmetic Mockups
- **Severity**: **High**
- **Component**: Moderation & Safety
- **File & Lines**: `src/components/feed/PostCard.tsx:273, 276`, `src/app/(dashboard)/dating/page.tsx:304, 307`
- **User Flow / Scenario**: A user flags abusive content or blocks a harasser via the dropdown menu.
- **Suspected Root Cause**: The menu items only trigger `toast.success("Post reported to admins.")` or `toast.success("User blocked...")`. No record is written to the `reports` collection and the user is not added to `blockedUsers`.
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
  Call `createReport({ targetId: post.id, targetType: 'post', reporterId: profile.uid, reason: 'user_flagged' })` and update user's `blockedUsers` array in Firestore.

---

#### DEAD-04: Admin Jobs Management Delete Button Has No onClick Handler
- **Severity**: **High**
- **Component**: Admin Job Management
- **File & Lines**: `src/app/admin/(protected)/jobs/page.tsx:116-118`
- **User Flow / Scenario**: An admin clicks the trash icon button next to a job listing on `/admin/jobs`.
- **Suspected Root Cause**: The `<button>` tag contains no `onClick` handler.
- **Evidence Snippet**:
  ```tsx
  // src/app/admin/(protected)/jobs/page.tsx:116-118
  <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
    <Trash2 className="h-5 w-5" />
  </button>
  ```
- **Recommended Fix**:
  Attach `onClick={() => handleDeleteJob(job.id)}`.

---

#### DEAD-05: Dead File Attachment and Voice Note Controls in Direct Messages
- **Severity**: **High**
- **Component**: Direct Messaging Interface
- **File & Lines**: `src/app/(dashboard)/messages/page.tsx:103-109, 1373-1401`
- **User Flow / Scenario**: A user wants to attach a document or record a voice note in a DM conversation.
- **Suspected Root Cause**: Media states and handlers (`mediaFile`, `handleFileSelect`, `mediaRecorderRef`) are defined in component logic, but the DM input JSX contains only a `<textarea>` and submit button.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/messages/page.tsx:1373-1401
  {/* DM Input Bar */}
  <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900/90 flex items-center gap-3">
    <textarea ... />
    <button type="submit" ...><Send className="w-5 h-5" /></button>
  </form>
  ```
- **Recommended Fix**:
  Add paperclip and microphone buttons hooked to file inputs and `MediaRecorder` in the DM form.

---

#### DEAD-06: Phone Verification Button Without Action
- **Severity**: **Medium**
- **Component**: User Settings / Verification
- **File & Lines**: `src/app/(dashboard)/settings/page.tsx:318`
- **User Flow / Scenario**: A user clicks "Verify Now" next to Phone Verification in `/settings`.
- **Suspected Root Cause**: The button has no `onClick` handler.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/settings/page.tsx:318
  <button className="px-4 py-2 bg-brand/10 text-brand font-bold rounded-lg border border-brand/20 hover:bg-brand hover:text-white transition-colors">
    Verify Now
  </button>
  ```
- **Recommended Fix**:
  Attach an `onClick` opening a phone verification modal or label as "Coming Soon".

---

#### DEAD-07: "Follow Company" Button Has No Handler
- **Severity**: **Medium**
- **Component**: Company Public Profile
- **File & Lines**: `src/app/(dashboard)/company/[username]/page.tsx:109-111`
- **User Flow / Scenario**: A user clicks "Follow Company" on `/company/[username]`.
- **Suspected Root Cause**: The `<button>` tag contains no `onClick` handler.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/company/[username]/page.tsx:109-111
  <button className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-500/20">
    Follow Company
  </button>
  ```
- **Recommended Fix**:
  Connect to `src/lib/services/follows.ts` to persist followed company IDs.

---

#### DEAD-08: Resource Masterclass & Article Cards Styled with Pointer But Lack Links
- **Severity**: **Medium**
- **Component**: Career & Dating Resources
- **File & Lines**: `src/app/(dashboard)/resources/career/page.tsx:68-75`, `src/app/(dashboard)/resources/dating/page.tsx:68-75`
- **User Flow / Scenario**: A user hovers over "Featured Masterclass" cards and clicks.
- **Suspected Root Cause**: Cards have `cursor-pointer` and hover styles but lack `<a>`, `<Link>`, or `onClick` handlers.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/resources/career/page.tsx:68-75
  <div className="neo-card p-6 bg-slate-900/40 rounded-3xl border border-white/5 group cursor-pointer hover:border-brand/30 transition-all">
    <div className="aspect-video w-full bg-slate-800 rounded-2xl relative overflow-hidden ...">
  ```
- **Recommended Fix**:
  Add `href` attributes linking to video players or guides.

---

#### DEAD-09: Admin Global Settings Toggles Are Never Enforced in App
- **Severity**: **Medium**
- **Component**: Admin Platform Controls
- **File & Lines**: `src/app/admin/(protected)/settings/page.tsx:18-23`, `src/lib/services/admin.ts:201-230`
- **User Flow / Scenario**: An admin enables Maintenance Mode or disables Registrations in `/admin/settings`.
- **Suspected Root Cause**: Settings are saved to `/settings/global` but never queried or enforced by any user-facing page, layout, or middleware.
- **Evidence Snippet**:
  ```ts
  // src/app/admin/(protected)/settings/page.tsx:18-20
  maintenanceMode: false,
  announcementBanner: "Welcome to Rhockstar Connect! Connect, Collaborate & Discover Opportunities.",
  allowRegistrations: true,
  ```
- **Recommended Fix**:
  Query global settings in the root layout or Next.js middleware to enforce maintenance mode and disable registration.

---

#### DEAD-10: AI Assistant Service Uses Canned Static Responses
- **Severity**: **Low**
- **Component**: AI Assistant Service
- **File & Lines**: `src/lib/services/ai.ts:27-37`
- **User Flow / Scenario**: A user invokes AI career or dating advice.
- **Suspected Root Cause**: `getAIResponse` returns three static hardcoded string templates instead of calling Gemini API.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/ai.ts:27-32
  export async function getAIResponse(personaOrPrompt: string, prompt?: string): Promise<string> {
    const targetPersona = prompt ? (personaOrPrompt as AIPersona) : 'career';
    if (targetPersona === 'dating') {
      return `Based on your profile, here is advice for authentic connections: Keep your bio genuine...`;
    }
  ```
- **Recommended Fix**:
  Integrate `@google/genai` using `process.env.GEMINI_API_KEY` for dynamic generative advice.

---

### Category 7: Data Integrity, State Synchronization & Mock Surfaces (DATA-UI)

#### DATA-UI-01: Profile Editor Discards Social Media Links on Submit
- **Severity**: **High**
- **Component**: Profile Editor Modal
- **File & Lines**: `src/components/profile/EditProfileModal.tsx:360-369`
- **User Flow / Scenario**: A user enters LinkedIn, Twitter, GitHub, and Instagram URLs in "Edit Profile" and clicks "Save Changes".
- **Suspected Root Cause**: Input fields have no `value`, `name`, or `onChange` handlers; values are never included in the submission payload.
- **Evidence Snippet**:
  ```tsx
  // src/components/profile/EditProfileModal.tsx:362-367
  {['LinkedIn', 'Twitter', 'GitHub', 'Instagram'].map(social => (
    <div key={social} className="flex flex-col gap-1">
      <label className="text-sm font-medium text-secondary ml-1">{social}</label>
      <input type="url" className="neo-input" placeholder={`https://${social.toLowerCase()}.com/...`} />
    </div>
  ))}
  ```
- **Recommended Fix**:
  Bind inputs to local state and persist them under `socialLinks` in Firestore.

---

#### DATA-UI-02: Immediate Irreversible Account Lockout Trap on Minor Age Typo
- **Severity**: **High**
- **Component**: Profile Editor Validation
- **File & Lines**: `src/components/profile/EditProfileModal.tsx:95-103`
- **User Flow / Scenario**: An adult user accidentally selects a birth year making age < 18 and clicks "Save Changes".
- **Suspected Root Cause**: The modal immediately executes `updateUserProfile(profile.uid, { isLocked: true })` and logs the user out. The user is locked out permanently with no self-service recovery.
- **Evidence Snippet**:
  ```tsx
  // src/components/profile/EditProfileModal.tsx:95-103
  if (age < 18) {
    await updateUserProfile(profile.uid, { isLocked: true });
    await logoutUser();
    logout();
    toast.error("Account locked: You do not meet the minimum age requirement (18+)...");
    onClose();
    window.location.href = '/login';
    return;
  }
  ```
- **Recommended Fix**:
  Prevent form submission with a validation error message without mutating `isLocked` in Firestore.

---

#### DATA-UI-03: Hardcoded Mock Work Experience & Languages on Every User Profile
- **Severity**: **High**
- **Component**: User Profile View
- **File & Lines**: `src/app/(dashboard)/profile/page.tsx:247-264, 449-455`
- **User Flow / Scenario**: A user views their profile or any colleague's profile.
- **Suspected Root Cause**: Every profile displays a static hardcoded card: "Software Developer at Acme Corp" and "English (Native)".
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/profile/page.tsx:255-259
  <h3 className="font-bold text-base sm:text-xl text-white">Software Developer</h3>
  <p className="text-brand-purple font-semibold text-sm sm:text-lg">Acme Corp</p>
  <p className="text-slate-300 text-xs sm:text-sm mt-2 font-medium ...">Jan 2024 - Present</p>
  <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">Add dynamic experience entries here.</p>
  ```
- **Recommended Fix**:
  Render dynamic entries from `profile.experience` and display an empty state if none exist.

---

#### DATA-UI-04: Mock Visitor Data Sliced from All Users in Insights
- **Severity**: **Medium**
- **Component**: Insights & Analytics
- **File & Lines**: `src/app/(dashboard)/insights/page.tsx:102`
- **User Flow / Scenario**: A user views "Recent Profile Visitors" on `/insights`.
- **Suspected Root Cause**: The application displays the first 4 users in the database (`allUsers.slice(0, 4)`) instead of real profile viewers.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/insights/page.tsx:101-102
  // Real Recent Visitors (Users in network)
  const recentVisitors = allUsers.slice(0, 4);
  ```
- **Recommended Fix**:
  Track real profile visits in a `profile_views` subcollection or display "No recent views".

---

#### DATA-UI-05: Deceptive "Who Liked You" Premium Dating Grid Renders Normal Prospect List
- **Severity**: **Medium**
- **Component**: Dating / Premium Feature
- **File & Lines**: `src/app/(dashboard)/dating/page.tsx:117-127`
- **User Flow / Scenario**: A user upgrades to Premium to "See Who Liked Your Profile".
- **Suspected Root Cause**: Clicking "See Who Liked You" toggles `viewMode: 'grid'`, which renders the exact same list of unswiped prospects rather than actual incoming likes.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/dating/page.tsx:117-120
  const handleSeeWhoLikedYouClick = () => {
    if (isPremium) {
      setViewMode('grid');
      toast.success("Premium Dating Unlocked! Viewing all matching profiles.", { ... });
  ```
- **Recommended Fix**:
  Query `dating_interactions` where `toUserId == profile.uid && action == 'like'` and render the actual admirers.

---

#### DATA-UI-06: Catastrophic O(N) Unbounded Document Reads and Writes on Chat Open
- **Severity**: **High**
- **Component**: Messaging Service Layer
- **File & Lines**: `src/lib/services/messages.ts:182-204`
- **User Flow / Scenario**: A user opens a chat containing 300 messages.
- **Suspected Root Cause**: `markMessagesAsRead` loads all messages where `senderId != currentUserId` and executes individual `updateDoc` calls in `Promise.all` for every unread message.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/messages.ts:184-200
  const q = query(messagesRef, where('senderId', '!=', currentUserId));
  const snapshot = await getDocs(q);
  const updatePromises: Promise<void>[] = [];
  snapshot.forEach((docSnap) => {
    if (docSnap.data().status !== 'read') {
      updatePromises.push(updateDoc(doc(db, `chats/${chatId}/messages`, docSnap.id), { status: 'read' }));
    }
  });
  await Promise.all(updatePromises);
  ```
- **Recommended Fix**:
  Query only messages with `status == 'delivered'`, limit query size, and execute updates via `writeBatch(db)`.

---

#### DATA-UI-07: Private Community Join Request Memory Leakage
- **Severity**: **Medium**
- **Component**: Communities Service
- **File & Lines**: `src/lib/services/communities.ts:310-330`
- **User Flow / Scenario**: A community owner accepts or declines member join requests.
- **Suspected Root Cause**: `acceptJoinRequest` and `declineJoinRequest` remove the user's UID from `pendingRequests`, but omit removing the object from `pendingRequestDetails`. The array grows indefinitely with stale data.
- **Evidence Snippet**:
  ```ts
  // src/lib/services/communities.ts:313-317
  await updateDoc(communityRef, {
    members: arrayUnion(requestUser.uid),
    memberCount: increment(1),
    pendingRequests: arrayRemove(requestUser.uid),
    // pendingRequestDetails is NOT cleaned up!
  });
  ```
- **Recommended Fix**:
  Remove the corresponding object from `pendingRequestDetails`.

---

#### DATA-UI-08: Registration Form Omits Date of Birth from Firestore Document
- **Severity**: **Medium**
- **Component**: Registration Flow
- **File & Lines**: `src/app/(auth)/register/page.tsx:67-84`, `src/lib/auth.ts:25-66`
- **User Flow / Scenario**: A new user enters their birth day, month, and year during registration.
- **Suspected Root Cause**: The registration page validates age >= 18, but does not pass `dateOfBirth` into `registerUser()`. The date of birth is dropped and never stored in Firestore.
- **Evidence Snippet**:
  ```ts
  // src/app/(auth)/register/page.tsx:67, 84
  const dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`;
  ...
  const { user, error } = await registerUser(email, password, fullName, username, referralCode, accountType);
  // dateOfBirth is not passed
  ```
- **Recommended Fix**:
  Accept `dateOfBirth` in `registerUser` and store `dob: dateOfBirth` in the user's Firestore document.

---

#### DATA-UI-09: Character Encoding Artifact in Employer Salary Range
- **Severity**: **Low**
- **Component**: Employer Job Posting UI
- **File & Lines**: `src/app/(dashboard)/employer/page.tsx:309`
- **User Flow / Scenario**: An employer views the salary placeholder on `/employer`.
- **Suspected Root Cause**: Naira sign (`₦`) was saved with unrecognized character encoding, rendering as `?600k - ?1.2M`.
- **Evidence Snippet**:
  ```tsx
  // src/app/(dashboard)/employer/page.tsx:309
  placeholder="e.g. ?600k - ?1.2M / mo"
  ```
- **Recommended Fix**:
  Replace `?` with `₦` or `NGN`.

---

#### DATA-UI-10: Referral Share Fallback Points to Netlify Subdomain
- **Severity**: **Low**
- **Component**: Referrals Page
- **File & Lines**: `src/app/(dashboard)/referrals/page.tsx:30`
- **User Flow / Scenario**: A user copies their referral link during SSR or fallback execution.
- **Suspected Root Cause**: Fallback URL references `https://rhockstarconnect.netlify.app` instead of the official domain `https://rhockstarconnect.com`.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/referrals/page.tsx:30
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : "https://rhockstarconnect.netlify.app";
  ```
- **Recommended Fix**:
  Update fallback domain to `https://rhockstarconnect.com`.

---

#### DATA-UI-11: Duplicate Unreachable `clearTimeout` in Jobs Page
- **Severity**: **Low**
- **Component**: Jobs Page Search Debounce
- **File & Lines**: `src/app/(dashboard)/jobs/page.tsx:75-76`
- **Suspected Root Cause**: Duplicate consecutive return statement.
- **Evidence Snippet**:
  ```ts
  // src/app/(dashboard)/jobs/page.tsx:75-76
  return () => clearTimeout(timer);
  return () => clearTimeout(timer);
  ```
- **Recommended Fix**:
  Remove the duplicate line.

---

#### DATA-UI-12: Unused Video Input Reference in Post Composer
- **Severity**: **Low**
- **Component**: Feed Post Composer
- **File & Lines**: `src/components/feed/PostComposer.tsx:19, 285`
- **Suspected Root Cause**: `videoInputRef` is declared on line 19, but the Video button on line 285 triggers `fileInputRef.current?.click()`.
- **Evidence Snippet**:
  ```tsx
  // src/components/feed/PostComposer.tsx:19, 285
  const videoInputRef = useRef<HTMLInputElement>(null);
  ...
  onClick={() => fileInputRef.current?.click()}
  ```
- **Recommended Fix**:
  Attach `videoInputRef` to a dedicated video file input with `accept="video/*"` or remove the unused ref.

---

### Category 8: Architectural & Specification Gaps (ARCH)

#### ARCH-01: Complete Absence of Booking & Appointment Lifecycle System
- **Severity**: **Critical Architectural Gap**
- **Component**: Platform Architecture
- **File & Lines**: Entire codebase (0 matches for booking/appointment models or services)
- **User Flow / Scenario**: Booking appointments, service scheduling, slot reservations, rescheduling, and cancellations.
- **Suspected Root Cause**: The application was engineered around Job Board (ATS), Social Feed, Communities, and Dating. It has zero implementations of appointment booking or calendar scheduling.
- **Recommended Fix**:
  If appointment booking is a required feature, implement a `bookings` collection, booking state machine (`pending` -> `confirmed` -> `in_progress` -> `completed` / `cancelled`), date-picker modal, and provider calendar schedule.

---

#### ARCH-02: Complete Absence of Artisan / Service Provider Roles & Reviews/Ratings
- **Severity**: **Critical Architectural Gap**
- **Component**: Platform Architecture
- **File & Lines**: Entire codebase (0 matches for artisan roles, service reviews, or star ratings)
- **User Flow / Scenario**: Clients hiring an artisan/technician, provider onboarding, and leaving verified service reviews.
- **Suspected Root Cause**: Rhockstar Connect contains no artisan marketplace or star-rating review models.
- **Recommended Fix**:
  If an artisan marketplace is required, introduce role `'artisan'`, create a `services` catalog, and implement a `reviews` collection tied to completed bookings.

---

#### ARCH-03: Complete Absence of Paystack Payment Gateway Integration
- **Severity**: **High Integration Gap**
- **Component**: Third-Party Payment Integrations
- **File & Lines**: `package.json`, `src/app/(dashboard)/premium/page.tsx`
- **User Flow / Scenario**: Making payments via Paystack.
- **Suspected Root Cause**: Paystack SDK is not installed in `package.json`. The codebase exclusively integrates Flutterwave (`flutterwave-react-v3`).
- **Recommended Fix**:
  If Paystack is required, install `@paystack/inline-js` or implement Paystack redirect checkout with server webhook verification.

---

## 3. Prioritized Remediation Roadmap

```
PHASE 0: IMMEDIATE EMERGENCY FIXES (P0) — Security & Data Destruction Blockers
├── 1. Delete `src/app/api/clear-connections/route.ts` immediately.
├── 2. Remove `resetPasswordDirect` and plaintext `updatedPasswordHint` backdoor in `auth.ts`.
├── 3. Patch `firestore.rules` to disallow self-updating `role`, `isBanned`, and `subscriptionTier`.
├── 4. Add missing Firestore rules for all 11 omitted collections (`jobs`, `chats`, `connections`, etc.).
├── 5. Restrict `storage.rules` to path-scoped ownership with 5MB/10MB limits.
└── 6. Rotate production admin credentials and remove hardcoded passwords from scripts.

PHASE 1: HIGH-PRIORITY BUSINESS & MONETIZATION FIXES (P1)
├── 1. Implement server-side Flutterwave verification (`/api/payments/verify`) and webhook handler.
├── 2. Remove client-side ad payment simulation button in `employer/ads/page.tsx`.
├── 3. Whitelist `/company/*` and `/privacy` in `ProtectedRoute.tsx`.
├── 4. Fix message notification routing parameter mismatch (`chatId` vs `user`/`uid`).
├── 5. Add `firebasestorage.googleapis.com` to `next.config.ts` remotePatterns.
├── 6. Connect `ApplicationTracker.tsx` and `company/[username]/ats` to real `job_applications`.
└── 7. Remove post comment cascade update in `users.ts` that causes permission-denied crashes.

PHASE 2: MEDIUM-PRIORITY WORKFLOW & DATA INTEGRITY FIXES (P2)
├── 1. Implement functional Change Password form and persist notification/privacy toggles.
├── 2. Wire Post Report and User Block actions to real Firestore moderation collections.
├── 3. Prevent automatic permanent account lockout on birth date edit in `EditProfileModal.tsx`.
├── 4. Add file attachment and voice note recording buttons to direct messages.
├── 5. Enforce banned user status in `AuthProvider.tsx` and `ProtectedRoute.tsx`.
├── 6. Store date of birth during registration in `registerUser()`.
└── 7. Replace static mock experience and mock visitor insights with dynamic data.

PHASE 3: POLISH & QUALITY CLEANUP (P3)
├── 1. Fix Naira character encoding (`?` -> `₦`) in employer salary placeholder.
├── 2. Copy `icon-192x192.png` to `public/icon.png`.
├── 3. Update Netlify fallback domain to `https://rhockstarconnect.com`.
├── 4. Remove duplicate `clearTimeout` in `jobs/page.tsx` and unused `videoInputRef`.
└── 5. Integrate Gemini API for dynamic AI career and dating advice.
```

---

## 4. Independent Auditor Verification Rubric

An independent auditor can verify every finding documented in this report using the following step-by-step procedure:

1. **Verify Public Wipe Route**: Inspect `src/app/api/clear-connections/route.ts:4-22`. Confirm export is `async function GET()` with no auth checks and unbatched deletion.
2. **Verify Password Reset Backdoor**: Inspect `src/lib/auth.ts:144-165, 177-205`. Confirm `updatedPasswordHint` storage and fallback bypass assigning `role: 'admin'`.
3. **Verify Open Role Escalation**: Inspect `firestore.rules:20-24`. Confirm `allow create, update: if isOwner(userId) || isAdmin();` without key filtering.
4. **Verify Missing Collections**: Inspect `firestore.rules`. Confirm absence of match blocks for `jobs`, `job_applications`, `chats`, `connections`, `follows`, and `dating_interactions`.
5. **Verify Insecure Storage Wildcard**: Inspect `storage.rules:8-11`. Confirm `match /{allPaths=**} { allow read, write: if request.auth != null; }`.
6. **Verify Committed Admin Credentials**: Inspect `scripts/createAdmin.js:19-20` and `scripts/seed-admin.mjs:36-37`.
7. **Verify Client-Side Subscription Tampering**: Inspect `src/app/(dashboard)/premium/page.tsx:43-55, 75-80`. Confirm `updateUserProfile` is called directly from the client callback without server verification.
8. **Verify Mock Ad Payment**: Inspect `src/app/(dashboard)/employer/ads/page.tsx:45-54`. Confirm `handleSimulatePayment` calls `confirmAdPayment` without a payment gateway.
9. **Verify Modulo Applicant Status**: Inspect `src/components/jobs/ApplicationTracker.tsx:35-37`. Confirm `statuses[index % statuses.length]`.
10. **Verify Age Lockout Trap**: Inspect `src/components/profile/EditProfileModal.tsx:95-103`. Confirm `updateUserProfile(..., { isLocked: true })` and `logout()` on `age < 18`.
11. **Verify Next.js Image Config**: Inspect `next.config.ts:15-20`. Confirm only `images.unsplash.com` is configured.
12. **Verify Missing `/icon.png`**: Run directory search on `public/`. Confirm `icon.png` is missing while `Sidebar.tsx:71` requests it.

---
*Report generated and verified by teamwork_preview_worker_qa_report.*

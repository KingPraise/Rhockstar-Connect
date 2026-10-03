# Comprehensive Backend, API, Database & Security Audit Report
**Rhockstar Connect Platform**  
**Audit Conducted**: 2026-09-10  
**Auditor**: Explorer 2 (Backend, APIs, Database & Auth)  
**Status**: Completed  

---

## Executive Summary

A comprehensive, deep-dive architectural and security audit of the **Rhockstar Connect** platform backend was conducted across:
- All Next.js backend API routes (`src/app/api/`)
- Database service layer & data models (`src/lib/services/`)
- Firebase configuration & authentication flows (`src/lib/auth.ts`, `src/lib/firebase.ts`, `src/lib/firebase-admin.ts`, `src/store/useAuthStore.ts`)
- Firebase Security Rules (`firestore.rules`, `storage.rules`, `firestore.indexes.json`, `cors.json`)
- Environment variables & build configurations (`src/lib/env.ts`, `next.config.ts`, `netlify.toml`, scripts)

The audit revealed **22 discrete issues**, including **10 Critical vulnerabilities** that allow remote unauthenticated database destruction, unauthenticated push notification spoofing, arbitrary privilege escalation to SuperAdmin, global private direct message exfiltration, unrestricted file overwrite/deletion in Cloud Storage, and complete failure of core platform features in production due to absent security rules.

---

## Issue Summary Matrix

| ID | Issue Title | Severity | Component / Path | Impact |
|:---|:---|:---|:---|:---|
| **ISSUE-01** | Unauthenticated Remote Database Wipe via Public GET Endpoint | **Critical** | `src/app/api/clear-connections/route.ts:4` | Remote attackers/crawlers can wipe the entire `connections` collection |
| **ISSUE-02** | Unauthenticated Push Notification Injection & User Oracle | **Critical** | `src/app/api/notify/route.ts:5` | Remote attackers can send arbitrary push notifications & enumerate users |
| **ISSUE-03** | Arbitrary Privilege Escalation to SuperAdmin via Firestore Rules | **Critical** | `firestore.rules:22`, `src/lib/auth.ts:124` | Regular users can grant themselves `role: 'admin'` and take over the platform |
| **ISSUE-04** | Insecure Direct Object Reference (IDOR) on Private Direct Messages | **Critical** | `firestore.rules:48-50` | Any authenticated user can read all private DMs between any users |
| **ISSUE-05** | Unrestricted Cloud Storage Overwrite, Deletion & Missing Limits | **Critical** | `storage.rules:8-11` | Any user can overwrite/delete any file in Storage, unlimited file size/type |
| **ISSUE-06** | Missing Firestore Security Rules for 8 Collections (Production Failure) | **Critical** | `firestore.rules:1-64` | `chats`, `communities/messages`, `jobs`, `applications`, `connections`, `follows`, `notifications`, `dating` fail with `permission-denied` |
| **ISSUE-07** | Firestore Rules Block Likes, Comments, Poll Votes & Ad Impressions | **Critical** | `firestore.rules:27, 34`, `posts.ts`, `ads.ts` | Feed social interactions and ad metrics are rejected by Firestore rules |
| **ISSUE-08** | Plaintext Password Storage and Backdoor Fake Login Bypass | **Critical** | `src/lib/auth.ts:144, 177` | Passwords stored in plaintext (`updatedPasswordHint`); fake auth bypass breaks Firebase |
| **ISSUE-09** | Production Admin Credentials Hardcoded in Scripts & Scratch Files | **Critical** | `scripts/createAdmin.js:19`, `seed-admin.mjs:36` | SuperAdmin password committed in Git repository |
| **ISSUE-10** | Client-Side Payment Verification & Free Tier Upgrade Exploitation | **Critical** | `premium/page.tsx:42`, `employer/ads/page.tsx:45` | Users can obtain Elite subscriptions and activate ads for free |
| **ISSUE-11** | Unauthenticated Username Login Fails due to Firestore Rules | **High** | `src/lib/auth.ts:108` | Logging in via username triggers `permission-denied` error |
| **ISSUE-12** | Next.js Image Optimization Crash on Firebase Storage URLs | **High** | `next.config.ts:15`, `AdminSidebar.tsx:111` | Missing `firebasestorage.googleapis.com` in `remotePatterns` crashes pages |
| **ISSUE-13** | Non-Existent `/icon.png` 404 Errors on Every Page Render | **High** | `Sidebar.tsx:71`, `MobileHeader.tsx:125` | Missing icon asset causes 404s and broken navigation images |
| **ISSUE-14** | Catastrophic Read Overhead & 500-Batch Limit Crash on Profile Updates | **High** | `users.ts:167`, `admin.ts:241` | Profile updates download all posts in DB; crashes if writes > 500 |
| **ISSUE-15** | Read-Modify-Write Race Conditions & 1MB Limit in Post Comments | **High** | `src/lib/services/posts.ts:333` | Concurrent comments overwrite each other; document size limit risk |
| **ISSUE-16** | Missing Composite Indexes Causing Runtime Query Failures | **High** | `notifications.ts:88`, `firestore.indexes.json` | Compound queries throw `FAILED_PRECONDITION: query requires index` |
| **ISSUE-17** | Discrepant and Missing Environment Variables | **Medium** | `notifications.ts:123`, `messaging.ts:20` | Inconsistent VAPID keys; `validateEnv()` is dead code; missing `.env.example` |
| **ISSUE-18** | Incomplete ATS Feature with Hardcoded Mock Candidates | **Medium** | `company/[username]/ats/page.tsx:22` | Candidate list is hardcoded mock data, disconnected from `job_applications` |
| **ISSUE-19** | Banned User Status Is Never Enforced | **Medium** | `users/page.tsx:71`, `ProtectedRoute.tsx` | Banned users retain complete platform access |
| **ISSUE-20** | Registration Omits Date of Birth from Database | **Medium** | `register/page.tsx:67`, `src/lib/auth.ts:25` | Date of birth is validated in UI but never persisted to Firestore |
| **ISSUE-21** | Incomplete Platform Settings Toggles | **Medium** | `admin/settings/page.tsx:18`, `admin.ts:201` | Maintenance mode, announcements, registration toggles are dead code |
| **ISSUE-22** | AI Assistant Service Uses Hardcoded Mock Responses | **Low** | `src/lib/services/ai.ts:27` | Returns static canned strings instead of integrating with Gemini API |

---

## Detailed Findings & Remediations

### ISSUE-01: Unauthenticated Remote Database Wipe via Public GET Endpoint
- **Severity**: Critical
- **File & Line**: `src/app/api/clear-connections/route.ts:4-22`
- **Endpoint**: `GET /api/clear-connections`
- **Root Cause**: A database wiping test script was exposed as a production API route using HTTP `GET` with zero authentication or authorization checks. Any web crawler, search indexer, or unauthenticated malicious user requesting this URL will permanently delete all documents in the `connections` collection. Additionally, it attempts to delete all documents in a single Firestore `WriteBatch`, which will crash if there are more than 500 documents.
- **Evidence**:
  ```ts
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
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message });
    }
  }
  ```
- **Remediation**:
  1. Delete `src/app/api/clear-connections/route.ts` immediately from the production codebase.
  2. If an administrative database cleanup endpoint is required, switch to `DELETE /api/admin/connections`, verify Firebase SuperAdmin ID token (`adminAuth.verifyIdToken()`), chunk deletions into batches of <= 500 operations, and return appropriate HTTP status codes (401, 403, 500).

---

### ISSUE-02: Unauthenticated Push Notification Injection & User Oracle
- **Severity**: Critical
- **File & Line**: `src/app/api/notify/route.ts:5-68`
- **Endpoint**: `POST /api/notify`
- **Root Cause**: Missing server-side authentication. The endpoint uses the Firebase Admin SDK to multicast push notifications to any user's registered FCM devices without verifying whether the request originated from an authenticated user or authorized service. It also leaks user existence (user oracle) via 404 responses on non-existent `userId`s.
- **Evidence**:
  ```ts
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
- **Remediation**:
  1. Extract and verify the caller's Firebase ID token from the `Authorization: Bearer <token>` header using `adminAuth.verifyIdToken(token)`.
  2. Validate that the authenticated caller has permission to notify `userId` (e.g. they just sent a message or comment to that user).
  3. Validate input payloads using a Zod schema and sanitize URLs (disallow `javascript:` or untrusted domains).

---

### ISSUE-03: Arbitrary Privilege Escalation to SuperAdmin via Firestore Rules
- **Severity**: Critical
- **File & Line**: `firestore.rules:14-17, 20-24`, `src/lib/auth.ts:124-126, 156-158`, `src/lib/services/users.ts:255`
- **Component**: Firestore Security Rules & User Service
- **Root Cause**:
  1. `firestore.rules` checks `isAdmin()` by querying `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'`.
  2. The `/users/{userId}` match block allows `isOwner(userId)` to create or update their own document without restriction: `allow create, update: if isOwner(userId) || isAdmin();`.
  3. A regular authenticated user can execute `updateDoc(doc(db, "users", auth.currentUser.uid), { role: "admin" })` from the browser console or via `updateUserProfile(uid, { role: 'admin' })`. This immediately makes `isAdmin()` evaluate to `true` for all subsequent Firestore operations and grants access to `/admin`.
  4. In `src/lib/auth.ts`, logging in with email `elijah@rhockstarconnect.com` automatically writes `updateData.role = "admin"`. Anyone registering this email automatically obtains admin privileges.
- **Evidence**:
  ```firestore-rules
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
- **Remediation**:
  1. Manage admin roles using Firebase Custom Claims (`adminAuth.setCustomUserClaims(uid, { admin: true })`).
  2. In `firestore.rules`, verify admin status via token claims: `function isAdmin() { return isAuthenticated() && request.auth.token.admin == true; }`.
  3. Prevent users from updating privileged fields in their profile:
     ```firestore-rules
     allow update: if isOwner(userId) && 
       !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'subscriptionTier', 'isBanned', 'stardomXP', 'stardomRank']);
     ```

---

### ISSUE-04: Insecure Direct Object Reference (IDOR) on Private Direct Messages
- **Severity**: Critical
- **File & Line**: `firestore.rules:48-50`
- **Component**: Firestore Security Rules
- **Root Cause**: The rule for `/messages/{messageId}` permits any authenticated user to read all documents in the collection: `allow read, create: if isAuthenticated();`. Any logged-in user can query all documents in the collection and intercept private conversations between other users.
- **Evidence**:
  ```firestore-rules
  // Direct Messages
  match /messages/{messageId} {
    allow read, create: if isAuthenticated();
  }
  ```
- **Remediation**:
  Ensure chat messages are scoped to conversations and only participants can read/write:
  ```firestore-rules
  match /chats/{chatId} {
    allow read: if isAuthenticated() && request.auth.uid in resource.data.participants;
    allow create: if isAuthenticated() && request.auth.uid in request.resource.data.participants;
    allow update: if isAuthenticated() && request.auth.uid in resource.data.participants;
    
    match /messages/{messageId} {
      allow read: if isAuthenticated() && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      allow create: if isAuthenticated() && request.auth.uid == request.resource.data.senderId && request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      allow update, delete: if isAuthenticated() && request.auth.uid == resource.data.senderId;
    }
  }
  ```

---

### ISSUE-05: Unrestricted Cloud Storage Overwrite, Deletion & Missing Limits
- **Severity**: Critical
- **File & Line**: `storage.rules:8-11`
- **Component**: Firebase Storage Security Rules
- **Root Cause**: Wildcard rule `match /{allPaths=**} { allow read, write: if request.auth != null; }` allows any authenticated user to read, overwrite, or delete any file in Firebase Storage. An attacker can delete all user avatars, resumes, post media, and company logos. Furthermore, there are no file type or file size limits, opening the storage bucket to arbitrary executable uploads and denial-of-wallet attacks via multi-gigabyte uploads.
- **Evidence**:
  ```storage-rules
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow read/write access to all authenticated users
      allow read, write: if request.auth != null;
    }
  }
  ```
- **Remediation**:
  Implement granular, path-scoped storage rules:
  ```storage-rules
  match /b/{bucket}/o {
    match /avatars/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
    match /posts/{userId}_{timestamp}_{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 50 * 1024 * 1024;
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

### ISSUE-06: Missing Firestore Security Rules for 8 Collections (Production Failure)
- **Severity**: Critical
- **File & Line**: `firestore.rules:1-64`
- **Component**: Firestore Security Rules
- **Root Cause**: Firestore defaults to DENY for all collections without an explicit match block. The following collections and subcollections are accessed by client SDK code in `src/lib/services/` but have no rules defined in `firestore.rules`:
  1. `chats` and `chats/{chatId}/messages` (`src/lib/services/messages.ts`)
  2. `communities/{communityId}/messages` (`src/lib/services/communities.ts`)
  3. `jobs` and `job_applications` (`src/lib/services/jobs.ts`)
  4. `connections` (`src/lib/services/connections.ts`)
  5. `follows` (`src/lib/services/follows.ts`)
  6. `notifications` (`src/lib/services/notifications.ts`)
  7. `dating_interactions` and `matches` (`src/lib/services/dating.ts`)
  8. `settings` (`src/lib/services/admin.ts`)
  9. `referrals` (`src/lib/services/referrals.ts`)
- **Impact**: In production, every call to these collections fails with `FirebaseError: Missing or insufficient permissions`. Direct messaging, job board browsing, applications, connections, notifications, community chat, dating, and referrals are non-functional for all users.
- **Remediation**: Add explicit security rules for all 8 collections and their subcollections, enforcing user ownership and authentication checks.

---

### ISSUE-07: Firestore Rules Block Feed Likes, Comments, Poll Votes & Ad Impressions
- **Severity**: Critical
- **File & Line**: `firestore.rules:27-31, 34-38`, `src/lib/services/posts.ts:176, 258, 333`, `src/lib/services/ads.ts:294, 306`
- **Component**: Firestore Security Rules & Client Services
- **Root Cause**:
  1. `posts` rule requires `isAdmin() || (isAuthenticated() && resource.data.authorId == request.auth.uid)`. When User B likes, comments on, or votes on a poll in User A's post, Firestore checks if User B is the author of the post. Because User B is not the author, Firestore denies the update with `PERMISSION_DENIED`.
  2. In `createPost`, the document stores `userId: user.uid`, not `authorId`. Because `resource.data.authorId` does not exist on the document, even the post creator cannot edit or delete their own post.
  3. In `advertisements`, update requires `isAdmin() || resource.data.companyId == request.auth.uid`. When any visitor views or clicks an ad, `trackAdImpression` or `trackAdClick` attempts to increment `viewsCount` or `clicksCount` via client SDK and is rejected with `PERMISSION_DENIED`.
- **Evidence**:
  ```firestore-rules
  match /posts/{postId} {
    allow read: if isAuthenticated();
    allow create: if isAuthenticated();
    allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.authorId == request.auth.uid);
  }
  ```
- **Remediation**:
  1. Standardize field naming to `userId` across `posts.ts` and `firestore.rules`.
  2. Split likes, comments, and poll votes into subcollections (`/posts/{postId}/likes/{userId}`, `/posts/{postId}/comments/{commentId}`, `/posts/{postId}/votes/{userId}`) or allow specific field updates via Firestore rule functions.
  3. Track ad impressions and clicks via a dedicated backend API route (`POST /api/ads/track`) using Firebase Admin SDK to bypass client rule restrictions.

---

### ISSUE-08: Plaintext Password Storage and Backdoor Fake Login Bypass
- **Severity**: Critical
- **File & Line**: `src/lib/auth.ts:144-165, 177-205`, `src/components/auth/ResetPasswordModal.tsx:45-59`
- **Component**: Authentication Layer
- **Root Cause**:
  1. `resetPasswordDirect` takes an arbitrary `identifier` (username or email) and `newPassword`, without requiring old password verification, two-factor auth, or email confirmation. It stores the new password in plaintext under `updatedPasswordHint` in Firestore.
  2. In `loginUser`, if Firebase Auth fails, the system checks `userData.updatedPasswordHint === password`. If it matches, it constructs a fake user object and populates Zustand state. However, because no Firebase Auth credential was created, `auth.currentUser` remains `null`. All subsequent requests requiring Firebase authentication fail.
- **Evidence**:
  ```ts
  const userDoc = snapshot.docs[0];
  await updateDoc(doc(db, "users", userDoc.id), {
    passwordUpdated: serverTimestamp(),
    updatedPasswordHint: newPassword
  });
  ```
- **Remediation**:
  1. Remove `updatedPasswordHint`, `resetPasswordDirect`, and the fallback block in `loginUser` entirely.
  2. Implement standard Firebase password reset using `sendPasswordResetEmail(auth, email)`.

---

### ISSUE-09: Production Admin Credentials Hardcoded in Scripts & Scratch Files
- **Severity**: Critical
- **File & Line**: `scripts/createAdmin.js:19-21`, `scripts/seed-admin.mjs:36-38`, `scratch/testStorage.js:21`
- **Component**: Deployment Scripts
- **Root Cause**: Scripts committed to Git contain plaintext production administrative credentials (`elijah@rhockstarconnect.com` / `RhockstarAdmin2026` / `RhockstarAdmin2026!`).
- **Evidence**:
  ```js
  // scripts/createAdmin.js
  const email = 'elijah@rhockstarconnect.com';
  const password = 'RhockstarAdmin2026';
  ```
- **Remediation**:
  1. Immediately rotate the admin account password in the Firebase Authentication console.
  2. Remove hardcoded credentials from all script files; load from `.env` or prompt via CLI.
  3. Add `scratch/` to `.gitignore`.

---

### ISSUE-10: Client-Side Payment Verification & Free Tier Upgrade Exploitation
- **Severity**: Critical
- **File & Line**: `src/app/(dashboard)/premium/page.tsx:42-55, 71-89`, `src/app/(dashboard)/employer/ads/page.tsx:45-60`, `src/lib/services/ads.ts:262-279`
- **Component**: Billing & Subscription Flow
- **Root Cause**: No server-side payment verification exists. Flutterwave modal executes entirely on the client; upon modal close, it invokes `updateUserProfile(profile.uid, { subscriptionTier: 'elite', subscriptionStatus: 'active' })`. Any user can call `updateUserProfile` directly in DevTools to gain free Elite status. In `employer/ads/page.tsx`, a mock "Simulate Payment" button directly executes `confirmAdPayment(ad.id)`, making ads live without payment.
- **Evidence**:
  ```ts
  const handleSubscribe = async (tier: 'pro' | 'elite') => {
    ...
    const res = await updateUserProfile(profile.uid, {
      subscriptionTier: tier,
      subscriptionStatus: 'active'
    });
  ```
- **Remediation**:
  1. Create a server-side endpoint `POST /api/payments/verify` or webhook handler `POST /api/webhooks/flutterwave`.
  2. Verify transaction reference and amount directly against Flutterwave's API (`/v3/transactions/:id/verify`) using the secret key (`FLWSECK_TEST-...`).
  3. Update user subscription status or ad status using `adminDb` on the server only after successful transaction verification.

---

### ISSUE-11: Unauthenticated Username Login Fails due to Firestore Rules
- **Severity**: High
- **File & Line**: `src/lib/auth.ts:108-118`
- **Component**: Authentication Service
- **Root Cause**: `loginUser` attempts to resolve a username to an email address by querying Firestore collection `users` where `username == cleanUsername` before logging in. Because the user is unauthenticated, `firestore.rules` rejects the read with `permission-denied`, preventing users from logging in via username.
- **Evidence**:
  ```ts
  if (!inputClean.includes("@")) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", inputClean.toLowerCase().replace('@', '')));
    const snapshot = await getDocs(q); // Fails with PERMISSION_DENIED
  ```
- **Remediation**: Create a backend endpoint `POST /api/auth/resolve-username` that queries `adminDb` with rate limiting, or require email for authentication.

---

### ISSUE-12: Next.js Image Optimization Crash on Firebase Storage URLs
- **Severity**: High
- **File & Line**: `next.config.ts:15-20`, `src/components/layout/AdminSidebar.tsx:111`, `src/app/(dashboard)/employer/[jobId]/page.tsx:210`, `src/app/admin/(protected)/users/page.tsx:217, 340`, `src/app/admin/(protected)/subscriptions/page.tsx:179`, `src/app/admin/(protected)/profile/page.tsx:100`
- **Component**: Next.js Configuration & UI Components
- **Root Cause**: `next.config.ts` only allows `images.unsplash.com` in `images.remotePatterns`. Multiple pages render user avatars or uploaded media using `next/image` (`<Image src={avatar} ... />`). When a user uploads a custom avatar to Firebase Storage, the URL (`https://firebasestorage.googleapis.com/...`) causes Next.js to throw a fatal unhandled error: `Invalid src prop on next/image, hostname "firebasestorage.googleapis.com" is not configured`.
- **Remediation**:
  Update `next.config.ts`:
  ```ts
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ],
  }
  ```

---

### ISSUE-13: Non-Existent `/icon.png` 404 Errors on Every Page Render
- **Severity**: High
- **File & Line**: `src/components/layout/Sidebar.tsx:71, 75`, `src/components/layout/MobileHeader.tsx:125`, `public/firebase-messaging-sw.js:20`, `src/app/(dashboard)/premium/page.tsx:34`
- **Component**: Layout Assets
- **Root Cause**: Layout headers and sidebars load `<Image src="/icon.png" ... />`, but `public/` only contains `icon-192x192.png` and `icon-512x512.png`. Every page load triggers 404 network errors and displays broken images.
- **Remediation**: Copy `public/icon-192x192.png` to `public/icon.png` or update components to reference `/icon-192x192.png`.

---

### ISSUE-14: Catastrophic Read Overhead & 500-Batch Limit Crash on Profile Updates
- **Severity**: High
- **File & Line**: `src/lib/services/users.ts:167-246`, `src/lib/services/admin.ts:241-319`
- **Component**: User Service Layer
- **Root Cause**: In `updateUserProfile`, if `avatar`, `fullName`, or `username` changes, the client runs `getDocs(query(collection(db, 'posts')))`—downloading every post in the entire database to the client. It also queues updates to all matching comments in a single Firestore `writeBatch`. If total updates exceed 500 (`count > 500`), `batch.commit()` crashes with `FirebaseError: A maximum of 500 writes are allowed per batch`.
- **Remediation**: Remove client-side collection-wide cascade updates. Use normalized `userId` references or handle denormalization updates asynchronously in a Cloud Function with batched chunks (500 per batch).

---

### ISSUE-15: Read-Modify-Write Race Conditions & 1MB Limit in Post Comments
- **Severity**: High
- **File & Line**: `src/lib/services/posts.ts:333-358, 493-517`
- **Component**: Posts Service
- **Root Cause**: Comments are stored in an array property (`comments`) inside the parent post document. `addComment` reads the post doc, appends the comment, and writes back the entire array without a transaction. Concurrent comments from two users result in lost updates. Storing all comments within the post document also risks hitting the 1MB Firestore document limit.
- **Remediation**: Move comments to a subcollection `/posts/{postId}/comments/{commentId}` and use `increment(1)` to update `commentsCount`.

---

### ISSUE-16: Missing Composite Indexes Causing Runtime Query Failures
- **Severity**: High
- **File & Line**: `src/lib/services/notifications.ts:88-93`, `src/lib/services/messages.ts:185-186`, `firestore.indexes.json`
- **Component**: Database Indexing
- **Root Cause**: `markAllNotificationsAsRead` queries `notifications` with `where('userId', '==', userId)` and `where('read', '==', false)`. `markMessagesAsRead` queries with inequality `where('senderId', '!=', currentUserId)`. Neither index is declared in `firestore.indexes.json`.
- **Remediation**: Add required indexes to `firestore.indexes.json`:
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

### ISSUE-17: Discrepant and Missing Environment Variables
- **Severity**: Medium
- **File & Line**: `src/lib/services/notifications.ts:123`, `src/lib/messaging.ts:20`, `src/lib/env.ts:1-33`
- **Component**: Configuration & Validation
- **Root Cause**:
  1. `notifications.ts` accesses `process.env.NEXT_PUBLIC_VAPID_KEY`, whereas `messaging.ts` accesses `process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
  2. `validateEnv()` exists in `src/lib/env.ts` but is never called anywhere.
  3. No `.env.example` file is provided in the repository.
- **Remediation**: Standardize variable naming to `NEXT_PUBLIC_FIREBASE_VAPID_KEY`. Create `.env.example`. Call `validateEnv()` in root layout.

---

### ISSUE-18: Incomplete ATS Feature with Hardcoded Mock Candidates
- **Severity**: Medium
- **File & Line**: `src/app/(dashboard)/company/[username]/ats/page.tsx:22-28, 38`
- **Component**: Employer ATS Dashboard
- **Root Cause**: The ATS dashboard displays a static mock array (`MOCK_CANDIDATES: Candidate[] = [...]`) instead of calling `getApplicationsForJob` from `src/lib/services/jobs.ts`.
- **Remediation**: Connect `company/[username]/ats/page.tsx` to `getApplicationsForJob(jobId)` to render real applicant submissions.

---

### ISSUE-19: Banned User Status Is Never Enforced
- **Severity**: Medium
- **File & Line**: `src/app/admin/(protected)/users/page.tsx:71-79`, `src/lib/auth.ts:80-175`, `src/components/auth/ProtectedRoute.tsx`
- **Component**: Access Control & Moderation
- **Root Cause**: Admins can toggle `isBanned` on users, but `loginUser`, `ProtectedRoute`, and Firestore security rules never verify `isBanned`. Banned users can continue to log in and interact with the platform.
- **Remediation**: Check `isBanned` in `loginUser` and `ProtectedRoute`, and deny writes in `firestore.rules` for banned users.

---

### ISSUE-20: Registration Omits Date of Birth from Database
- **Severity**: Medium
- **File & Line**: `src/app/(auth)/register/page.tsx:67-84`, `src/lib/auth.ts:25-66`
- **Component**: Registration Flow
- **Root Cause**: Registration form collects and validates age >= 18 using `dobYear`, `dobMonth`, and `dobDay`, but does not pass `dateOfBirth` to `registerUser()`. The date of birth is dropped and never stored in Firestore.
- **Remediation**: Add `dateOfBirth` parameter to `registerUser()` and store `dob: dateOfBirth` in the `/users/{userId}` document.

---

### ISSUE-21: Incomplete Platform Settings Toggles
- **Severity**: Medium
- **File & Line**: `src/app/admin/(protected)/settings/page.tsx:18-23`, `src/lib/services/admin.ts:201-230`
- **Component**: Global Settings
- **Root Cause**: The Admin portal allows toggling `maintenanceMode`, `announcementBanner`, and `allowRegistrations`. However, these values are stored in `/settings/global` and never queried or enforced by any user-facing route or layout.
- **Remediation**: Query `/settings/global` in root layout or middleware to redirect to maintenance page, display announcement banner, and disable registration if `allowRegistrations == false`.

---

### ISSUE-22: AI Assistant Service Uses Hardcoded Mock Responses
- **Severity**: Low
- **File & Line**: `src/lib/services/ai.ts:27-37`
- **Component**: AI Service
- **Root Cause**: `getAIResponse` returns three static hardcoded string templates based on persona string matching without invoking Gemini API or LLM inference.
- **Remediation**: Integrate `@google/genai` using `process.env.GEMINI_API_KEY` to provide dynamic AI assistance.

---
EOF

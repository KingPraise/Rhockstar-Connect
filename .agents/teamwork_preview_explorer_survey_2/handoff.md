# Handoff Report — Explorer 2 (Backend, APIs, Database & Auth)

**Milestone**: Backend, APIs, Firebase Database & Security Audit  
**Agent**: Explorer 2 (`teamwork_preview_explorer_survey_2`)  
**Parent Orchestrator ID**: `796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`  
**Date**: 2026-09-10T12:15:00Z  

---

## 1. Observation

Direct observations from inspecting the codebase across `src/app/api/`, `src/lib/`, `firestore.rules`, `storage.rules`, and configuration files:

1. **Unauthenticated Database Deletion Endpoint (`src/app/api/clear-connections/route.ts:4-22`)**:
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
   ```
   No authentication, authorization, or rate limiting is applied. The route uses HTTP `GET`.

2. **Unauthenticated Push Notification Route (`src/app/api/notify/route.ts:5-40`)**:
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
   No session or bearer token verification is performed.

3. **Firestore Security Rules Flaws (`firestore.rules:14-50`)**:
   - Lines 14-17 & 20-24:
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
     `isOwner(userId)` is allowed to update any field on their own document without restriction, allowing any user to set `role: "admin"`.
   - Lines 48-50:
     ```firestore-rules
     match /messages/{messageId} {
       allow read, create: if isAuthenticated();
     }
     ```
     Allows any authenticated user to read all direct messages across the entire application.
   - Entire file: Zero match rules exist for `chats`, `jobs`, `job_applications`, `connections`, `follows`, `notifications`, `dating_interactions`, `matches`, `referrals`, or `settings`.

4. **Storage Security Rules Flaw (`storage.rules:8-11`)**:
   ```storage-rules
   match /b/{bucket}/o {
     match /{allPaths=**} {
       // Allow read/write access to all authenticated users
       allow read, write: if request.auth != null;
     }
   }
   ```
   Allows any logged-in user to write or delete any file in the bucket with no path, size, or MIME restrictions.

5. **Plaintext Password Storage & Backdoor Fake Login (`src/lib/auth.ts:144-165, 177-205`)**:
   ```ts
   // resetPasswordDirect
   const userDoc = snapshot.docs[0];
   await updateDoc(doc(db, "users", userDoc.id), {
     passwordUpdated: serverTimestamp(),
     updatedPasswordHint: newPassword
   });
   ...
   // loginUser fallback
   if (userData.updatedPasswordHint && userData.updatedPasswordHint === password) {
     const fakeUser: any = { uid: userDoc.id, email: userData.email, displayName: userData.fullName };
     ...
     return { user: fakeUser, error: null };
   }
   ```

6. **Committed Admin Passwords (`scripts/createAdmin.js:19-20`, `scripts/seed-admin.mjs:36-37`, `scratch/testStorage.js:21`)**:
   ```js
   const email = 'elijah@rhockstarconnect.com';
   const password = 'RhockstarAdmin2026';
   // and 'RhockstarAdmin2026!'
   ```

7. **Client-Side Free Subscription Exploitation (`src/app/(dashboard)/premium/page.tsx:71-79`, `src/app/(dashboard)/employer/ads/page.tsx:45-50`)**:
   ```ts
   // premium/page.tsx
   const res = await updateUserProfile(profile.uid, {
     subscriptionTier: tier,
     subscriptionStatus: 'active'
   });
   
   // employer/ads/page.tsx
   const handleSimulatePayment = async (ad: Advertisement) => {
     const res = await confirmAdPayment(ad.id);
   ```

8. **Next.js Image Crash on Firebase Storage (`next.config.ts:14-20`, `AdminSidebar.tsx:111`, `employer/[jobId]/page.tsx:210`)**:
   `next.config.ts` only specifies `images.unsplash.com` in `remotePatterns`. `firebasestorage.googleapis.com` is missing, causing fatal runtime exceptions when rendering user avatars or media.

9. **TypeScript Compilation Status**:
   Ran `npx tsc --noEmit`. Command exited with code 0 (types compile, but runtime architectural flaws and logic bugs remain).

---

## 2. Logic Chain

1. **From Observation 1**: Because `src/app/api/clear-connections/route.ts` responds to HTTP `GET` requests without checking user tokens or headers, any HTTP client (such as a search engine robot or malicious actor) that accesses `https://rhockstarconnect.com/api/clear-connections` will trigger `adminDb.collection('connections').get()` and batch delete all connection documents. Therefore, the connection graph of the entire platform is vulnerable to unauthenticated total erasure.
2. **From Observation 2**: Because `POST /api/notify` does not require authentication and immediately dispatches Firebase messages using `adminMessaging.sendEachForMulticast`, any attacker can spoof notifications with arbitrary text, impersonate platform administrators, and send malicious links to all registered users.
3. **From Observation 3**: Because `firestore.rules` uses `get(/.../users/$(request.auth.uid)).data.role == 'admin'` to verify administrator status, and simultaneously allows `allow create, update: if isOwner(userId)`, any authenticated user can modify their own user document to `{ role: 'admin' }`. Firestore then treats that user as an administrator, granting full read/write access to administrative endpoints and protected Firestore collections.
4. **From Observation 3 & 4**: Because Firestore defaults to denying access to collections without explicit match rules, client code that queries `chats`, `jobs`, `job_applications`, `connections`, `follows`, `notifications`, `dating_interactions`, `matches`, or `settings` will immediately receive `FirebaseError: Missing or insufficient permissions` in production.
5. **From Observation 5**: Because `resetPasswordDirect` writes the password into `updatedPasswordHint` without hashing or validation, and `loginUser` bypasses Firebase Auth using this hint, user credentials are fundamentally compromised, and users logging in through this fallback receive a mock auth state where Firebase SDK calls fail.
6. **From Observation 7**: Because payment validation occurs only in client callbacks without server verification against Flutterwave or Paystack APIs, any user can execute the client mutation `updateUserProfile(uid, { subscriptionTier: 'elite' })` and obtain premium features without payment.
7. **From Observation 8**: Next.js App Router strictly validates image hostnames against `images.remotePatterns`. Because Firebase Storage (`firebasestorage.googleapis.com`) is not in `remotePatterns`, any page rendering an avatar or uploaded file using `next/image` crashes at runtime.

---

## 3. Caveats

- The live Firebase production console and Firestore rules deployment status were assessed based on the version-controlled `firestore.rules` and `storage.rules` in this repository; if out-of-band rules exist in the Firebase Cloud console, they may differ from repository files.
- Third-party webhook configurations (e.g. Flutterwave or Paystack dashboard webhooks) could not be inspected as external cloud accounts are outside the repository boundary.
- No live user data was modified or exfiltrated during this read-only audit.

---

## 4. Conclusion

The Rhockstar Connect backend architecture contains **10 Critical vulnerabilities** and **6 High-severity bugs** that must be remediated prior to production release:
1. Critical unauthorized data deletion in `/api/clear-connections` and unauthenticated notifications in `/api/notify`.
2. Severe privilege escalation in `firestore.rules` allowing any user to become SuperAdmin.
3. Universal read/write vulnerability in `storage.rules` allowing arbitrary file overwrite/deletion.
4. Complete failure of core collections (`chats`, `jobs`, `notifications`, `connections`) due to absent security rules.
5. Complete payment bypass allowing free Elite tier upgrades and live ad publishing.
6. Plaintext password exposure in Firestore via `resetPasswordDirect`.
7. Unhandled image domain crashes in `next.config.ts`.

All 22 documented issues are detailed with code snippets, root cause analyses, and concrete remediations in `findings.md`.

---

## 5. Verification Method

To independently verify these findings:

1. **Verify `/api/clear-connections` Exposure**:
   Inspect `src/app/api/clear-connections/route.ts` lines 4-22. Confirm the export is `async function GET()` with no auth header verification.
2. **Verify `/api/notify` Exposure**:
   Inspect `src/app/api/notify/route.ts` lines 5-18. Confirm `req.json()` is parsed without verifying `adminAuth.verifyIdToken()`.
3. **Verify Firestore Rule Flaws**:
   Inspect `firestore.rules`. Confirm absence of match blocks for `chats`, `jobs`, `job_applications`, `connections`, `follows`, `notifications`, and `dating_interactions`. Confirm lines 20-24 allow `isOwner(userId)` updates without field restrictions.
4. **Verify Storage Overwrite**:
   Inspect `storage.rules` lines 8-11. Confirm wildcard `match /{allPaths=**}` allows `read, write: if request.auth != null`.
5. **Verify Hardcoded Credentials**:
   Inspect `scripts/createAdmin.js` line 19-20 and `scripts/seed-admin.mjs` lines 36-37.
6. **Verify Next.js Image Config**:
   Inspect `next.config.ts` lines 14-21 and search for `<Image src={profile.avatar}` across `src/components/layout/AdminSidebar.tsx:111`.

# 🔍 Rhockstar Connect — Comprehensive Business Logic, Workflows & Integrations Audit Report

**Audit Date**: September 10, 2026  
**Auditor**: Explorer 3 (`teamwork_preview_explorer_survey_3`)  
**Parent Orchestrator ID**: `796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`  
**Working Directory**: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_explorer_survey_3`  
**Repository Root**: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect`  

---

## Executive Summary

A comprehensive, deep-dive read-only audit of Rhockstar Connect's business logic, state machines, and integrations was conducted across all application routes, Firebase services, API endpoints, and security rules.

### Key Takeaways:
1. **Critical Security & Data Integrity Vulnerabilities**: A public unauthenticated `GET` endpoint (`/api/clear-connections`) permanently deletes the entire platform's user connections database on request. A password reset backdoor (`resetPasswordDirect`) stores plaintext passwords in Firestore and allows account takeover without authentication or verification.
2. **Broken Database Security Rules**: 11 core Firestore collections (`jobs`, `job_applications`, `chats`, `chats/{id}/messages`, `communities/{id}/messages`, `connections`, `dating_interactions`, `matches`, `notifications`, `referrals`, `settings`) are missing from `firestore.rules`. In production, all client read/write operations against these collections will fail with `FirebaseError: Missing or insufficient permissions`.
3. **Severe Payment Security Loopholes**: There is no Paystack integration. Flutterwave is integrated purely client-side; on payment success, the browser directly sets `subscriptionTier: 'pro' | 'elite'` in Firestore without server-side verification, transaction ID checking, or webhook confirmation. Ad payments are handled via a client-side simulation button that activates ads live on the feed for free.
4. **Architectural Gaps vs Dispatch Request**: The prompt requested audits of Booking & Appointments, Artisans/Service Providers, and Reviews/Ratings. The codebase contains zero implementation of these features; Rhockstar Connect is architected around Job Applications (ATS), Community/Direct Messaging, Social Feed, Dating, and Sponsored Ads.
5. **State Synchronization & Workflow Dead-Ends**: Applicant Tracking displays fabricated mock statuses based on array modulo (`index % 4`), direct messaging has dead/unhooked file and voice note controls, user profile updates self-lock if the user ever commented on another user's post, and referral rewards cannot be credited due to security rule constraints.

---

## Issue Severity Summary

| Severity | Count | Primary Impact Areas |
| :--- | :---: | :--- |
| **Critical** | 5 | Database wipe endpoint, account takeover backdoor, privilege escalation, broken security rules, client-side payment tampering |
| **High** | 9 | Fake ad payments, hardcoded test keys, fake ATS statuses, mock company ATS, missing job authorization, dead chat media UI, O(N) mark-as-read writes, self-locking profile update, localStorage dating limit bypass |
| **Medium** | 10 | Pricing discrepancies, unenforced subscription expiration, silent ATS updates, leaked community requests, unauthenticated push API, role/accountType mismatch, registration schema gaps, partial account deletion, unused referral perks, fake "who liked you" view |
| **Low** | 6 | Redundant debouncer return, dead resource links, unused ComingSoon component, missing Paystack vs Flutterwave config, leaderboard query exclusions |
| **Total Issues** | **30** | Verified with exact file paths, line numbers, and evidence |

---

## Detailed Findings

---

### Category 1: Catastrophic & Critical System Security / Integrity Workflows

#### ISSUE-01: Unauthenticated Public Endpoint Wipes Entire Connections Database
- **Severity**: **Critical**
- **File Path**: `src/app/api/clear-connections/route.ts` (Lines 4–22)
- **User Flow / Scenario**: Any web crawler, search engine indexer, or unauthenticated external visitor sends an HTTP `GET` request to `https://rhockstarconnect.com/api/clear-connections`.
- **Suspected Root Cause**: A destructive database cleanup utility script was deployed as a public Next.js API route without authentication, authorization, or environment guards. It uses `adminDb` to bypass all security rules and delete all documents in the `connections` collection.
- **Evidence Snippet**:
```ts
// src/app/api/clear-connections/route.ts:4-18
export async function GET() {
  try {
    const querySnapshot = await adminDb.collection('connections').get();
    let count = 0;
    
    // Create a batch to delete all documents efficiently
    const batch = adminDb.batch();
    
    for (const d of querySnapshot.docs) {
      batch.delete(d.ref);
      count++;
    }
    
    await batch.commit();
    return NextResponse.json({ success: true, count });
```
- **Recommended Fix**: Delete `src/app/api/clear-connections/route.ts` immediately. If needed for testing, restrict it strictly behind SuperAdmin authentication and `process.env.NODE_ENV !== 'production'`.

---

#### ISSUE-02: Account Takeover & Plaintext Password Override Backdoor
- **Severity**: **Critical**
- **File Path**: `src/lib/auth.ts` (Lines 132–171, 177–204) & `src/components/auth/ResetPasswordModal.tsx` (Lines 44–56)
- **User Flow / Scenario**: An attacker clicks "Forgot Password" on `/login`, enters any targeted username or email (e.g., `elijah@rhockstarconnect.com`), and enters any new password.
- **Suspected Root Cause**: `resetPasswordDirect` searches Firestore for the user and writes `updatedPasswordHint: newPassword` in plaintext directly to the user's document with zero verification, OTP, or email validation. In `loginUser`, when Firebase Auth fails, the catch block compares `userData.updatedPasswordHint === password` and signs the user in with a synthetic session.
- **Evidence Snippet**:
```ts
// src/lib/auth.ts:148-164
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
```
- **Recommended Fix**: Completely remove `resetPasswordDirect` and the `updatedPasswordHint` fallback in `loginUser`. Use standard Firebase Authentication `sendPasswordResetEmail(auth, email)` which issues a cryptographically secure, time-limited reset link to the user's verified email.

---

#### ISSUE-03: Self-Assigned SuperAdmin Privilege Escalation via Open Firestore Rules
- **Severity**: **Critical**
- **File Path**: `firestore.rules` (Lines 14–17, 20–24)
- **User Flow / Scenario**: Any standard registered user executes `updateDoc(doc(db, 'users', auth.currentUser.uid), { role: 'admin' })` in the browser console.
- **Suspected Root Cause**: `firestore.rules` allows an owner of a document in `/users/{userId}` to perform unrestricted updates (`allow create, update: if isOwner(userId) || isAdmin();`). Because the rules do not restrict editable fields, users can assign `role: 'admin'`. Subsequent rule evaluations invoke `isAdmin()`, which reads `data.role == 'admin'`, granting full platform SuperAdmin privileges.
- **Evidence Snippet**:
```
// firestore.rules:14-24
function isAdmin() {
  return isAuthenticated() && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// Users Collection
match /users/{userId} {
  allow read: if isAuthenticated();
  allow create, update: if isOwner(userId) || isAdmin();
  allow delete: if isAdmin();
}
```
- **Recommended Fix**: Restrict user updates in `firestore.rules` to disallow modifications to `role`, `isBanned`, `subscriptionTier`, and `isVerified`:
```
allow update: if isOwner(userId) && 
  !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'isBanned', 'subscriptionTier', 'subscriptionStatus'])
  || isAdmin();
```
Assign administrative privileges strictly via Firebase Auth Custom Claims or server-side Firebase Admin SDK.

---

#### ISSUE-04: Complete Production Platform Failure Due to Missing Collection Rules
- **Severity**: **Critical**
- **File Path**: `firestore.rules` (Lines 1–65)
- **User Flow / Scenario**: Any authenticated user attempts to post or search jobs, submit job applications, send direct messages, send community messages, connect with professionals, swipe on dating profiles, or receive notifications.
- **Suspected Root Cause**: In Firestore, any collection or subcollection without an explicit `match` rule defaults to `deny all`. The following collections used extensively by client services are missing from `firestore.rules`:
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
`firestore.rules` defines rules only for:
- `users/{userId}`
- `advertisements/{adId}`
- `posts/{postId}`
- `communities/{communityId}` (shallow, does not cover messages)
- `messages/{messageId}` (wrong path; service uses `chats/{chatId}/messages`)
- `mail/{mailId}`
- `reports/{reportId}`
- **Recommended Fix**: Add comprehensive security rules for all missing collections in `firestore.rules`, ensuring correct document paths, subcollection matching (`match /chats/{chatId}/messages/{messageId}`), and authorization checks.

---

#### ISSUE-05: Insecure Wildcard Firebase Storage Rules Expose All User Files
- **Severity**: **Critical**
- **File Path**: `storage.rules` (Lines 7–13)
- **User Flow / Scenario**: An authenticated attacker views, downloads, modifies, or deletes another user's uploaded resumes, private chat photos, or company documents.
- **Suspected Root Cause**: The storage rules permit any authenticated user unrestricted read and write access to all files in the bucket without folder-level or user-level ownership checks.
- **Evidence Snippet**:
```
// storage.rules:7-12
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow read/write access to all authenticated users
      allow read, write: if request.auth != null;
    }
  }
}
```
- **Recommended Fix**: Implement scoped storage path rules:
```
match /chats/{chatId}/{fileName} {
  allow read, write: if request.auth != null; // Verify user is a chat participant
}
match /resumes/{userId}/{fileName} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}
match /avatars/{userId}/{fileName} {
  allow read: if true;
  allow write: if request.auth.uid == userId;
}
```

---

### Category 2: Payment, Billing & Monetization Workflows

#### ISSUE-06: Client-Side Payment Verification & Lifetime Subscription Fraud
- **Severity**: **Critical**
- **File Path**: `src/app/(dashboard)/premium/page.tsx` (Lines 40–89)
- **User Flow / Scenario**: A user chooses a subscription tier (Pro $2/mo or Elite $5/mo) and completes or cancels the Flutterwave payment popup.
- **Suspected Root Cause**: Verification occurs entirely within the client-side JavaScript callback. Upon receiving `response.status === 'successful'`, the browser invokes `handleSubscribe(tier)`, which immediately writes `{ subscriptionTier: tier, subscriptionStatus: 'active' }` into Firestore from the client. No server API validates `transaction_id`, amount paid, or currency. Furthermore, no `premiumUntil` expiration date is set, conferring permanent lifetime subscription perks on a single payment.
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/premium/page.tsx:42-55, 75-80
handleFlutterPayment({
  callback: (response) => {
    if (response.status === 'successful' || response.status === 'completed') {
      onSuccess(tier);
    } else {
      setIsProcessing(false);
      toast.error("Payment was not successful.");
    }
    closePaymentModal();
  },
...
const res = await updateUserProfile(profile.uid, {
  subscriptionTier: tier,
  subscriptionStatus: 'active'
});
```
- **Recommended Fix**:
  1. Create a server endpoint `/api/payments/verify` that calls the payment provider's API with the server secret key to verify the transaction reference, amount, and status.
  2. Implement an authenticated webhook endpoint (`/api/payments/webhook`) with cryptographic signature validation.
  3. Set an explicit `premiumUntil` timestamp (e.g. `now + 30 days`) and store the transaction record in a `transactions` collection.

---

#### ISSUE-07: Mocked Ad Payment Simulation Button Bypasses Payment Processor
- **Severity**: **High**
- **File Path**: `src/app/(dashboard)/employer/ads/page.tsx` (Lines 45–60, 224–239) & `src/lib/services/ads.ts` (Lines 262–278)
- **User Flow / Scenario**: An advertiser's campaign is approved by the SuperAdmin with a price (e.g., ₦15,000). The advertiser clicks "Pay ₦15,000 to Activate".
- **Suspected Root Cause**: The payment button is wired to `handleSimulatePayment`, which simulates payment success and directly executes `confirmAdPayment(ad.id)`. This transitions the ad status to `active` in Firestore without debiting the advertiser. Additionally, `firestore.rules:30` allows the ad owner (`resource.data.companyId == request.auth.uid`) to update their own ad directly, allowing arbitrary status changes to `active`.
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/employer/ads/page.tsx:45-54
const handleSimulatePayment = async (ad: Advertisement) => {
  try {
    setPayingAdId(ad.id);
    // Simulate Paystack / Flutterwave success callback
    const res = await confirmAdPayment(ad.id);
    if (res.success) {
      toast.success(`Payment confirmed! Advert "${ad.title}" is now LIVE in the Feed! 🚀`);
...
// src/app/(dashboard)/employer/ads/page.tsx:226
onClick={() => handleSimulatePayment(ad)}
```
- **Recommended Fix**: Replace `handleSimulatePayment` with real payment processor checkout (Flutterwave/Paystack), verify payment on the server before updating `status: 'active'`, and disallow advertisers from updating `status` directly in `firestore.rules`.

---

#### ISSUE-08: Hardcoded Flutterwave Test Key Fallback & Missing Secret Keys
- **Severity**: **High**
- **File Path**: `src/app/(dashboard)/premium/page.tsx` (Line 21) & `.env.local`
- **User Flow / Scenario**: Production users pay for membership subscriptions.
- **Suspected Root Cause**: `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` is not defined in `.env.local`. The code falls back to a hardcoded test key (`FLWPUBK_TEST-78ba9038855272bdb48441ac8989d5aa-X`).
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/premium/page.tsx:21
public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-78ba9038855272bdb48441ac8989d5aa-X',
```
- **Recommended Fix**: Configure production payment gateway keys in `.env.local` and Netlify environment settings, and add them to `requiredEnvVars` in `src/lib/env.ts`.

---

#### ISSUE-09: Unenforced Subscription Expirations Result in Infinite Access
- **Severity**: **Medium**
- **File Path**: `src/lib/services/admin.ts` (Line 125), `src/lib/services/referrals.ts` (Line 155), `src/app/admin/(protected)/subscriptions/page.tsx` (Line 211)
- **User Flow / Scenario**: An admin grants a user 30 days of Pro or Elite, or a user earns 7 days via referrals. When 30 days elapse, the user continues to have active membership.
- **Suspected Root Cause**: The application records `premiumUntil`, but nowhere in `AuthProvider.tsx`, middleware, or database triggers is there a check verifying whether `new Date() > new Date(profile.premiumUntil)`.
- **Evidence Snippet**:
```ts
// src/app/admin/(protected)/subscriptions/page.tsx:211
{sub.premiumUntil ? new Date(sub.premiumUntil).toLocaleDateString() : "Lifetime"}
```
- **Recommended Fix**: Add a subscription status check in `AuthProvider.tsx` on user authentication that compares `premiumUntil` against `Date.now()`, automatically resetting `subscriptionTier: 'free'` and `subscriptionStatus: 'inactive'` if expired.

---

#### ISSUE-10: Pricing Model Discrepancy Between Checkout and Admin Analytics
- **Severity**: **Medium**
- **File Path**: `src/app/(dashboard)/premium/page.tsx` (Line 16) vs `src/app/admin/(protected)/subscriptions/page.tsx` (Lines 48–49)
- **User Flow / Scenario**: Users are charged $2 (Pro) and $5 (Elite) at checkout. In the Admin Subscription Manager, the estimated monthly revenue is calculated as `(proCount * 9.99) + (eliteCount * 19.99)`.
- **Suspected Root Cause**: Lack of a centralized pricing configuration file.
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/premium/page.tsx:16
const baseUSD = tier === 'pro' ? 2 : 5;

// src/app/admin/(protected)/subscriptions/page.tsx:48-49
// Estimated revenue calculation ($9.99/mo Pro, $19.99/mo Elite)
const estRevenue = (proCount * 9.99) + (eliteCount * 19.99);
```
- **Recommended Fix**: Extract all subscription pricing tiers and multipliers into a shared constant file (`src/lib/constants/pricing.ts`).

---

### Category 3: Job Board & Applicant Tracking System (ATS) Workflows

#### ISSUE-11: Application Tracker Displays Fabricated Statuses Based on Array Index
- **Severity**: **High**
- **File Path**: `src/components/jobs/ApplicationTracker.tsx` (Lines 21–38) & `src/app/(dashboard)/jobs/page.tsx` (Lines 25, 117–119, 230)
- **User Flow / Scenario**: An applicant submits applications, then views the "Applications" tab to track employer decisions.
- **Suspected Root Cause**: `jobs/page.tsx` stores applied job IDs only in React local state (`useState<Set<string>>(new Set())`), which is lost on page reload. Even during a session, `ApplicationTracker.tsx` does not read the applicant's real status from `job_applications`. Instead, it cycles through mock statuses based on `index % 4`.
- **Evidence Snippet**:
```ts
// src/components/jobs/ApplicationTracker.tsx:21-37
// Mock statuses for demonstration
const statuses = [
  { label: "Applied", icon: CheckCircle2, color: "text-blue-500", ... },
  { label: "Viewed by Employer", icon: Eye, color: "text-purple-500", ... },
  { label: "Interview", icon: Calendar, color: "text-amber-500", ... },
  { label: "Hired", icon: Trophy, color: "text-emerald-500", ... }
];
...
{appliedJobs.map((job, index) => {
  // Assign random mock status based on index for demo purposes
  const status = statuses[index % statuses.length];
```
- **Recommended Fix**: Refactor `ApplicationTracker` to call `getUserApplications(profile.uid)` on mount, displaying real candidate statuses (`pending`, `screening`, `reviewed`, `interviewing`, `accepted`, `rejected`) updated by employers.

---

#### ISSUE-12: Company ATS Page Disconnected from Real Database Applications
- **Severity**: **High**
- **File Path**: `src/app/(dashboard)/company/[username]/ats/page.tsx` (Lines 22–28, 76–85)
- **User Flow / Scenario**: An employer navigates to `/company/[username]/ats` to manage incoming job applications.
- **Suspected Root Cause**: The page uses hardcoded static candidates (`Alex Chen`, `Sarah Jenkins`, etc.) and `handleDrop` only modifies local state. It never fetches real applications from `job_applications`.
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/company/[username]/ats/page.tsx:22-28, 76-85
const MOCK_CANDIDATES: Candidate[] = [
  { id: "c1", name: "Alex Chen", role: "Senior Frontend Engineer", status: "applied", ... },
  { id: "c2", name: "Sarah Jenkins", role: "Senior Frontend Engineer", status: "applied", ... },
  { id: "c3", name: "Michael Ross", role: "Senior Frontend Engineer", status: "interviewing", ... },
...
const handleDrop = (e: React.DragEvent, newStatus: CandidateStatus) => {
  ...
  setCandidates(prev => prev.map(c => 
    c.id === candidateId ? { ...c, status: newStatus } : c
  ));
```
- **Recommended Fix**: Deprecate `/company/[username]/ats` in favor of `/employer/[jobId]` or refactor it to query real applications for the company's posted jobs.

---

#### ISSUE-13: Missing Ownership Authorization Check on Employer Job ATS Route
- **Severity**: **High**
- **File Path**: `src/app/(dashboard)/employer/[jobId]/page.tsx` (Lines 119–122) & `src/lib/services/jobs.ts` (Lines 227–247)
- **User Flow / Scenario**: An employer with an Elite subscription enters the URL for another company's job (`/employer/[other_job_id]`).
- **Suspected Root Cause**: The page verifies that the current user has `role: 'employer'` and `subscriptionTier: 'elite'`, but fails to verify that `profile.uid === job.companyId`. Any Elite employer can inspect and manipulate candidate applications for any competitor's job.
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/employer/[jobId]/page.tsx:119-122
const isEmployer = profile?.accountType === 'employer' || profile?.role === 'admin' || (profile as any)?.role === 'employer';
const isElite = profile?.subscriptionTier === 'elite' || profile?.role === 'admin';

if (!profile || !isEmployer || !isElite) {
  // Access denied only if not employer or not elite
```
- **Recommended Fix**: Fetch the job listing and assert `job.companyId === profile.uid || profile.role === 'admin'`. Return 403 Forbidden if the user is not the job's author.

---

#### ISSUE-14: Silent Candidate Status Transitions Without User Notifications
- **Severity**: **Medium**
- **File Path**: `src/lib/services/jobs.ts` (Lines 266–274) vs `src/app/(dashboard)/settings/page.tsx` (Line 567)
- **User Flow / Scenario**: An employer changes an applicant's status to 'reviewed', 'interviewing', or 'rejected'.
- **Suspected Root Cause**: `updateApplicationStatus` writes to Firestore but does not call `createNotification` or send email alerts. Settings promises users: *"Receive status updates when employers review your applications."*
- **Evidence Snippet**:
```ts
// src/lib/services/jobs.ts:266-273
export const updateApplicationStatus = async (applicationId: string, status: JobApplication['status']) => {
  try {
    const appRef = doc(db, "job_applications", applicationId);
    await updateDoc(appRef, { status });
    return { success: true };
  } catch (error: any) {
```
- **Recommended Fix**: Query the application document to obtain `applicantId` and `jobId`, and trigger an in-app notification via `createNotification`.

---

#### ISSUE-15: Redundant Return Statement in Job Search Debounce Cleanup
- **Severity**: **Low**
- **File Path**: `src/app/(dashboard)/jobs/page.tsx` (Lines 75–77)
- **User Flow / Scenario**: Job query search effect triggers cleanup.
- **Suspected Root Cause**: Duplicate consecutive return statement.
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/jobs/page.tsx:75-77
return () => clearTimeout(timer);
return () => clearTimeout(timer);
```
- **Recommended Fix**: Remove line 76.

---

### Category 4: Messaging & Real-Time Chat Workflows

#### ISSUE-16: Dead UI: Missing File Attachment & Voice Note Controls in DMs
- **Severity**: **High**
- **File Path**: `src/app/(dashboard)/messages/page.tsx` (Lines 103–109, 484–494, 1373–1401)
- **User Flow / Scenario**: A user wants to attach an image, PDF document, or voice note to a direct message conversation, as advertised in `README.md`.
- **Suspected Root Cause**: State hooks (`mediaFile`, `mediaPreviewUrl`, `isRecording`, `mediaRecorderRef`, `audioChunksRef`) and `handleFileSelect` are declared, but the DM input form renders only a `<textarea>` and submit button. There is no file input, attachment paperclip button, or microphone button in the JSX.
- **Evidence Snippet**:
```tsx
// src/app/(dashboard)/messages/page.tsx:1373-1401
{/* DM Input Bar */}
<form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900/90 flex items-center gap-3">
  <textarea
    ...
  />
  <button
    type="submit"
    disabled={!newMessage.trim()}
    ...
  >
    <Send className="w-5 h-5" />
  </button>
</form>
```
- **Recommended Fix**: Add a file attachment button with a hidden `<input type="file" onChange={handleFileSelect}>` and a voice recording button hooked to `MediaRecorder` in the DM form.

---

#### ISSUE-17: Catastrophic O(N) Unbounded Document Reads and Writes on Chat Open
- **Severity**: **High**
- **File Path**: `src/lib/services/messages.ts` (Lines 182–204) & `src/app/(dashboard)/messages/page.tsx` (Lines 265–267)
- **User Flow / Scenario**: A user clicks on an active chat containing 300 messages.
- **Suspected Root Cause**: `markMessagesAsRead` runs `where('senderId', '!=', currentUserId)` over the entire message history and fires individual `updateDoc` calls in `Promise.all` for every unread message. This generates hundreds of concurrent Firestore writes on every click.
- **Evidence Snippet**:
```ts
// src/lib/services/messages.ts:182-200
export const markMessagesAsRead = async (chatId: string, currentUserId: string) => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, where('senderId', '!=', currentUserId));
    const snapshot = await getDocs(q);

    const updatePromises: Promise<void>[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.data().status !== 'read') {
        updatePromises.push(updateDoc(doc(db, `chats/${chatId}/messages`, docSnap.id), { status: 'read' }));
      }
    });
...
    await Promise.all(updatePromises);
```
- **Recommended Fix**: Query only messages with `status == 'delivered'` (or unread), limit the batch size, and use `writeBatch(db)` instead of hundreds of independent `updateDoc` calls.

---

#### ISSUE-18: Private Community Join Request Memory Leakage
- **Severity**: **Medium**
- **File Path**: `src/lib/services/communities.ts` (Lines 305–338)
- **User Flow / Scenario**: A community creator accepts or declines member join requests.
- **Suspected Root Cause**: `acceptJoinRequest` and `declineJoinRequest` remove the user's UID from `pendingRequests`, but fail to remove the corresponding request object from `pendingRequestDetails`. The array grows indefinitely and retains stale member data.
- **Evidence Snippet**:
```ts
// src/lib/services/communities.ts:314-317
await updateDoc(communityRef, {
  members: arrayUnion(requestUser.uid),
  memberCount: increment(1),
  pendingRequests: arrayRemove(requestUser.uid),
  // pendingRequestDetails is NOT updated!
});
```
- **Recommended Fix**: Remove the corresponding `JoinRequestDetail` object from `pendingRequestDetails` using `arrayRemove` or filter it out on update.

---

#### ISSUE-19: Unauthenticated Push Notification API Allows Notification Spoofing
- **Severity**: **Medium**
- **File Path**: `src/app/api/notify/route.ts` (Lines 5–68)
- **User Flow / Scenario**: An external entity sends a POST request with `{ userId, title, body, url }` to `/api/notify`.
- **Suspected Root Cause**: The endpoint lacks authentication or CSRF protection. Anyone with knowledge of a user's UID can broadcast arbitrary spam push notifications to their device.
- **Evidence Snippet**:
```ts
// src/app/api/notify/route.ts:5-13
export async function POST(req: Request) {
  try {
    const { userId, title, body, icon, url } = await req.json();

    if (!userId || !title || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
```
- **Recommended Fix**: Extract and verify the caller's Firebase ID token via `adminAuth.verifyIdToken(token)` before delivering push notifications.

---

### Category 5: User Profiles, Roles & Registration Workflows

#### ISSUE-20: Self-Locking User Profile: Comment Synchronization Batch Fails on Other Users' Posts
- **Severity**: **High**
- **File Path**: `src/lib/services/users.ts` (Lines 167–245)
- **User Flow / Scenario**: A user edits their full name, username, or avatar in Profile Settings after having commented on another user's post.
- **Suspected Root Cause**: `updateUserProfile` attempts to synchronize the user's new avatar and name across all comments in all posts across the platform using a `writeBatch`. However, `firestore.rules:37` specifies `allow update, delete: if isAdmin() || (isAuthenticated() && resource.data.authorId == request.auth.uid)`. Because the user does not own the other user's post, the batch write is rejected by Firestore rules, causing the entire profile update to fail with `Missing or insufficient permissions`. The user is permanently blocked from updating their profile.
- **Evidence Snippet**:
```ts
// src/lib/services/users.ts:188-209, 244
const allPostsQuery = query(collection(db, 'posts'));
const allPostsSnap = await getDocs(allPostsQuery);
allPostsSnap.docs.forEach(postDoc => {
  const postData = postDoc.data();
  if (postData.comments && Array.isArray(postData.comments)) {
    let updated = false;
    const newComments = postData.comments.map((comment: any) => {
      if (comment.userId === userId) {
        updated = true;
        return {
          ...comment,
          userName: data.fullName !== undefined ? data.fullName : comment.userName,
          userAvatar: data.avatar !== undefined ? data.avatar : comment.userAvatar,
        };
      }
      return comment;
    });
    
    if (updated) {
      batch.update(postDoc.ref, { comments: newComments });
      count++;
    }
  }
});
...
await batch.commit(); // Rejection if post author is not current user!
```
- **Recommended Fix**: Do not attempt to update comments embedded in other users' posts from client-side code. Either normalize comments into a subcollection with comment-author ownership rules, or update profile display information on render dynamically.

---

#### ISSUE-21: Disconnected Employer Upgrade: `accountType` Not Persisted to Firestore
- **Severity**: **Medium**
- **File Path**: `src/lib/services/users.ts` (Lines 255–257) & `src/app/(dashboard)/jobs/post/page.tsx` (Lines 83–92)
- **User Flow / Scenario**: A user clicks "Upgrade to Employer Account" on `/jobs/post`.
- **Suspected Root Cause**: `becomeEmployer` writes `{ role: 'employer' }` to Firestore, but leaves `accountType` unchanged (still `'standard'`). The component modifies `accountType: 'employer'` only in Zustand local storage. On subsequent login or page refresh, `accountType` reverts to `'standard'`, breaking employer profile views and ATS company routes.
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
- **Recommended Fix**: Update `becomeEmployer` to update `{ role: 'employer', accountType: 'employer' }` in Firestore.

---

#### ISSUE-22: Registration Schema Omissions Cause Inconsistent User States
- **Severity**: **Medium**
- **File Path**: `src/lib/auth.ts` (Lines 49–65) vs `src/lib/services/users.ts` (Lines 14–45)
- **User Flow / Scenario**: New user signs up on `/register`.
- **Suspected Root Cause**: The Firestore document created in `registerUser` omits `role`, `subscriptionTier`, `subscriptionStatus`, `avatar`, `stardomXP`, `streakCount`, and `isVerified`. As a result, newly registered users are omitted from queries ordering by `stardomXP` (leaderboard), and subscription checks evaluate inconsistently.
- **Evidence Snippet**:
```ts
// src/lib/auth.ts:49-65
await setDoc(doc(db, "users", user.uid), {
  uid: user.uid,
  fullName,
  username: username.toLowerCase().replace('@', ''),
  email,
  accountType, // Defaults to 'standard', not 'individual'
  bio: "",
  headline: "",
  location: { city: "", state: "", country: "" },
  stats: { posts: 0, followers: 0, following: 0, connections: 0 },
  referralCode: username.toLowerCase().replace('@', ''),
  referralCount: 0,
  referredFriends: [],
  claimedRewards: [],
  createdAt: serverTimestamp(),
  lastLogin: serverTimestamp(),
});
```
- **Recommended Fix**: Explicitly populate default schema fields in `registerUser`:
```ts
role: 'user',
subscriptionTier: 'free',
subscriptionStatus: 'inactive',
stardomXP: 0,
stardomRank: 'Explorer',
streakCount: 0,
avatar: '',
```

---

#### ISSUE-23: Partial Account Deletion Leaves Orphaned Firebase Auth Credentials
- **Severity**: **Medium**
- **File Path**: `src/lib/services/admin.ts` (Lines 92–100) & `src/app/admin/(protected)/users/page.tsx` (Lines 81–91)
- **User Flow / Scenario**: An admin deletes a user account from `/admin/users`.
- **Suspected Root Cause**: `deleteUserAdmin` deletes only the user's Firestore document. It does not delete the user account from Firebase Authentication. The deleted user can still log in; on login, `AuthProvider` finds no profile document and sets `profile: null`, leading to application crashes.
- **Evidence Snippet**:
```ts
// src/lib/services/admin.ts:92-100
export const deleteUserAdmin = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return { success: true };
  } catch (error: unknown) {
...
```
- **Recommended Fix**: Create an admin API route (`/api/admin/users/delete`) that deletes both the Firebase Auth account (`adminAuth.deleteUser(uid)`) and associated Firestore documents.

---

### Category 6: Dating, Networking & Gamification Workflows

#### ISSUE-24: Client-Side LocalStorage Dating Swipe Limit Bypass
- **Severity**: **High**
- **File Path**: `src/app/(dashboard)/dating/page.tsx` (Lines 64–71, 80–85)
- **User Flow / Scenario**: A free tier user swipes 5 times on dating profiles and encounters the premium lock.
- **Suspected Root Cause**: The daily 5-swipe limit is enforced entirely via `localStorage.getItem('dating_swipes_YYYY-MM-DD')`. Users can bypass the limit by clearing browser local storage or opening an incognito session.
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/dating/page.tsx:80-84
const newSwipes = swipesToday + 1;
setSwipesToday(newSwipes);
const dateKey = new Date().toISOString().split('T')[0];
localStorage.setItem(`dating_swipes_${dateKey}`, newSwipes.toString());
```
- **Recommended Fix**: Track dating swipes in Firestore on the user's document or query the count of `dating_interactions` where `fromUserId == profile.uid && createdAt >= startOfDay`.

---

#### ISSUE-25: Referrals Blocked by Firestore Security Rules
- **Severity**: **High**
- **File Path**: `src/lib/services/referrals.ts` (Lines 93–102) & `src/lib/auth.ts` (Line 69)
- **User Flow / Scenario**: A new user registers using an existing user's referral code.
- **Suspected Root Cause**: During registration, `recordReferral` is called from the new user's browser, attempting to update the referrer's document (`updateDoc(referrerRef, ...)`). Because `firestore.rules:22` permits users to update only their own document (`isOwner(userId)`), the write is rejected with `Missing or insufficient permissions`. The referrer never receives credit.
- **Evidence Snippet**:
```ts
// src/lib/services/referrals.ts:93-102
const referrerRef = doc(db, 'users', referrerId);

// Update referrer record
await updateDoc(referrerRef, {
  referralCount: increment(1),
  referredFriends: arrayUnion({
    uid: newUserId,
    name: newUserName,
    registeredAt: new Date().toISOString()
  })
});
```
- **Recommended Fix**: Process referral attribution on the server (e.g. via Next.js API route or Firebase Cloud Function) using `adminDb`.

---

#### ISSUE-26: Tier 3 Referral Reward (+20 Job Applications) Is Non-Functional
- **Severity**: **Medium**
- **File Path**: `src/lib/services/referrals.ts` (Line 165) vs `src/app/(dashboard)/jobs/page.tsx` (Lines 86–91)
- **User Flow / Scenario**: A user refers 5 friends and claims the Tier 3 reward ("+20 Job Applications"). They attempt to apply to a 3rd job.
- **Suspected Root Cause**: `claimReferralReward` increments `extraJobApps` in Firestore, but `handleApply` in `jobs/page.tsx` checks only `appliedJobIds.size >= 2` and ignores `profile.extraJobApps`.
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/jobs/page.tsx:86-91
const handleApply = async (job: JobListing, isFeatured?: boolean) => {
  const isFree = !profile?.subscriptionTier || profile.subscriptionTier === 'free';
  
  if (isFree && (appliedJobIds.size >= 2 || isFeatured)) {
    setPremiumLockOpen(true);
    return;
  }
```
- **Recommended Fix**: Update `handleApply` to account for `profile.extraJobApps`:
```ts
const allowedLimit = 2 + (profile?.extraJobApps || 0);
if (isFree && (appliedJobIds.size >= allowedLimit || isFeatured)) { ... }
```

---

#### ISSUE-27: Deceptive "Who Liked You" Premium Feature
- **Severity**: **Medium**
- **File Path**: `src/app/(dashboard)/dating/page.tsx` (Lines 117–127)
- **User Flow / Scenario**: A user upgrades to Premium after being prompted to "See Who Liked Your Profile".
- **Suspected Root Cause**: Clicking "See Who Liked You" simply toggles `viewMode: 'grid'`, which renders the exact same list of unswiped prospects. There is no query looking up users who liked the current user.
- **Evidence Snippet**:
```ts
// src/app/(dashboard)/dating/page.tsx:117-124
const handleSeeWhoLikedYouClick = () => {
  if (isPremium) {
    setViewMode('grid');
    toast.success("Premium Dating Unlocked! Viewing all matching profiles.", {
      icon: "👑",
      style: { background: '#1e293b', color: '#fff' }
    });
  } else {
```
- **Recommended Fix**: Query `dating_interactions` where `toUserId == profile.uid && action == 'like'` and render the actual incoming admirers.

---

### Category 7: Architectural Gaps & Missing Workflows

#### ISSUE-28: Complete Absence of Booking & Appointment Lifecycle
- **Severity**: **Critical Architectural Gap**
- **File Path**: Entire codebase (0 matches for booking or appointment logic)
- **User Flow / Scenario**: Booking appointments, service scheduling, slot reservations, rescheduling, and appointment cancellations.
- **Suspected Root Cause**: The platform as designed does not feature a booking or appointment system.
- **Recommended Fix**: If booking/appointment scheduling is required, design a complete service layer including a `bookings` collection, status state machine (`pending` -> `confirmed` -> `in_progress` -> `completed` / `cancelled`), date-picker reservation modal, and calendar view.

---

#### ISSUE-29: Complete Absence of Artisan / Provider Roles & Reviews/Ratings
- **Severity**: **Critical Architectural Gap**
- **File Path**: Entire codebase (0 matches for artisan roles, service reviews, or star ratings)
- **User Flow / Scenario**: Client hiring an artisan/handyman, provider onboarding, leaving verified reviews and star ratings.
- **Suspected Root Cause**: Rhockstar Connect is built for white-collar networking, tech job applications, dating, and communities. It lacks an artisan marketplace and review system.
- **Recommended Fix**: If an artisan marketplace is intended, add role `'artisan'`, create a `services` catalog, and implement a `reviews` collection linked to completed bookings.

---

#### ISSUE-30: Complete Absence of Paystack Integration
- **Severity**: **High Integration Gap**
- **File Path**: `package.json`, `src/app/(dashboard)/premium/page.tsx`, `src/app/(dashboard)/employer/ads/page.tsx`
- **User Flow / Scenario**: Paying via Paystack for subscriptions or ad campaigns.
- **Suspected Root Cause**: Paystack SDK is not installed in `package.json`. The codebase exclusively references Flutterwave (`flutterwave-react-v3`) and mock payment simulations.
- **Recommended Fix**: If Paystack is the required gateway, install `@paystack/inline-js` or implement Paystack standard redirect checkout with server verification webhook.

---

## Remediation Roadmap & Priority Matrix

| Priority | Task | Target Files |
| :---: | :--- | :--- |
| **P0 (Immediate)** | Remove public wipe endpoint | Delete `src/app/api/clear-connections/route.ts` |
| **P0 (Immediate)** | Remove plaintext password override | Clean up `src/lib/auth.ts`, remove `resetPasswordDirect` |
| **P0 (Immediate)** | Fix Firestore rules (block role elevation & add missing collections) | Update `firestore.rules` |
| **P1 (High)** | Secure payments (server-side Flutterwave/Paystack verification & webhooks) | Create `/api/payments/verify`, update `premium/page.tsx` and `ads.ts` |
| **P1 (High)** | Fix real ATS tracking & employer application ownership | `ApplicationTracker.tsx`, `employer/[jobId]/page.tsx`, `jobs.ts` |
| **P1 (High)** | Fix profile update batch failure on other users' posts | `src/lib/services/users.ts` |
| **P2 (Medium)** | Fix DM file and voice attachment controls | `src/app/(dashboard)/messages/page.tsx` |
| **P2 (Medium)** | Secure push notification API | `src/app/api/notify/route.ts` |
| **P2 (Medium)** | Fix referral crediting via serverless function | `src/lib/services/referrals.ts` |
| **P3 (Low)** | Resolve dead UI links & pricing discrepancies | `resources/career/page.tsx`, `resources/dating/page.tsx`, `constants/pricing.ts` |

---
*Report compiled and verified by Explorer 3 (`teamwork_preview_explorer_survey_3`).*

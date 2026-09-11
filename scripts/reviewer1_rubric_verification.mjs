// scripts/reviewer1_rubric_verification.mjs
import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('EMPIRICAL REVIEWER 1 — RUBRIC & CODEBASE VERIFICATION HARNESS');
console.log('Scope: Executive Summary, SEC 01-10, PAY 01-05, DATA 01-10, ATS 01-06');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function verify(name, condition, details = '') {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${name}${details ? ` -> ${details}` : ''}`);
    passedTests++;
    return true;
  } else {
    console.error(`[FAIL] ${name}${details ? ` -> ${details}` : ''}`);
    failedTests++;
    return false;
  }
}

// -------------------------------------------------------------
// SEC-01
// -------------------------------------------------------------
const clearConn = fs.readFileSync('src/app/api/clear-connections/route.ts', 'utf8');
verify('SEC-01: File & Code Check', 
  clearConn.includes("adminDb.collection('connections').get()") &&
  clearConn.includes("batch.delete(d.ref)") &&
  !clearConn.includes("verifyIdToken") &&
  !clearConn.includes("auth"),
  'Unauthenticated GET clears connections via adminDb'
);

// -------------------------------------------------------------
// SEC-02
// -------------------------------------------------------------
const authTs = fs.readFileSync('src/lib/auth.ts', 'utf8');
const resetModal = fs.readFileSync('src/components/auth/ResetPasswordModal.tsx', 'utf8');
verify('SEC-02: Plaintext password hint & backdoor login',
  authTs.includes("userData.updatedPasswordHint && userData.updatedPasswordHint === password") &&
  authTs.includes('updateData.role = "admin"') &&
  authTs.includes("updatedPasswordHint: newPassword") &&
  resetModal.includes("resetPasswordDirect(identifier, newPassword)"),
  'Plaintext password hint backdoor verified'
);

// -------------------------------------------------------------
// SEC-03
// -------------------------------------------------------------
const firestoreRules = fs.readFileSync('firestore.rules', 'utf8');
verify('SEC-03: Privilege escalation in firestore.rules',
  firestoreRules.includes("get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'") &&
  firestoreRules.includes("allow create, update: if isOwner(userId) || isAdmin()"),
  'Users can self-update role to admin'
);

// -------------------------------------------------------------
// SEC-04
// -------------------------------------------------------------
verify('SEC-04: IDOR on messages in firestore.rules',
  firestoreRules.includes("match /messages/{messageId}") &&
  firestoreRules.includes("allow read, create: if isAuthenticated()"),
  'All authenticated users can read all messages'
);

// -------------------------------------------------------------
// SEC-05
// -------------------------------------------------------------
const storageRules = fs.readFileSync('storage.rules', 'utf8');
verify('SEC-05: Storage rules blanket wildcard write/delete',
  storageRules.includes("match /{allPaths=**}") &&
  storageRules.includes("allow read, write: if request.auth != null;"),
  'Universal write/delete for any authenticated user'
);

// -------------------------------------------------------------
// SEC-06
// -------------------------------------------------------------
const createAdmin = fs.readFileSync('scripts/createAdmin.js', 'utf8');
const seedAdmin = fs.readFileSync('scripts/seed-admin.mjs', 'utf8');
const testStorage = fs.readFileSync('scratch/testStorage.js', 'utf8');
verify('SEC-06: Production admin credentials committed',
  createAdmin.includes("RhockstarAdmin2026") &&
  seedAdmin.includes("RhockstarAdmin2026!") &&
  testStorage.includes("123456"),
  'Hardcoded credentials found in scripts and scratch'
);

// -------------------------------------------------------------
// SEC-07
// -------------------------------------------------------------
const notifyRoute = fs.readFileSync('src/app/api/notify/route.ts', 'utf8');
verify('SEC-07: Push notification injection without auth',
  notifyRoute.includes("export async function POST") &&
  notifyRoute.includes("adminMessaging.sendEachForMulticast") &&
  !notifyRoute.includes("verifyIdToken") &&
  notifyRoute.includes("User not found"),
  'POST /api/notify lacks auth check and leaks user existence'
);

// -------------------------------------------------------------
// SEC-08
// -------------------------------------------------------------
const empJobPage = fs.readFileSync('src/app/(dashboard)/employer/[jobId]/page.tsx', 'utf8');
verify('SEC-08: Employer ATS route lacks job ownership check',
  empJobPage.includes("const isEmployer =") &&
  empJobPage.includes("const isElite =") &&
  !empJobPage.includes("job.companyId === profile.uid"),
  'Any elite employer can access applicants of any job'
);

// -------------------------------------------------------------
// SEC-09
// -------------------------------------------------------------
const protectedRoute = fs.readFileSync('src/components/auth/ProtectedRoute.tsx', 'utf8');
verify('SEC-09: isBanned never enforced in route guard or auth',
  !protectedRoute.includes("isBanned") &&
  !authTs.includes("isBanned") &&
  !firestoreRules.includes("isBanned"),
  'Banned state never blocks user'
);

// -------------------------------------------------------------
// SEC-10
// -------------------------------------------------------------
const datingPage = fs.readFileSync('src/app/(dashboard)/dating/page.tsx', 'utf8');
verify('SEC-10: Dating swipe limits stored in localStorage',
  datingPage.includes("localStorage.setItem(`dating_swipes_${dateKey}`, newSwipes.toString())") &&
  datingPage.includes("swipesToday >= 5"),
  'Client-side localStorage bypassable'
);

// -------------------------------------------------------------
// PAY-01
// -------------------------------------------------------------
const premiumPage = fs.readFileSync('src/app/(dashboard)/premium/page.tsx', 'utf8');
verify('PAY-01: Client-side subscription update without server verification',
  premiumPage.includes("updateUserProfile(profile.uid, {") &&
  premiumPage.includes("subscriptionTier: tier") &&
  premiumPage.includes("onSuccess(tier)"),
  'No backend verification endpoint on upgrade'
);

// -------------------------------------------------------------
// PAY-02
// -------------------------------------------------------------
const adsPage = fs.readFileSync('src/app/(dashboard)/employer/ads/page.tsx', 'utf8');
const adsTs = fs.readFileSync('src/lib/services/ads.ts', 'utf8');
verify('PAY-02: Ad simulation button activates ads without payment',
  adsPage.includes("handleSimulatePayment") &&
  adsPage.includes("confirmAdPayment(ad.id)") &&
  adsTs.includes("status: 'active'"),
  'Ad payment simulation goes directly live'
);

// -------------------------------------------------------------
// PAY-03
// -------------------------------------------------------------
const envLocal = fs.readFileSync('.env.local', 'utf8');
verify('PAY-03: Missing Flutterwave key fallback to test key',
  premiumPage.includes("FLWPUBK_TEST-78ba9038855272bdb48441ac8989d5aa-X") &&
  !envLocal.includes("NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY"),
  'Hardcoded sandbox key fallback verified'
);

// -------------------------------------------------------------
// PAY-04
// -------------------------------------------------------------
const adminTs = fs.readFileSync('src/lib/services/admin.ts', 'utf8');
const referralsTs = fs.readFileSync('src/lib/services/referrals.ts', 'utf8');
verify('PAY-04: premiumUntil unenforced across auth flows',
  adminTs.includes("premiumUntil: expiryDate.toISOString()") &&
  referralsTs.includes("updateData.premiumUntil = baseDate.toISOString()") &&
  !protectedRoute.includes("premiumUntil") &&
  !authTs.includes("premiumUntil"),
  'Subscriptions never expire'
);

// -------------------------------------------------------------
// PAY-05
// -------------------------------------------------------------
const subAdminPage = fs.readFileSync('src/app/admin/(protected)/subscriptions/page.tsx', 'utf8');
verify('PAY-05: Pricing discrepancy between checkout and admin analytics',
  premiumPage.includes("const baseUSD = tier === 'pro' ? 2 : 5;") &&
  subAdminPage.includes("(proCount * 9.99) + (eliteCount * 19.99)"),
  'Checkout is $2/$5, admin models $9.99/$19.99'
);

// -------------------------------------------------------------
// DATA-01
// -------------------------------------------------------------
const missingInRules = [
  'jobs', 'job_applications', 'chats', 'connections', 
  'dating_interactions', 'matches', 'notifications', 'referrals', 'settings'
];
const missingAll = missingInRules.every(col => !firestoreRules.includes(`match /${col}/`));
verify('DATA-01: 11 Collections missing from firestore.rules',
  missingAll,
  'Core collections default to deny in production rules'
);

// -------------------------------------------------------------
// DATA-02
// -------------------------------------------------------------
const postsTs = fs.readFileSync('src/lib/services/posts.ts', 'utf8');
verify('DATA-02: Posts authorId mismatch & ad tracking permission denial',
  postsTs.includes("userId: user.uid") &&
  firestoreRules.includes("resource.data.authorId == request.auth.uid") &&
  adsTs.includes("trackAdImpression") &&
  firestoreRules.includes("resource.data.companyId == request.auth.uid"),
  'Posts and Ads updates rejected by Firestore rules'
);

// -------------------------------------------------------------
// DATA-03
// -------------------------------------------------------------
const usersTs = fs.readFileSync('src/lib/services/users.ts', 'utf8');
verify('DATA-03: Cascade profile updates downloads all posts and fails batch',
  usersTs.includes("const allPostsQuery = query(collection(db, 'posts'));") &&
  usersTs.includes("batch.update(postDoc.ref, { comments: newComments });") &&
  usersTs.includes("await batch.commit();"),
  'Catastrophic read + permission failure on foreign comments'
);

// -------------------------------------------------------------
// DATA-04
// -------------------------------------------------------------
verify('DATA-04: Read-modify-write race condition in comments',
  postsTs.includes("comments: [...currentComments, newComment]") &&
  postsTs.includes("const postSnap = await getDoc(postRef);"),
  'Comments array overwrite without transaction'
);

// -------------------------------------------------------------
// DATA-05
// -------------------------------------------------------------
const indexesJson = fs.readFileSync('firestore.indexes.json', 'utf8');
verify('DATA-05: Missing composite indexes for notifications and messages',
  !indexesJson.includes('"notifications"') &&
  !indexesJson.includes('"chats'),
  'Composite queries lack index definitions'
);

// -------------------------------------------------------------
// DATA-06
// -------------------------------------------------------------
verify('DATA-06: Referral registration rejected by isOwner rule',
  referralsTs.includes("const referrerRef = doc(db, 'users', referrerId);") &&
  referralsTs.includes("await updateDoc(referrerRef, {") &&
  authTs.includes("recordReferral(referralCode, user.uid, fullName)"),
  'Updating referrer document directly fails under isOwner rule'
);

// -------------------------------------------------------------
// DATA-07
// -------------------------------------------------------------
verify('DATA-07: Unauthenticated username login fails on users collection read',
  authTs.includes('if (!inputClean.includes("@")) {') &&
  authTs.includes('const snapshot = await getDocs(q);') &&
  firestoreRules.includes("match /users/{userId} {\n      allow read: if isAuthenticated();"),
  'Reading users unauthenticated triggers PERMISSION_DENIED'
);

// -------------------------------------------------------------
// DATA-08
// -------------------------------------------------------------
const notifTs = fs.readFileSync('src/lib/services/notifications.ts', 'utf8');
const messagingTs = fs.readFileSync('src/lib/messaging.ts', 'utf8');
const envTs = fs.readFileSync('src/lib/env.ts', 'utf8');
verify('DATA-08: Inconsistent env vars and dead validateEnv code',
  notifTs.includes("process.env.NEXT_PUBLIC_VAPID_KEY") &&
  messagingTs.includes("process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY") &&
  envTs.includes("export function validateEnv()"),
  'Env variable naming mismatch and dead validation function'
);

// -------------------------------------------------------------
// DATA-09
// -------------------------------------------------------------
verify('DATA-09: Registration document omits role, stardomXP, subscriptionTier',
  authTs.includes('stats: { posts: 0, followers: 0, following: 0, connections: 0 },') &&
  !authTs.includes('stardomXP: 0') &&
  !authTs.includes('subscriptionTier: "free"'),
  'Omitted fields cause exclusion in Firestore orderBy queries'
);

// -------------------------------------------------------------
// DATA-10
// -------------------------------------------------------------
const adminUsersPage = fs.readFileSync('src/app/admin/(protected)/users/page.tsx', 'utf8');
verify('DATA-10: deleteUserAdmin deletes Firestore doc only, leaving Auth account',
  adminTs.includes("await deleteDoc(userRef);") &&
  !adminTs.includes("deleteUser(") &&
  adminUsersPage.includes("deleteUserAdmin(user.uid)"),
  'Orphaned Firebase Auth record remains after admin deletion'
);

// -------------------------------------------------------------
// ATS-01
// -------------------------------------------------------------
const appTracker = fs.readFileSync('src/components/jobs/ApplicationTracker.tsx', 'utf8');
const jobsPage = fs.readFileSync('src/app/(dashboard)/jobs/page.tsx', 'utf8');
verify('ATS-01: Fake modulo statuses and ephemeral applied jobs',
  appTracker.includes("statuses[index % statuses.length]") &&
  jobsPage.includes("const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());"),
  'Application statuses are random modulo math'
);

// -------------------------------------------------------------
// ATS-02
// -------------------------------------------------------------
const companyAts = fs.readFileSync('src/app/(dashboard)/company/[username]/ats/page.tsx', 'utf8');
verify('ATS-02: Company ATS uses hardcoded mock candidates',
  companyAts.includes("const MOCK_CANDIDATES: Candidate[] = [") &&
  companyAts.includes("Alex Chen") &&
  !companyAts.includes("updateApplicationStatus"),
  'Kanban board is pure mock visual state'
);

// -------------------------------------------------------------
// ATS-03
// -------------------------------------------------------------
const jobsTs = fs.readFileSync('src/lib/services/jobs.ts', 'utf8');
const settingsPage = fs.readFileSync('src/app/(dashboard)/settings/page.tsx', 'utf8');
verify('ATS-03: Silent candidate status transitions',
  jobsTs.includes("updateApplicationStatus = async") &&
  !jobsTs.includes("createNotification") &&
  settingsPage.includes("Job Applications & Recruiter Updates"),
  'No notifications sent when employer updates candidate status'
);

// -------------------------------------------------------------
// ATS-04
// -------------------------------------------------------------
verify('ATS-04: Tier 3 referral reward (+20 applications) ignored in apply check',
  referralsTs.includes("updateData.extraJobApps = increment(tier.extraJobs || 20)") &&
  jobsPage.includes("if (isFree && (appliedJobIds.size >= 2 || isFeatured))"),
  'handleApply ignores profile.extraJobApps'
);

// -------------------------------------------------------------
// ATS-05
// -------------------------------------------------------------
const postJobPage = fs.readFileSync('src/app/(dashboard)/jobs/post/page.tsx', 'utf8');
verify('ATS-05: becomeEmployer does not write accountType to Firestore',
  /export const becomeEmployer = async\s*\(uid:\s*string\)\s*=>\s*\{[\s\S]*?return updateUserProfile\(uid,\s*\{\s*role:\s*'employer'\s*\}\);[\s\S]*?\};/.test(usersTs) &&
  !/becomeEmployer[\s\S]*?accountType:\s*'employer'/.test(usersTs) &&
  postJobPage.includes("setProfile({ ...profile, role: 'employer', accountType: 'employer' }"),
  'accountType not persisted to database'
);

// -------------------------------------------------------------
// ATS-06
// -------------------------------------------------------------
verify('ATS-06: Job card view details only triggers toast',
  jobsPage.includes("toast.success(`Viewing details for ${job.title}`)") &&
  jobsPage.includes('<ExternalLink className="w-4 h-4" />'),
  'Dead UI button only shows toast'
);

console.log('\n================================================================');
console.log(`VERIFICATION SUMMARY: Total: ${totalTests}, Passed: ${passedTests}, Failed: ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

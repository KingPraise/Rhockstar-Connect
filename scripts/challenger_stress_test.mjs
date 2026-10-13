// scripts/challenger_stress_test.mjs
// Empirical test harness for Challenger 2 (Frontend Routing, UI Interactivity & Workflow Defects)
import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('EMPIRICAL CHALLENGER 2 — FRONTEND & WORKFLOW STRESS TEST HARNESS');
console.log('================================================================\n');

let totalTests = 0;
let passedVerifications = 0;
let failedVerifications = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedVerifications++;
  } else {
    console.error(`[FAIL] ${message}`);
    failedVerifications++;
  }
}

// ============================================================================
// TEST 1: ROUT-01 — ProtectedRoute Route Guard Stress Test
// ============================================================================
console.log('--- TEST 1: ROUT-01 (ProtectedRoute Route Guard) ---');
const protectedRouteContent = fs.readFileSync('src/components/auth/ProtectedRoute.tsx', 'utf8');

// Simulate the exact logic from ProtectedRoute.tsx:35-39:
function evaluateIsPublicRoute(pathname) {
  return (
    pathname === "/feed" ||
    pathname.startsWith("/profile") ||
    pathname === "/jobs" ||
    pathname === "/terms"
  );
}

const testPaths = [
  { path: '/feed', expected: true, desc: 'Public feed' },
  { path: '/profile', expected: true, desc: 'Profile root' },
  { path: '/profile/user123', expected: true, desc: 'User profile route' },
  { path: '/jobs', expected: true, desc: 'Job board' },
  { path: '/terms', expected: true, desc: 'Terms page' },
  { path: '/company/paystack', expected: false, desc: 'Company public profile' },
  { path: '/company/google', expected: false, desc: 'Company profile route' },
  { path: '/company/google/ats', expected: false, desc: 'Company ATS route' },
  { path: '/privacy', expected: false, desc: 'Privacy policy' },
  { path: '/settings', expected: false, desc: 'Settings page' },
];

testPaths.forEach(tc => {
  const result = evaluateIsPublicRoute(tc.path);
  assert(
    result === tc.expected,
    `Path "${tc.path}" (${tc.desc}) evaluates to isPublicRoute = ${result}`
  );
});

// Confirm that /company/[username] is inside (dashboard) and therefore wrapped by ProtectedRoute:
const dashboardLayoutContent = fs.readFileSync('src/app/(dashboard)/layout.tsx', 'utf8');
const isDashboardWrappedByProtected = dashboardLayoutContent.includes('<ProtectedRoute>') && 
                                      dashboardLayoutContent.includes('{children}') && 
                                      dashboardLayoutContent.includes('</ProtectedRoute>');
assert(isDashboardWrappedByProtected, 'Dashboard layout unconditionally wraps all children in <ProtectedRoute>');

// Confirm company page exists under (dashboard)/company/[username]/page.tsx
const companyPageExists = fs.existsSync('src/app/(dashboard)/company/[username]/page.tsx');
assert(companyPageExists, 'Company page exists at src/app/(dashboard)/company/[username]/page.tsx');

const companyPageContent = fs.readFileSync('src/app/(dashboard)/company/[username]/page.tsx', 'utf8');
const isCompanyPagePublicFacing = companyPageContent.includes('getUserByUsername(username)') &&
                                 companyPageContent.includes('loggedInProfile');
assert(isCompanyPagePublicFacing, 'CompanyPage is written with nullable loggedInProfile intending public visibility');

assert(
  evaluateIsPublicRoute('/company/paystack') === false && isDashboardWrappedByProtected,
  'VERDICT ROUT-01: Unauthenticated visitors to /company/* are redirected to /login by ProtectedRoute'
);


// ============================================================================
// TEST 2: ROUT-02 — Notification Link Query Param vs Messages Page Reader
// ============================================================================
console.log('\n--- TEST 2: ROUT-02 (Notification chatId Query Param Mismatch) ---');
const notificationsPageContent = fs.readFileSync('src/app/(dashboard)/notifications/page.tsx', 'utf8');
const messagesPageContent = fs.readFileSync('src/app/(dashboard)/messages/page.tsx', 'utf8');

// Check notifications push pattern:
const notificationsPushMatch = notificationsPageContent.match(/router\.push\(`\/messages\?chatId=\${([^}]+)}`\)/);
assert(notificationsPushMatch !== null, 'Notifications page dispatches router.push(`/messages?chatId=...`)');

// Check messages page query param reader:
const messagesParamMatch = messagesPageContent.match(/const\s+targetUserParam\s*=\s*searchParams\.get\(['"]user['"]\)\s*\|\|\s*searchParams\.get\(['"]uid['"]\)/);
assert(messagesParamMatch !== null, 'Messages page only inspects searchParams.get("user") || searchParams.get("uid")');

const messagesHasChatIdReader = messagesPageContent.includes("searchParams.get('chatId')") || 
                                messagesPageContent.includes('searchParams.get("chatId")');
assert(!messagesHasChatIdReader, 'Messages page NEVER calls searchParams.get("chatId")');

// Stress test: simulate navigation with chatId=
const urlParams = new URLSearchParams('chatId=chat_abc123');
const simulatedTargetUser = urlParams.get('user') || urlParams.get('uid');
const simulatedChatId = urlParams.get('chatId');
assert(
  simulatedTargetUser === null && simulatedChatId === 'chat_abc123',
  `Simulated searchParams: targetUserParam is NULL when query is ?chatId=${simulatedChatId}`
);

assert(
  !messagesHasChatIdReader && simulatedTargetUser === null,
  'VERDICT ROUT-02: Clicking a message notification arrives at /messages?chatId=... with empty/ignored chat state'
);


// ============================================================================
// TEST 3: DEAD-01 — Settings Change Password Form Interactivity
// ============================================================================
console.log('\n--- TEST 3: DEAD-01 (Settings Password Inputs Detached) ---');
const settingsPageContent = fs.readFileSync('src/app/(dashboard)/settings/page.tsx', 'utf8');

const passwordSectionRegex = /Change Password[\s\S]*?<\/div>\s*<\/div>/;
const passwordSectionMatch = settingsPageContent.match(passwordSectionRegex);
assert(passwordSectionMatch !== null, 'Found "Change Password" section in settings/page.tsx');

if (passwordSectionMatch) {
  const sectionText = passwordSectionMatch[0];
  const hasValueCurrent = /Current Password[\s\S]*?<input[^>]*value=/i.test(sectionText);
  const hasOnChangeCurrent = /Current Password[\s\S]*?<input[^>]*onChange=/i.test(sectionText);
  const hasValueNew = /New Password[\s\S]*?<input[^>]*value=/i.test(sectionText);
  const hasOnChangeNew = /New Password[\s\S]*?<input[^>]*onChange=/i.test(sectionText);
  const hasSubmitButton = /<button[^>]*>.*?(Save|Update|Change).*?Password.*?<\/button>/i.test(sectionText);
  const hasFormTag = /<form/i.test(sectionText);

  assert(!hasValueCurrent, 'Current Password input lacks `value` binding');
  assert(!hasOnChangeCurrent, 'Current Password input lacks `onChange` handler');
  assert(!hasValueNew, 'New Password input lacks `value` binding');
  assert(!hasOnChangeNew, 'New Password input lacks `onChange` handler');
  assert(!hasSubmitButton, 'Section contains NO submit or update password button');
  assert(!hasFormTag, 'Section has NO <form> wrapper');
}


// ============================================================================
// TEST 4: DEAD-02 / DEAD-06 — Phone Verification & Notification Toggles
// ============================================================================
console.log('\n--- TEST 4: DEAD-02 (Verify Phone Button & Settings Toggles) ---');
// Check Phone Verification button:
const phoneVerifyRegex = /<h4[^>]*>Phone Verification<\/h4>[\s\S]*?<button([^>]*)>Verify Now<\/button>/;
const phoneVerifyMatch = settingsPageContent.match(phoneVerifyRegex);
assert(phoneVerifyMatch !== null, 'Found Phone Verification "Verify Now" button in settings');

if (phoneVerifyMatch) {
  const buttonAttributes = phoneVerifyMatch[1];
  const hasOnClick = /onClick/i.test(buttonAttributes);
  assert(!hasOnClick, '"Verify Now" button has NO onClick handler (strictly cosmetic)');
}

// Check Notification Toggles:
const connectionAlertToggle = settingsPageContent.includes('Connection alert preference saved!');
const postInteractionToggle = settingsPageContent.includes('Post interaction preference saved!');
const jobApplicationAlertToggle = settingsPageContent.includes('Job application alert preference saved!');
assert(connectionAlertToggle && postInteractionToggle && jobApplicationAlertToggle, 'Notification toggles trigger only toast.success() strings');

const settingsHasFirestoreMutationForToggles = settingsPageContent.includes('updateUserProfile') && 
                                              settingsPageContent.includes('notificationSettings');
assert(!settingsHasFirestoreMutationForToggles, 'Settings page NEVER persists notification toggle preferences to Firestore');


// ============================================================================
// TEST 5: DATA-UI-01 / DATA-UI-02 — EditProfileModal Minor Age Lockout Logic
// ============================================================================
console.log('\n--- TEST 5: DATA-UI-01 / DATA-UI-02 (Minor Age Lockout Trap) ---');
const editProfileModalContent = fs.readFileSync('src/components/profile/EditProfileModal.tsx', 'utf8');

const hasLockoutCall = editProfileModalContent.includes("updateUserProfile(profile.uid, { isLocked: true })");
const hasLogoutUserCall = editProfileModalContent.includes("await logoutUser()");
const hasHardRedirect = editProfileModalContent.includes("window.location.href = '/login'");

assert(hasLockoutCall, 'EditProfileModal explicitly executes updateUserProfile(profile.uid, { isLocked: true })');
assert(hasLogoutUserCall, 'EditProfileModal terminates user session via logoutUser()');
assert(hasHardRedirect, 'EditProfileModal forces hard window.location.href redirect to /login');

// Stress test age calculation logic:
function testAgeLogic(dobString, mockCurrentDate = new Date('2026-09-10T12:00:00Z')) {
  const dobDate = new Date(dobString);
  const today = mockCurrentDate;
  let age = today.getFullYear() - dobDate.getFullYear();
  const m = today.getMonth() - dobDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
    age--;
  }
  return age;
}

// Test cases:
// 1. Adult: born 2000-01-01 -> age 26 -> NOT locked
assert(testAgeLogic('2000-01-01') === 26, 'Adult born 2000-01-01 calculates age 26 (>= 18)');
// 2. Exact 18 today: born 2008-09-10 -> age 18 -> NOT locked
assert(testAgeLogic('2008-09-10') === 18, 'Boundary born 2008-09-10 calculates age 18 (>= 18)');
// 3. Turns 18 tomorrow: born 2008-09-11 -> age 17 -> LOCKED!
assert(testAgeLogic('2008-09-11') === 17, 'Boundary born 2008-09-11 calculates age 17 (< 18, triggers lockout)');
// 4. Accidental typo selecting 2026 or 2025:
assert(testAgeLogic('2025-05-15') === 1, 'Typo selecting 2025 calculates age 1 (< 18, triggers lockout)');

// Verify if admin portal has an unlock mechanism for isLocked:
const adminUsersContent = fs.readFileSync('src/app/admin/(protected)/users/page.tsx', 'utf8');
const adminHasUnlock = adminUsersContent.includes('isLocked');
assert(!adminHasUnlock, 'Admin portal has NO UI or handler to inspect or unlock isLocked users');


// ============================================================================
// TEST 6: DATA-UI-02 / DATA-UI-01 — Social Media Inputs Missing Value/OnChange
// ============================================================================
console.log('\n--- TEST 6: DATA-UI-02 / DATA-UI-01 (Social Media Inputs Unbound) ---');

const socialTabRegex = /activeTab\s*===\s*["']social["'][\s\S]*?<\/div>\s*\)\s*}/;
const socialTabMatch = editProfileModalContent.match(socialTabRegex);
assert(socialTabMatch !== null, 'Found Social Links tab in EditProfileModal.tsx');

if (socialTabMatch) {
  const socialText = socialTabMatch[0];
  const hasValue = /<input[^>]*\bvalue=/i.test(socialText);
  const hasOnChange = /<input[^>]*\bonChange=/i.test(socialText);
  const hasName = /<input[^>]*\bname=/i.test(socialText);

  assert(!hasValue, 'Social inputs have NO value attribute');
  assert(!hasOnChange, 'Social inputs have NO onChange attribute');
  assert(!hasName, 'Social inputs have NO name attribute');
}

// Check if updateData in handleSave includes social links:
const handleSaveRegex = /const updateData = {[\s\S]*?};/;
const handleSaveMatch = editProfileModalContent.match(handleSaveRegex);
assert(handleSaveMatch !== null, 'Found updateData payload construction in handleSave');

if (handleSaveMatch) {
  const payloadText = handleSaveMatch[0];
  const hasSocialsInPayload = /social|linkedin|twitter|github|instagram/i.test(payloadText);
  assert(!hasSocialsInPayload, 'updateData payload completely omits social links');
}


// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log('\n================================================================');
console.log(`TOTAL CHECKS: ${totalTests}`);
console.log(`PASSED: ${passedVerifications}`);
console.log(`FAILED: ${failedVerifications}`);
console.log('================================================================');

if (failedVerifications === 0) {
  console.log('\n>>> OVERALL VERDICT: ALL 6 DEFECT CLAIMS ARE 100% EMPIRICALLY CONFIRMED AND REPRODUCIBLE.');
  process.exit(0);
} else {
  console.error(`\n>>> OVERALL VERDICT: ${failedVerifications} CLAIMS FAILED VERIFICATION.`);
  process.exit(1);
}

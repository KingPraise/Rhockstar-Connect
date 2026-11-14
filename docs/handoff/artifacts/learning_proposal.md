# Learning Proposal: Mandatory Bug Reproduction & Proof-First Triage

## 1. Context & Analysis
- **User Correction / Insight**: Whenever a bug or issue is reported, the agent must *always* reproduce the issue and isolate the root cause before attempting code fixes. Blindly changing code without reproduction leads to regressions or misdiagnoses.
- **Classification**: **Rule Update** (Universal behavioral guardrail).
- **Target File**: [`c:\Users\PraiseTaiwo\Documents\Rhockstar-Connect\AGENTS.md`](file:///c:/Users/PraiseTaiwo/Documents/Rhockstar-Connect/AGENTS.md) under `<!-- BEGIN:bug-triage-rules -->`.

---

## 2. Proposed Changes
We propose enhancing the existing `User Bug Triage & Verification Protocol` in `AGENTS.md` with explicit, enforceable mandates:

1. **Mandatory Reproduction Gate**: Forbid editing application files until an empirical test (e.g., node script, API probe, or deterministic code-path trace) demonstrates the exact failure point.
2. **Empirical Evidence Requirement**: Always log or document the reproduction output (such as the HTTP 500 status code, stack trace, or state mismatch) before writing the fix.
3. **Identical Reproduction Re-verification**: After applying the fix, execute the *exact same* reproduction test to prove that the failure is resolved (e.g., confirming HTTP 200 or clean payload).
4. **Holistic Integrity Gate**: Run all automated health probes (`npm run test:auth`), type checks (`npx tsc --noEmit`), and production build verification (`npm run build`) before pushing or concluding.

---

## 3. Exact Diff

```diff
 <!-- BEGIN:bug-triage-rules -->
-# User Bug Triage & Verification Protocol
+# User Bug Triage & Verification Protocol (Proof-First Rule)
 
-When the user reports an issue or bug experienced by a user on Rhockstar Connect:
+When the user reports an issue, failure, or bug on Rhockstar Connect:
 
-1. **Verify & Replicate First**:
-   - Never assume or blindly change code without validating the report.
+1. **Reproduce & Isolate Before Modifying Code (Non-Negotiable)**:
+   - NEVER make speculative code edits without first proving the bug exists.
    - Trace the exact user journey, data requirements, and conditions described.
-   - Test if the bug can be reproduced locally or logically deduced from the code/state.
+   - Create or run an empirical reproduction probe (e.g. targeted node test script, API curl, or isolated unit check) to trigger the exact failure mode.
+   - Document the failure evidence (e.g., HTTP 500, unhandled exception, bad payload, or UI mismatch).
 
 2. **If the Bug is Confirmed (True)**:
    - Identify the exact failure point (client state, service call, Firestore security rule, or API endpoint).
    - Implement the targeted fix.
-   - Verify the fix against the reproduction steps.
+   - Re-run the exact reproduction probe from step 1 to prove that the bug is resolved (e.g., HTTP 200 or expected state returned).
 
 3. **If Unable to Replicate (False / Works as Expected)**:
    - Do NOT simply dismiss the issue or say "it works on my end".
    - Investigate *why* that specific user encountered the issue:
      - Account state differences (e.g., guest vs. logged in, missing profile fields, specific subscription tier, account type like employer vs. regular user).
      - Permission/role barriers (e.g., admin vs. user, connection status, blocked status).
      - Network/device/environment edge cases (e.g., offline mode, mobile viewport, service worker caching, Safari vs. Chromium).
      - UI state or race conditions (e.g., unhandled loading/error states, empty states masquerading as bugs).
    - Clarify the root cause and provide actionable guidance or defensive safeguards.
+
+4. **Mandatory Post-Fix Regression Guard**:
+   - Always execute type checking (`npx tsc --noEmit`).
+   - Execute the auth integrity suite if auth/user/rules were touched (`npm run test:auth`).
+   - Run a clean production build (`npm run build`) and confirm exit code 0 before finalizing.
 <!-- END:bug-triage-rules -->
```

---

## 4. Status
✅ **Applied and Pushed to `origin main` (`bb1e4ba`)**.
The proof-first bug reproduction protocol and post-fix regression guards are now permanently codified in [`AGENTS.md`](file:///c:/Users/PraiseTaiwo/Documents/Rhockstar-Connect/AGENTS.md).

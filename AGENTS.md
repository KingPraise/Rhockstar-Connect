<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:deployment-rules -->
# Pre-Deployment Validation

Always run a full local build (e.g., `npm run build`) and ensure it completes successfully before running any `git push` commands. Never push code to the repository without local build verification to prevent breaking production deployments.
<!-- END:deployment-rules -->

<!-- BEGIN:bug-triage-rules -->
# User Bug Triage & Verification Protocol

When the user reports an issue or bug experienced by a user on Rhockstar Connect:

1. **Verify & Replicate First**:
   - Never assume or blindly change code without validating the report.
   - Trace the exact user journey, data requirements, and conditions described.
   - Test if the bug can be reproduced locally or logically deduced from the code/state.

2. **If the Bug is Confirmed (True)**:
   - Identify the exact failure point (client state, service call, Firestore security rule, or API endpoint).
   - Implement the targeted fix.
   - Verify the fix against the reproduction steps.

3. **If Unable to Replicate (False / Works as Expected)**:
   - Do NOT simply dismiss the issue or say "it works on my end".
   - Investigate *why* that specific user encountered the issue:
     - Account state differences (e.g., guest vs. logged in, missing profile fields, specific subscription tier, account type like employer vs. regular user).
     - Permission/role barriers (e.g., admin vs. user, connection status, blocked status).
     - Network/device/environment edge cases (e.g., offline mode, mobile viewport, service worker caching, Safari vs. Chromium).
     - UI state or race conditions (e.g., unhandled loading/error states, empty states masquerading as bugs).
   - Clarify the root cause and provide actionable guidance or defensive safeguards.
<!-- END:bug-triage-rules -->

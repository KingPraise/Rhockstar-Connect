# Dispatch Instructions — Worker (QA Report Synthesizer)

## 2026-09-10T12:16:45Z

You are the Worker (`teamwork_preview_worker`).
- Working directory: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_worker_qa_report`
- Original request file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`
- Project file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\PROJECT.md`
- Parent orchestrator ID: 796cc52e-c00d-4e4b-aa5b-ffc38c92dd62

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Mission
Synthesize all survey findings into the comprehensive, definitive Consolidated QA Audit Report for Rhockstar Connect.

### Inputs to Review:
1. `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`
2. `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_explorer_survey_1\findings.md` & `handoff.md` (Frontend & UI defects)
3. `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_explorer_survey_2\findings.md` & `handoff.md` (Backend, API, Database & Security defects)
4. `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_explorer_survey_3\findings.md` & `handoff.md` (Workflow, Business Logic & Integration defects)

### Requirements for the Consolidated QA Report:
1. **Executive Summary**:
   - Total issue count, severity distribution (Critical, High, Medium, Low), category distribution (Security, Backend/API, Data Integrity, Frontend/UI, Workflow/Business Logic, Missing Features).
   - High-level platform health assessment.
2. **Issue Catalog**:
   - Every identified issue must be uniquely identified (e.g. SEC-01, API-01, UI-01, WORKFLOW-01).
   - For EVERY issue, include:
     - Issue Title
     - Severity (Critical / High / Medium / Low)
     - Component / Subsystem
     - Exact File Path and Line Number(s) (or exact reproducible user action)
     - User Flow / Scenario
     - Suspected Root Cause
     - Evidence Code Snippet from the actual file
     - Concrete Recommended Fix
3. **Deduplication & Cross-Referencing**:
   - Synthesize and merge overlapping findings (e.g., `/api/clear-connections`, Firestore rules omissions, admin privilege escalation, mock ATS data) into single rich entries with full context from all explorers.
4. **Outputs**:
   - Save the master report to `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_worker_qa_report\QA_REPORT.md`.
   - Also save a copy at `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\QA_REPORT.md`.
   - Write your `handoff.md` and update `progress.md`.
   - Notify the parent orchestrator (Recipient: `796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`).

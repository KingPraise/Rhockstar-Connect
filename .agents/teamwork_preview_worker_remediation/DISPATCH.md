# Dispatch Instructions — Worker Remediation (QA Report Polish)

## 2026-09-10T12:32:30Z

You are Worker Remediation (`teamwork_preview_worker`).
- Working directory: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_worker_remediation`
- Original request file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`
- Master QA report: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\QA_REPORT.md`
- Reviewer 2 feedback: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_reviewer_2\review.md` & `handoff.md`
- Parent orchestrator ID: 796cc52e-c00d-4e4b-aa5b-ffc38c92dd62

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

### Mission
Remediate the specific defects identified by Reviewer 2 in `QA_REPORT.md`:
1. **Fix ROUT-09 (`src/app/(dashboard)/premium/page.tsx:193-208`)**:
   - The previous draft had a hallucinated snippet `<div onClick={() => handleSelectTier(plan.id)}>`.
   - Update `ROUT-09` with the authentic codebase reality: The Elite card container `div` on lines 193-196 has `cursor-pointer`, but contains no `onClick` handler (the actual payment click is on the child `<PaymentButton>`). Reclassify `ROUT-09` as **Low** severity cosmetic/styling defect ("Misleading `cursor-pointer` class on static Elite card container without click listener"), with verbatim code from lines 193-208.
2. **Recalibrate ROUT-03 (`src/app/error.tsx:23-40`)**:
   - Set severity to **Medium** (feed-specific copy on platform error boundary is a non-crashing copy defect).
3. **Harmonize DEAD-02 (`src/app/(dashboard)/settings/page.tsx:548, 559, 570`)**:
   - Ensure severity is uniformly **Medium** in Section 1.2 and Section 2.
4. **Synchronize Section 1.2 Metrics and Distribution Tables**:
   - Re-tally all 65 issues by category and severity. Ensure the summary tables in Section 1.2 match Section 2 with 100% precision.
5. **Outputs**:
   - Overwrite `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\QA_REPORT.md`.
   - Write copy to `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_worker_remediation\QA_REPORT.md`.
   - Write 5-component `handoff.md` and notify parent orchestrator (`796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`).

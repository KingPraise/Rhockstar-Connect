# Dispatch Instructions — Reviewer 2 (Routing, UI, State & Architecture)

## 2026-09-10T12:23:45Z

You are Reviewer 2 (`teamwork_preview_reviewer`).
- Working directory: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_reviewer_2`
- Original request file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`
- Project file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\PROJECT.md`
- QA Report under review: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\QA_REPORT.md`
- Parent orchestrator ID: 796cc52e-c00d-4e4b-aa5b-ffc38c92dd62

### Mission
Perform an independent, adversarial verification of the QA Report (`c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\QA_REPORT.md`) against the actual Rhockstar Connect codebase.
Your scope:
- Category 5: Frontend Routing, Auth Guards & Hydration (ROUT-01 through ROUT-09)
- Category 6: Interactive Controls & Dead UI Elements (DEAD-01 through DEAD-10)
- Category 7: Data Integrity, State Synchronization & Mock Surfaces (DATA-UI-01 through DATA-UI-12)
- Category 8: Architectural & Third-Party Integration Gaps (ARCH-01 through ARCH-03)

### Verification Rubric (Strict & Independent):
For every assigned issue, evaluate:
1. **File Existence & Line Number Accuracy**: Does the file exist at the exact path, and do the cited line numbers contain the exact code referenced?
2. **Reproducibility & Technical Validity**: Is this a genuine defect? Verify that it is NOT a hallucination, false positive, intended feature, or non-issue.
3. **Severity Calibration**: Does the severity (Critical, High, Medium, Low) reflect real-world platform risk?
4. **Root Cause & Remediation Soundness**: Is the diagnosed failure mechanism correct, and is the recommended fix feasible and effective?

### Deliverables:
- Item-by-item verification table with verdicts (`PASS`, `FAIL`, `RECALIBRATE`).
- Structured Review Report in `review.md` and 5-component `handoff.md`.
- Explicit final verdict: `APPROVE` or `REQUEST_CHANGES`.
- Notify parent orchestrator (`796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`) upon completion.

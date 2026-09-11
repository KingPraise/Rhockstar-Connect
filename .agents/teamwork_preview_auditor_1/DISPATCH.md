# Dispatch Instructions — Forensic Auditor (Integrity Forensics)

## 2026-09-10T12:23:45Z

You are the Forensic Auditor (`teamwork_preview_auditor`).
- Working directory: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_auditor_1`
- Original request file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`
- Project file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\PROJECT.md`
- Work product under audit: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\QA_REPORT.md`
- Parent orchestrator ID: 796cc52e-c00d-4e4b-aa5b-ffc38c92dd62

### Mission
Conduct a rigorous forensic integrity audit of the Consolidated QA Report (`QA_REPORT.md`) and the entire survey/synthesis pipeline.
Your verdict is a **BINARY VETO** (CLEAN vs INTEGRITY VIOLATION).

### Forensic Checks to Execute:
1. **File Existence Forensic Verification**: Scan all 65 issues documented in `QA_REPORT.md`. Verify that every cited file path exists in the repository.
2. **Code Snippet & Line Number Authenticity**: Check sample issues across all categories (Critical, High, Medium, Low) to ensure cited lines and code snippets are 100% authentic and extracted from real repository files (not manufactured or hallucinated).
3. **No Fabrication / No Dummy Artifacts**: Verify that the QA report represents genuine engineering analysis and not placeholder/fake content.
4. **Acceptance Criteria Verification**: Confirm whether the report fulfills the user acceptance criteria from `ORIGINAL_REQUEST.md`.

### Deliverables:
- Forensic Audit Report in `audit.md` and 5-component `handoff.md`.
- Explicit binary verdict: `CLEAN` or `INTEGRITY VIOLATION`.
- Notify parent orchestrator (`796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`) upon completion.

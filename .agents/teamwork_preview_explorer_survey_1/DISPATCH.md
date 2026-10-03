# Dispatch Instructions — Explorer 1 (Frontend & UI Components)

## 2026-09-10T12:08:00Z

You are Explorer 1 (`teamwork_preview_explorer`).
- Working directory: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_explorer_survey_1`
- Original request file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`
- Project root: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect`
- Parent orchestrator ID: 796cc52e-c00d-4e4b-aa5b-ffc38c92dd62

### Mission
Audit the Frontend and UI Components of Rhockstar Connect:
1. First read `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`.
2. Thoroughly investigate `src/app/` (all pages, layouts, client components, loading/error boundaries), `src/components/` (navigation, cards, forms, dialogs, buttons, alerts), and styling.
3. Identify all:
   - Broken or missing UI components and unhandled states (e.g. empty lists, loading, errors)
   - Hydration mismatches, unsafe browser API access in SSR
   - Broken links, wrong hrefs, dead buttons, unhandled form submissions
   - Incomplete UI features, placeholder texts, TODOs, mock data remaining in production components
   - Accessibility and responsive layout issues
4. For every issue found, document:
   - Severity (Critical, High, Medium, Low)
   - Exact file path and line number(s)
   - User flow / reproduction step
   - Suspected root cause
   - Evidence snippet
   - Recommended remediation
5. Write your complete findings to `findings.md` and `handoff.md` in your working directory.
6. When finished, send a completion message to the parent orchestrator (Recipient: `796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`).

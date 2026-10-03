# Dispatch Instructions — Explorer 2 (Backend, APIs, Database & Auth)

## 2026-09-10T12:08:00Z

You are Explorer 2 (`teamwork_preview_explorer`).
- Working directory: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_explorer_survey_2`
- Original request file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`
- Project root: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect`
- Parent orchestrator ID: 796cc52e-c00d-4e4b-aa5b-ffc38c92dd62

### Mission
Audit the Backend APIs, Firebase Database, Authentication & Security of Rhockstar Connect:
1. First read `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`.
2. Thoroughly investigate `src/app/api/` (all API routes), `src/lib/` (firebase initialization, auth helpers, db queries, utility functions), `firestore.rules`, `storage.rules`, and env usage.
3. Identify all:
   - Security vulnerabilities: unauthorized access, missing auth checks, insecure Firestore/Storage rules, exposed secrets
   - API error handling bugs: unhandled promise rejections, missing try/catch, unvalidated request payloads (Zod/types), malformed responses, wrong HTTP status codes
   - Database integrity & query bugs: race conditions, missing index requirements, unbounded queries, missing cascading deletes or orphaned records
   - Incomplete API endpoints, stubs, TODOs, mock data remaining in backend
4. For every issue found, document:
   - Severity (Critical, High, Medium, Low)
   - Exact file path and line number(s)
   - Endpoint / function / rule involved
   - Suspected root cause
   - Evidence snippet
   - Recommended remediation
5. Write your complete findings to `findings.md` and `handoff.md` in your working directory.
6. When finished, send a completion message to the parent orchestrator (Recipient: `796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`).

# Dispatch Instructions — Explorer 3 (Workflows, Business Logic & Integrations)

## 2026-09-10T12:08:00Z

You are Explorer 3 (`teamwork_preview_explorer`).
- Working directory: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\teamwork_preview_explorer_survey_3`
- Original request file: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`
- Project root: `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect`
- Parent orchestrator ID: 796cc52e-c00d-4e4b-aa5b-ffc38c92dd62

### Mission
Audit the Business Logic, End-to-End Workflows, and Third-Party Integrations of Rhockstar Connect:
1. First read `c:\Users\DELL\Documents\GitHub\Rhockstar-Connect\.agents\ORIGINAL_REQUEST.md`.
2. Thoroughly investigate the end-to-end business workflows across the platform:
   - Booking & Appointment lifecycle (creation, confirmation, rescheduling, cancellation, completion)
   - Payment & Transaction workflows (Paystack integration, payment verification, refunds, receipts, platform fees)
   - Messaging & Real-Time Chat (conversation creation, unread counts, realtime Firestore listeners, file/image attachments)
   - User Profiles & Roles (client vs artisan/provider vs admin onboarding, verification, profile updates, reviews & ratings)
   - Notifications & Email alerts (booking reminders, system alerts, push/email triggers)
3. Identify all:
   - Broken workflow states or dead-end paths (e.g. user cannot transition a booking or complete a payment)
   - Edge cases in state machines (e.g. concurrent bookings, cancelled payments treated as successful, negative amounts)
   - Integration bugs with external services (Paystack webhook verification, signature checking, environment config)
   - Incomplete business features, unhooked buttons or fake handlers
4. For every issue found, document:
   - Severity (Critical, High, Medium, Low)
   - Exact file path and line number(s)
   - Specific user flow / scenario
   - Suspected root cause
   - Evidence snippet
   - Recommended remediation
5. Write your complete findings to `findings.md` and `handoff.md` in your working directory.
6. When finished, send a completion message to the parent orchestrator (Recipient: `796cc52e-c00d-4e4b-aa5b-ffc38c92dd62`).

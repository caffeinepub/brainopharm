# Specification

## Summary
**Goal:** Extend the Patient Registry to capture prescriber details per patient, and refresh/verify the drug dataset so it loads fully and consistently across the Drug Database UI.

**Planned changes:**
- Add a Prescriber Details section within the Patient Registry patient context with fields: Prefix (dropdown: “Dr.”, “Practitioner Nurse”, “Pharmacist”), Full Name, Registration Number, Address, Mail ID, Contact Number, Specialization.
- Ensure prefix labeling is consistent everywhere it appears (including Case Summary), using “Practitioner Nurse” (not “Nurse”), and correct spelling/English labels across the Prescriber Details UI.
- Implement backend storage + APIs to save/replace and retrieve prescriber details per patientId, including validation and clear errors for invalid input.
- Persist prescriber details across canister upgrades via stable storage and any necessary state migration while keeping existing data accessible.
- Update/expand the curated drug dataset so each drug entry includes at minimum: name, status (approved/banned), date, category (when known), description, source, safetyInfo; display “Unknown” where a value is not known.
- Add/ensure a post-refresh drug verification step (dedupe + required-field completeness + counts) that produces a structured result with timestamp, and show the latest verification status in the UI (pass/fail or warnings).
- Review Patient Registry and Drug Database screens and fix issues that prevent full patient/drug datasets from loading or being usable (including filters/pagination), without adding unrelated features.

**User-visible outcome:** Users can open a selected patient in Patient Registry and view/edit/save Prescriber Details (with correct prefix labels), and the Drug Database shows a fully loaded updated drug list with a visible last verification result (timestamp plus pass/fail or warnings) confirming completeness and consistency.

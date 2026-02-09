# Specification

## Summary
**Goal:** Expand Prescriber Details to the required fields with strong validation and persistence, and ensure the built-in Drug Database is complete, consistent, and up to date in the UI, with a warm neutral clinical theme across affected screens.

**Planned changes:**
- Update Prescriber Details UI to include a prefix dropdown with exact visible labels: "Dr.", "Practitioner Nurse", "Pharmacist", plus fields for Registration Number, Address, Mail ID (email), Contact Number, and Specialization; ensure values save and reload consistently per selected patient.
- Add frontend validation for Prescriber Details: require non-empty Registration Number, Address, Contact Number, Specialization, and Mail ID; enforce valid email format; show inline errors and block saving on invalid input.
- Update backend prescriber storage/API to support required fields (prefix, full name, registration number, specialization, contact number, email, address); reject empty strings for required fields and return clear English error messages on invalid submissions.
- Audit and update the shipped Drug Database datasets and UI handling so core drug fields are consistently populated; ensure list/details never crash on missing data and show an English fallback like "Not available" where needed; ensure banned drugs always show a "Ban Reason & Safety Information" section and banned entries are not lost during dedup/normalization.
- Review the patient case flow (patient selection → Case Entry tabs → Case Summary) to fix any broken/placeholder behavior in Prescriber Details and Drug Database modules that blocks normal use; ensure English, consistent terminology (including "Mail ID").
- Apply a coherent modern clinical theme to Prescriber Details, Drug list/details, and Case Summary using a warm neutral palette (avoid blue/purple as primary), consistent typography, spacing, and card/heading styles without changing functionality.

**User-visible outcome:** Users can enter and save complete, validated Prescriber Details per patient (and see them consistently in Case Summary), and browse a Drug Database that displays complete, consistent drug details without crashes, including clear banned-drug safety/ban information, all presented with a warm neutral clinical visual theme.

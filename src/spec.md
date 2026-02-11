# Specification

## Summary
**Goal:** Fix the Drug Database so it reliably shows a complete and correct list of approved and banned drugs, and the Refresh & Verify flow updates and reports verification results without errors.

**Planned changes:**
- Update the backend drug table data/source used by `getAllDrugs`, `getApprovedDrugs`, and `getBannedDrugs` so all lists are non-empty, complete, and return correct `status` values (`#approved`, `#banned`) with required fields populated.
- Ensure `refreshAndVerifyDrugTable` refreshes the stored dataset used by `getAllDrugs`, returns a `DrugVerificationResult`, and persists the latest result for `getLastDrugVerification` (null before any refresh).
- Align the Drug Database UI tabs (All/Approved/Banned) and counters to the backend lists, and ensure “Refresh & Verify” reloads the table and displays a clear pass/fail verification banner based on the latest backend result.
- Ensure search, category filtering, pagination, and CSV export operate on the currently filtered dataset without runtime errors when fields are missing/empty.

**User-visible outcome:** Users can view All/Approved/Banned drug lists without missing entries, refresh and verify the dataset from the UI, see an up-to-date verification summary banner, and use filtering/search/pagination/CSV export reliably.

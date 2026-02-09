# Specification

## Summary
**Goal:** Update the complete curated drug dataset and ensure the app reliably fetches, renders, and verifies the full drug list (approved/banned) without truncation.

**Planned changes:**
- Update `frontend/src/data/curatedDrugDataset.ts` with an up-to-date complete drug list, ensuring each record includes: name, status (approved/banned), date, category (when known), description, source, and safetyInfo, and that entries conform to existing `Drug`/`DrugStatus`/`DrugSource` types with deterministic deduplication.
- Adjust backend drug query behavior so `getAllDrugs` returns the full dataset (approved + banned) and approved-only/banned-only queries return complete, correctly filtered results independent of any user/profile loading state.
- Add a post-refresh verification workflow that checks basic dataset validity (non-zero count, non-empty names, valid status present, no duplicates by normalization rules) and exposes a clear success/failure result plus a human-readable failure summary in the UI.
- Update the Drug Database UI to render the entire dataset for All/Approved/Banned tabs, with search and category filters applied over the full list; if needed for large lists, add pagination or virtualization while preserving existing search, CSV export, and the drug details modal.

**User-visible outcome:** After refreshing/updating the drug list, users can see the full set of All/Approved/Banned drugs without missing items, and they receive a clear verification success/failure result (with an explanation if something is wrong).

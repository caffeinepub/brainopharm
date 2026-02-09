# Specification

## Summary
**Goal:** Fix the Drug Interaction checker so manual entries in Drug-Drug, Drug-Food, and Food-Food always produce and display fully updated results, with proper validation and client-side loading/error handling.

**Planned changes:**
- Replace stubbed interaction-check hooks with React Query-based client-side queries that recompute from the current manual inputs and update results for Drug-Drug, Drug-Food, and Food-Food.
- Ensure query keys incorporate normalized input values so editing inputs and re-checking triggers fresh computation and UI re-render.
- Add and enforce manual input validation for each tab (including minimum entries and duplicate detection), showing clear English validation messages and preventing checks when invalid.
- Ensure all interaction computations use existing local datasets/indexes (drug-drug, drug-food, food-food) and do not depend on backend availability.
- Expose and wire up loading and error states from the interaction queries so the UI can show a spinner/skeleton and error messaging.

**User-visible outcome:** After manually entering drugs/foods and clicking “Check interactions” in any tab, users see up-to-date interaction results for the current inputs, along with clear validation messages when inputs are invalid and visible loading/error states during checks.

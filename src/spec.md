# Specification

## Summary
**Goal:** Make Drug Interaction Checker (Drug-Drug tab) results clearly indicate which two drugs each pairwise interaction report refers to.

**Planned changes:**
- Update the Drug-Drug interaction results UI to display a prominent drug-pair label for each pairwise result in the format "<Drug A> + <Drug B>".
- Ensure the drug-pair label is shown both when interaction details exist and when a "no interaction data found" message is rendered for that pair.
- Use the same user-facing drug names from the interaction object’s drug fields when rendering the label.

**User-visible outcome:** After checking interactions for 2+ drugs, each pairwise result card/section shows the explicit drug pair label (e.g., "Warfarin + Aspirin"), including alongside any per-pair no-data message.

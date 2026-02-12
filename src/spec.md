# Specification

## Summary
**Goal:** Automatically seed and reliably refresh the authoritative drug database so the app ships with 500+ (ideally 550+) drugs on first run, and the Drug Database UI reflects this with the required header and a consistent academic theme.

**Planned changes:**
- Add backend auto-population/seed logic that initializes the authoritative drug store on first run (and after upgrade only if the store is empty) with 500+ entries, without overwriting existing keys.
- Ensure the canonical seed dataset contains 550+ total entries spanning multiple categories, and that UI counts (total/approved/banned) match the seeded backend data (including after “Refresh & Verify”).
- Implement/verify required backend methods used by the frontend hooks so “Refresh & Verify” completes reliably and updates last-refresh/verification reporting.
- Update the Drug Database module header to: “Complete CDSCO Drug Database | 500+ Drugs | Auto-Updated” (desktop + mobile).
- Apply a coherent professional academic visual theme across the Drug Database module using a neutral palette and consistent typography hierarchy (no new dominant blue/purple primary styling).

**User-visible outcome:** On a fresh deployment, the Drug Database immediately shows a populated 500+ drug list (550+ in the canonical dataset), “Refresh & Verify” works without errors and updates timestamps, and the module displays the specified header with consistent, professional styling in light/dark themes.

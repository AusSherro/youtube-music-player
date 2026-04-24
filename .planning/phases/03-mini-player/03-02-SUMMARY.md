---
phase: 03-mini-player
plan: "02"
status: complete
started: "2026-04-24"
completed: "2026-04-24"
---

## Summary

Wired the toggle mechanism between main window and mini player, extended the preload API with `toggleMiniPlayer` and `expandFromMini`, broadcast metadata to both windows, and connected the titlebar's btn-mini button. The mini player is now fully functional end-to-end.

## Tasks Completed

| # | Task | Status |
|---|------|--------|
| 1 | Extend preload API with mini player IPC channels | Done |
| 2 | Wire toggle logic, metadata broadcast, and btn-mini handler | Done |

## Key Files

### Modified
- `src/preload/index.ts` — Added `toggleMiniPlayer` and `expandFromMini` IPC methods
- `src/preload/index.d.ts` — Updated ElectronAPI type with new methods
- `src/main/index.ts` — Mini player lifecycle, toggle IPC handlers, close → app.quit()
- `src/renderer/titlebar.ts` — btn-mini wired to `toggleMiniPlayer()`
- `src/main/metadata.ts` — Dual broadcast to main window and mini player
- `src/renderer/mini-player.ts` — Updated to use typed `expandFromMini()` instead of `as any`

## Decisions

- Mini player close triggers `app.quit()` directly — simplest approach per D-13
- Metadata broadcast checks `!miniPlayer.isDestroyed()` before sending to avoid crashes
- `startMetadataPolling` takes optional `miniPlayer` parameter to maintain backward compatibility

## Deviations

None.

## Self-Check: PASSED

- [x] TypeScript compiles (both node and web tsconfigs)
- [x] btn-mini click triggers toggle-mini-player IPC
- [x] Expand button triggers expand-from-mini IPC
- [x] Metadata broadcasts to both main window and mini player
- [x] Mini player close quits the app
- [x] Preload API has toggleMiniPlayer() and expandFromMini()

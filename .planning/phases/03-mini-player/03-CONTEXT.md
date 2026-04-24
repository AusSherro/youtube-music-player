# Phase 3: Mini Player - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Resizable always-on-top mini player window showing now-playing info and playback controls. This is the core differentiator — a compact overlay that stays visible while the user works. This phase delivers the mini player window, its content, and the toggle mechanism. No media keys (Phase 4), no system tray, no additional metadata beyond what Phase 2 extracts.

</domain>

<decisions>
## Implementation Decisions

### Window Behavior
- **D-01:** Separate BrowserWindow (not a resize of main window). The mini player is its own top-level window with `alwaysOnTop: true`. This keeps the architecture clean — main window and mini player are independent renderers subscribing to the same metadata stream.
- **D-02:** Mini player has its own preload script (can reuse the same preload as main window since the IPC channels are already defined). It subscribes to `metadata-update` and sends `playback-command` just like the title bar renderer.
- **D-03:** Default mini player size: ~320×100px (compact horizontal strip). Minimum size: 280×80px. Maximum size: 500×150px. User can resize within these bounds.
- **D-04:** Mini player remembers its last position and size using electron-store (KD-05). On first launch, position near bottom-right of screen.
- **D-05:** Always-on-top with `alwaysOnTop: 'floating'` level so it stays above normal windows but below system dialogs.

### Layout & Content
- **D-06:** Horizontal layout — album art thumbnail on the left, track info (title + artist) stacked in the center, playback controls (prev/play-pause/next) on the right. Single row, compact.
- **D-07:** Album art displays as a small square thumbnail (~60×60px at default size) with rounded corners. Falls back to a music note icon when no art is available.
- **D-08:** Track title and artist truncate with ellipsis when the window is too narrow. Title is primary (slightly larger/bolder), artist is secondary (smaller/dimmer).
- **D-09:** No progress bar in the mini player — keeps it minimal. The user can see progress in the main YTM window.
- **D-10:** An expand/restore button (chevron-up icon) in the top-right corner returns to the full main window. Mirrors the shrink-to-mini button's chevron-down.

### Transition & Toggling
- **D-11:** Clicking shrink-to-mini button (btn-mini in title bar): hides the main window (`mainWindow.hide()`) and shows the mini player window. The main window is NOT closed — just hidden.
- **D-12:** Clicking expand/restore button in mini player: shows the main window (`mainWindow.show()`) and hides the mini player. Clean swap — only one is visible at a time.
- **D-13:** Closing the mini player window (X button or Alt+F4) closes the entire app (same as closing the main window). There is no state where neither window is visible.
- **D-14:** Instant transition — no animation. Show/hide is fast enough that animation would feel sluggish.

### Visual Style
- **D-15:** Dark theme matching the main window — `#0f0f0f` background, white text/icons. Reuses the same CSS variable palette from `titlebar.css`.
- **D-16:** Frameless window (`frame: false`) with a subtle 1px border (`#2d2d2d`) so it's visually distinct from the desktop. No rounded OS-level corners (Electron frameless windows on Windows don't natively support this).
- **D-17:** The mini player title bar area is minimal — just the expand button and a small drag area. No minimize/maximize buttons (the mini player IS the minimized state).
- **D-18:** Window has a close button (X) on the top-right, next to the expand button.

### Agent's Discretion
- Exact CSS styling details (font sizes, spacing, icon sizing)
- Album art loading/caching strategy
- Whether to add a subtle hover effect on the entire mini player
- Drag region sizing and behavior
- Keyboard shortcut to toggle between main/mini (if any — not required)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Project-Level
- `.planning/PROJECT.md` — Core value ("compact mini player that stays visible"), constraints
- `.planning/ROADMAP.md` §Phase 3 — Goal and success criteria
- `.planning/REQUIREMENTS.md` — Phase 3 requirements (to be defined)

### Phase 1 Implementation (window patterns)
- `.planning/phases/01-core-wrapper-window-chrome/01-CONTEXT.md` — Title bar decisions (D-04 shrink button on left, D-06 chevron icon)
- `src/main/window.ts` — `createMainWindow()` pattern, `MainWindowResult` interface, frameless window config
- `src/renderer/index.html` — Title bar HTML structure, `btn-mini` element
- `src/renderer/styles/titlebar.css` — CSS variable palette, button styling patterns

### Phase 2 Implementation (metadata/playback)
- `.planning/phases/02-metadata-extraction-playback-controls/02-CONTEXT.md` — IPC architecture (D-07, D-08, D-09)
- `src/main/metadata.ts` — `startMetadataPolling()` broadcasts `metadata-update` to subscribed renderers
- `src/main/playback.ts` — `executePlaybackCommand()` accepts commands from any renderer
- `src/preload/index.ts` — `onMetadataUpdate()`, `playPause()`, `next()`, `previous()` already exposed
- `src/preload/index.d.ts` — `ElectronAPI` type with metadata and playback channels
- `src/shared/types.ts` — `NowPlayingMetadata` and `PlaybackCommand` types

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `electronAPI.onMetadataUpdate(callback)` — Mini player renderer subscribes to this for live metadata
- `electronAPI.playPause/next/previous()` — Playback controls already wired through preload→main→ytmView pipeline
- `titlebar.css` CSS variables — `--titlebar-bg`, `--titlebar-btn-hover`, `--titlebar-close-hover` etc. can be shared or duplicated for mini player
- `btn-mini` click handler in `titlebar.ts` — Currently a no-op, ready to wire to IPC call

### Established Patterns
- **IPC pattern:** `contextBridge.exposeInMainWorld` → `ipcRenderer.send/invoke` → `ipcMain.on/handle`
- **Renderer pattern:** Vanilla TS + CSS, no framework (KD-04)
- **Window module:** `src/main/window.ts` exports factory function returning typed result
- **Metadata flow:** Main process polls ytmView → diffs → broadcasts `metadata-update` to all webContents via `send()`

### Integration Points
- `mainWindow.webContents.send('metadata-update', ...)` in `metadata.ts` — must ALSO send to mini player's webContents
- `ipcMain.on('playback-command', ...)` in `index.ts` — already handles commands from any renderer
- `btn-mini` in `titlebar.ts` needs IPC call to main process to trigger window swap
- New IPC channels needed: `toggle-mini-player` (renderer→main), potentially `mini-player-expand` (mini→main)
- electron-store integration for persisting mini player position/size

</code_context>

<specifics>
## Specific Ideas

- The mini player should feel like a native always-on-top widget — lightweight, unobtrusive, instantly responsive
- Album art is the visual anchor — it should be crisp and properly sized even at small dimensions
- The expand button mirrors the shrink button conceptually (chevron-down shrinks, chevron-up expands)
- Only one window visible at a time keeps the mental model simple — you're either in full mode or mini mode

</specifics>

<deferred>
## Deferred Ideas

- Progress bar / seek bar in mini player — could be added in Phase 4 polish if desired
- Shuffle/repeat toggle buttons in mini player — too much UI for the compact format
- System tray integration — separate concern, not part of mini player phase
- Snap-to-edges behavior — nice-to-have, not essential for MVP
- Mini player themes/skins — out of scope for v1.0

</deferred>

---

*Phase: 03-mini-player*
*Context gathered: 2026-04-24*

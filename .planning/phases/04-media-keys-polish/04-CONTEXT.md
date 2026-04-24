# Phase 4: Media Keys & Polish - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Global media key support so hardware media keys control YouTube Music playback, plus final polish: mini player progress bar with seeking, app icon, and startup loading state. This phase closes out v1.0 — no new features beyond what's listed here.

</domain>

<decisions>
## Implementation Decisions

### Media Key Registration
- **D-01:** Agent's discretion on the registration method (Electron `globalShortcut` vs Chromium MediaSession API vs hybrid). Pick the approach that works most reliably on Windows for global media key capture.
- **D-02:** Support three keys only: MediaPlayPause, MediaNextTrack, MediaPreviousTrack. Maps directly to existing `PlaybackCommand` type (`'play-pause' | 'next' | 'previous'`).
- **D-03:** Always register media keys at app startup. Steal from other apps if necessary — YTP should always own media keys while running, even if Spotify or a browser has them.

### Mini Player Progress Bar
- **D-04:** Full-width thin horizontal bar across the bottom of the mini player showing elapsed vs total time.
- **D-05:** Progress bar is clickable/seekable — user can click or drag to seek to a position in the track. This requires adding a `seek` command to the playback pipeline (DOM injection to set YTM player position via `<video>` element or progress bar simulation).
- **D-06:** Progress data already available in `NowPlayingMetadata.progress` and `.duration` fields — no new extraction needed, but polling frequency (currently 1s) should be sufficient for smooth bar updates.

### App Icon
- **D-07:** Custom `.ico` file for the application — used in window title bar, Windows taskbar, and installer. Agent's discretion on design approach (generate or source an appropriate icon).

### Startup Loading State
- **D-08:** Show a minimal dark splash screen with a subtle spinner or pulsing logo while the YTM page loads. Replace with YTM content once `did-finish-load` fires on the ytmView.
- **D-09:** Splash screen uses the same dark background (`#0f0f0f`) as the rest of the app — no jarring color transitions.

### App Lifecycle Edge Cases
- **D-10:** If user navigates away from `music.youtube.com` inside the embedded view: show a "Not on YouTube Music" warning in the mini player and disable playback controls. Auto-recover when user navigates back to YTM.
- **D-11:** On network disconnection: keep showing last-known metadata in the mini player. Let YTM's own error handling in the embedded view handle the network state — no custom offline indicator.
- **D-12:** If the YTM page reloads (F5, auto-update, or navigation): re-attach metadata polling once `did-finish-load` fires again. Brief gap in metadata display is acceptable.

### Agent's Discretion
- Media key registration method (globalShortcut vs MediaSession — see D-01)
- App icon design/sourcing
- Splash screen animation style (spinner vs pulsing logo vs loading bar)
- Progress bar visual style (color, height, animation smoothness)
- Seek implementation strategy (video element currentTime vs DOM progress bar interaction)
- Whether to unregister media keys on app quit (cleanup)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level
- `.planning/PROJECT.md` — Core value, constraints (Windows only, Electron, vanilla TS + CSS)
- `.planning/ROADMAP.md` §Phase 4 — Goal and success criteria
- `.planning/REQUIREMENTS.md` — Full requirements table

### Phase 2 Implementation (playback pipeline)
- `.planning/phases/02-metadata-extraction-playback-controls/02-CONTEXT.md` — IPC architecture (D-07, D-08, D-09), selector resilience (D-10, D-11, D-12)
- `src/main/playback.ts` — `executePlaybackCommand()` — media keys will call this same function
- `src/main/metadata.ts` — `startMetadataPolling()` with `did-finish-load` attachment pattern
- `src/main/ytm-selectors.ts` — Centralized YTM DOM selectors
- `src/shared/types.ts` — `PlaybackCommand` and `NowPlayingMetadata` types

### Phase 3 Implementation (mini player)
- `.planning/phases/03-mini-player/03-CONTEXT.md` — Mini player layout (D-06), visual style (D-15, D-16), window behavior (D-01 through D-05)
- `src/main/mini-player.ts` — `createMiniPlayer()` — window config, electron-store bounds persistence
- `src/renderer/mini-player.html` — Mini player HTML structure
- `src/renderer/mini-player.ts` — Mini player renderer (metadata subscription, playback controls)
- `src/renderer/styles/mini-player.css` — Mini player styling

### Main Process Entry
- `src/main/index.ts` — IPC handler registration, `did-finish-load` hook, window management

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `executePlaybackCommand(ytmView, command)` — Media keys call this directly with existing `PlaybackCommand` values
- `startMetadataPolling(ytmView, mainWindow, miniPlayer)` — Already broadcasts to both windows, re-attachable on reload
- `NowPlayingMetadata.progress` and `.duration` — Already extracted by polling, ready for progress bar rendering
- `electronAPI.onMetadataUpdate(callback)` — Mini player renderer already subscribes, progress bar hooks into same data
- CSS variable palette in `titlebar.css` and `mini-player.css` — Reuse for consistent dark theme on splash screen

### Established Patterns
- **IPC pattern:** `contextBridge.exposeInMainWorld` → `ipcRenderer.send/invoke` → `ipcMain.on/handle`
- **Renderer pattern:** Vanilla TS + CSS, no framework (KD-04)
- **Playback pipeline:** renderer → IPC → main → `executeJavaScript()` on ytmView
- **Metadata flow:** main polls ytmView → diffs → broadcasts `metadata-update` to all renderer webContents
- **Window module:** Factory functions in dedicated files (`window.ts`, `mini-player.ts`)

### Integration Points
- `ipcMain.on('playback-command', ...)` in `index.ts` — already handles commands from any source, media keys just need to call `executePlaybackCommand` directly from main process (no IPC needed)
- `ytmView.webContents.on('did-finish-load', ...)` — hook point for re-attaching polling after reload
- `ytmView.webContents.on('did-navigate', ...)` — can detect navigation away from YTM
- Mini player HTML/CSS needs progress bar element added to existing layout
- New `seek` command needs to be added to `PlaybackCommand` type and `executePlaybackCommand` function

</code_context>

<specifics>
## Specific Ideas

- Media keys should "just work" — no configuration UI, no toggle, always active while YTP is running
- Progress bar should feel native — thin, subtle, smooth updates at 1s polling interval
- The seek interaction on the progress bar is an upgrade over Phase 3's "no progress bar" decision — gives the mini player real utility as a playback controller
- Splash screen should be fast and forgettable — just prevents the blank white/dark flash while Electron loads YTM
- Navigation-away detection protects against the user accidentally clicking a YTM link that leaves the music page

</specifics>

<deferred>
## Deferred Ideas

- Window title = now-playing (not selected for Phase 4 polish scope)
- Taskbar thumbnail buttons (not selected for Phase 4 polish scope)
- Shuffle/repeat toggle buttons in mini player (deferred from Phase 3)
- Snap-to-edges behavior for mini player (deferred from Phase 3)
- System tray integration (deferred from Phase 3)
- Mini player themes/skins (deferred from Phase 3)
- Offline indicator in mini player (decided against — let YTM handle it)

</deferred>

---

*Phase: 04-media-keys-polish*
*Context gathered: 2026-04-24*

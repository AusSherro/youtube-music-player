---
phase: 04-media-keys-polish
plan: 01
subsystem: playback
tags: [globalShortcut, media-keys, ipc, seek, navigation]

requires:
  - phase: 03-mini-player
    provides: mini player window, metadata polling, playback IPC

provides:
  - Global media key registration (play/pause, next, previous)
  - Seek-to-position IPC pipeline (main → YTM video element)
  - Reload-safe metadata polling (stop before restart)
  - Navigation-away detection broadcasting to all renderers
  - Preload bridge extensions (seek, onNavigationState, onYtmLoaded)

affects: [04-02-progress-bar, mini-player, renderer]

tech-stack:
  added: [globalShortcut]
  patterns: [media-key-registration, seek-ipc, navigation-detection]

key-files:
  created: []
  modified: [src/main/playback.ts, src/main/index.ts, src/preload/index.ts, src/preload/index.d.ts]

key-decisions:
  - "seekTo uses video.currentTime directly via executeJavaScript"
  - "globalShortcut registers all 3 media keys on app.whenReady"
  - "did-navigate handler extracts hostname to detect YTM vs non-YTM"
  - "did-finish-load calls stopMetadataPolling before restart for clean reload recovery"

patterns-established:
  - "Navigation-state IPC: main broadcasts to both main window and mini player"
  - "Preload subscription pattern: onNavigationState/onYtmLoaded use ipcRenderer.on"

requirements-completed: [MKEY-01, PLSH-01, PLSH-02]

duration: 5min
completed: 2026-04-24
---

# Plan 04-01: Media Keys, Seek IPC & Lifecycle Handlers Summary

**Global media keys registered for play/pause/next/previous, seek-to-position IPC pipeline wired, reload recovery hardened, navigation-away detection broadcasting to renderers, preload bridge extended with seek/onNavigationState/onYtmLoaded APIs.**

## What Was Built

1. **seekTo function** in playback.ts — sets `video.currentTime` in YTM via executeJavaScript
2. **Global media keys** — `MediaPlayPause`, `MediaNextTrack`, `MediaPreviousTrack` registered via `globalShortcut.register`
3. **Seek-to IPC handler** — `ipcMain.on('seek-to')` validates and delegates to seekTo
4. **Reload recovery** — `did-finish-load` now calls `stopMetadataPolling()` before restarting
5. **Navigation-away detection** — `did-navigate` handler broadcasts `navigation-state` IPC to all windows
6. **ytm-loaded signal** — `did-finish-load` sends `ytm-loaded` to main window for splash screen
7. **Preload bridge** — Added `seek()`, `onNavigationState()`, `onYtmLoaded()` to both implementation and type declarations
8. **Cleanup on quit** — `globalShortcut.unregisterAll()` in `window-all-closed`

## Verification

- TypeScript compiles clean (both node and web configs)
- All acceptance criteria met

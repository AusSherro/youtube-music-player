---
name: YTP
subtitle: YouTube Music Desktop Player
version: "1.0.0"
last_updated: "2026-04-24"
---

# YTP — YouTube Music Desktop Player

## Core Value

Play YouTube Music in its own desktop window with a compact mini player that stays visible while you work.

## Description

A dedicated Windows desktop wrapper for YouTube Music that runs outside the browser. It embeds the YT Music web app in a frameless Electron window with a custom title bar, and features a resizable always-on-top mini player that shows now-playing info and playback controls. Built with Electron.

## Current State

**Shipped:** v1.0 (2026-04-24)

v1.0 delivers a fully functional YouTube Music desktop wrapper with:
- Frameless Electron window loading YouTube Music via WebContentsView
- Google sign-in support (UA spoofing) and Widevine DRM
- Custom dark title bar with minimize/maximize/close/shrink-to-mini
- Metadata extraction from YTM DOM with 1s polling and IPC broadcast
- Playback controls via DOM click simulation
- Always-on-top mini player with album art, track info, and playback controls
- Global media keys (play/pause, next, previous)
- Seekable progress bar in mini player
- Dark splash screen during YTM load
- Navigation-away detection with recovery
- Custom app icon
- Position/size persistence via electron-store

**Tech stack:** Electron 41, electron-vite, electron-builder, vanilla TS + CSS, electron-store

## Constraints

- **Platform**: Windows only — no cross-platform considerations
- **Tech Stack**: Electron — chosen for reliable web wrapping, DOM injection, and multi-window support
- **Dependencies**: Requires YouTube Music web app to remain functional (external dependency)
- **Performance**: Should feel lightweight despite Electron — minimize memory footprint where possible

## Key Decisions

| ID | Decision | Rationale | Phase |
|----|----------|-----------|-------|
| KD-01 | Electron 41+ with WebContentsView | Modern replacement for deprecated BrowserView | 1 |
| KD-02 | electron-vite for build tooling | Fast HMR, separate main/preload/renderer targets | 1 |
| KD-03 | electron-builder for packaging | Best Windows NSIS/portable support | 1 |
| KD-04 | Vanilla TS + CSS for UI | Framework overkill for ~50 lines of UI | 1 |
| KD-05 | electron-store for persistence | JSON file in userData, accessible from main + renderer | 1 |

---
*Last updated: 2026-04-24*

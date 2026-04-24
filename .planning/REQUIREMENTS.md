---
version: "1.0"
total_requirements: 19
completed: 0
last_updated: "2026-04-24"
---

# Requirements

## Wrapper & Auth

| ID | Requirement | Status | Phase | Verified |
|----|-------------|--------|-------|----------|
| WRAP-01 | Load YouTube Music (music.youtube.com) in embedded view | Active | 1 | — |
| WRAP-02 | Google sign-in works (UA spoofing, session persistence) | Active | 1 | — |
| WRAP-03 | Widevine DRM enabled for Premium audio quality | Active | 1 | — |

## Window Chrome

| ID | Requirement | Status | Phase | Verified |
|----|-------------|--------|-------|----------|
| WNDW-01 | Custom dark title bar with minimize/maximize/close/shrink-to-mini | Active | 1 | — |

## Metadata Extraction

| ID | Requirement | Status | Phase | Verified |
|----|-------------|--------|-------|----------|
| META-01 | Extract now-playing metadata (title, artist, album art, duration, progress, play state, shuffle/repeat) from YTM DOM | Active | 2 | — |
| META-02 | Metadata pipeline broadcasts changes from main process to subscribed renderers via IPC | Active | 2 | — |

## Playback Controls

| ID | Requirement | Status | Phase | Verified |
|----|-------------|--------|-------|----------|
| CTRL-01 | Play/pause, next, previous controls available via IPC, executed via DOM click simulation | Active | 2 | — |

## Mini Player

| ID | Requirement | Status | Phase | Verified |
|----|-------------|--------|-------|----------|
| MINI-01 | Always-on-top mini player window displaying now-playing metadata (title, artist, album art) | Active | 3 | — |
| MINI-02 | Playback controls (play/pause, next, previous) in mini player | Active | 3 | — |
| MINI-03 | Toggle between main window and mini player via shrink/expand buttons | Active | 3 | — |
| MINI-04 | Mini player persists position and size across sessions via electron-store | Active | 3 | — |

---
*Requirements created: 2026-04-24*
*Last updated: 2026-04-24*

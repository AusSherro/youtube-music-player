# Phase 4: Media Keys & Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 04-media-keys-polish
**Areas discussed:** Media key approach, Polish scope, App lifecycle edge cases

---

## Media Key Approach

### Registration Method

| Option | Description | Selected |
|--------|-------------|----------|
| Electron globalShortcut | Register MediaPlayPause/MediaNextTrack/MediaPreviousTrack via globalShortcut.register(). Simple, works globally, already in Electron API. | |
| Chromium MediaSession API | Set navigator.mediaSession action handlers in the renderer. Integrates with Windows media overlay but needs active audio focus. | |
| You decide | Agent picks the best approach based on what works most reliably on Windows. | ✓ |

**User's choice:** Agent's discretion — pick the most reliable approach for Windows.
**Notes:** None

### Key Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Play/Pause + Next + Previous only | Matches existing PlaybackCommand type exactly. Clean and simple. | ✓ |
| Also Stop key | Add a stop/mute behavior on MediaStop key. | |
| Full set (including volume) | Play/pause, next, prev, stop, volume up/down via media keys. | |

**User's choice:** Play/Pause + Next + Previous only
**Notes:** Maps directly to existing PlaybackCommand type.

### Key Conflict Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Register on app focus, release on blur | YTP only claims keys when it's the active music player. | |
| Always register, fail silently if taken | Try to grab keys at startup. If another app has them, no error. | |
| Always register, steal from other apps | Force-register keys. YTP always gets them while running. | ✓ |

**User's choice:** Always register, steal from other apps
**Notes:** None

---

## Polish Scope

### Items Selected for Phase 4

| Option | Description | Selected |
|--------|-------------|----------|
| Mini player progress bar | Add a progress/seek bar to the mini player (deferred from Phase 3). | ✓ |
| Window title = now-playing | Set the main window title to the current track name. | |
| Taskbar thumbnail buttons | Windows taskbar thumbnail toolbar buttons. | |
| App icon | Custom .ico app icon for window, taskbar, and installer. | ✓ |
| Startup loading state | Improve startup experience — splash screen or loading state. | ✓ |

**User's choice:** Mini player progress bar, App icon, Startup loading state
**Notes:** Window title and taskbar thumbnail buttons were not selected.

### Progress Bar Style

| Option | Description | Selected |
|--------|-------------|----------|
| Full-width bottom bar | Thin horizontal bar across the full bottom of the mini player. | ✓ |
| Partial-width bar under text | Thin bar under the track title/artist area only. | |
| You decide | Agent decides the best visual approach. | |

**User's choice:** Full-width bottom bar
**Notes:** None

### Progress Bar Interactivity

| Option | Description | Selected |
|--------|-------------|----------|
| Display-only (no seeking) | Just a visual indicator. No click interaction. | |
| Clickable/seekable | User can click/drag the bar to seek to a position. | ✓ |

**User's choice:** Clickable/seekable
**Notes:** Requires adding a seek command to the playback pipeline (DOM injection to set YTM player position).

### Startup Loading State

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal dark splash | Dark screen with subtle spinner or pulsing YTP logo while YTM loads. | ✓ |
| No splash, just dark window | Show nothing special — blank dark window until YTM loads. | |
| You decide | Agent picks the approach. | |

**User's choice:** Minimal dark splash
**Notes:** None

---

## App Lifecycle Edge Cases

### YTM Navigation Away

| Option | Description | Selected |
|--------|-------------|----------|
| Show warning, disable controls | Show "Not on YouTube Music" in mini player, disable controls. Auto-recover on return. | ✓ |
| Force-redirect back to YTM | Force-navigate back to music.youtube.com. | |
| You decide | Agent picks the best approach. | |

**User's choice:** Show warning, disable controls
**Notes:** Auto-recover when user navigates back.

### Network Disconnection

| Option | Description | Selected |
|--------|-------------|----------|
| Stale data, let YTM handle it | Keep showing last-known metadata. YTM's own error handling is sufficient. | ✓ |
| Show offline indicator | Show a "No connection" state in mini player and title bar. | |

**User's choice:** Stale data, let YTM handle it
**Notes:** None

### YTM Page Reload

| Option | Description | Selected |
|--------|-------------|----------|
| Re-attach polling on page reload | Auto-restart metadata polling once did-finish-load fires again. Brief gap OK. | ✓ |
| You decide | Agent handles this. | |

**User's choice:** Re-attach polling on page reload
**Notes:** None

---

## Agent's Discretion

- Media key registration method (globalShortcut vs MediaSession)
- App icon design/sourcing
- Splash screen animation style
- Progress bar visual details (color, height, animation)
- Seek implementation strategy
- Media key cleanup on quit

## Deferred Ideas

- Window title = now-playing
- Taskbar thumbnail buttons
- Shuffle/repeat toggles in mini player
- Snap-to-edges, system tray, themes (carried from Phase 3)

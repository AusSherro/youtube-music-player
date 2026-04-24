---
phase: 04-media-keys-polish
created: "2026-04-24"
discovery_level: 1
---

# Phase 4: Media Keys & Polish — Research

## Standard Stack

| Technology | Purpose | Confidence |
|------------|---------|------------|
| `globalShortcut` (Electron built-in) | Global media key capture | HIGH |
| `executeJavaScript` on `<video>` element | Seek-to-position | HIGH |
| Vanilla TS + CSS (existing pattern) | Progress bar UI | HIGH |
| `.ico` file in `build/` | App icon | HIGH |
| CSS overlay + IPC signal | Splash/loading screen | HIGH |
| `did-navigate` event | Navigation-away detection | HIGH |

## Architecture Patterns

### 1. Media Key Registration — `globalShortcut`

**Chosen approach:** Electron's `globalShortcut.register()` API.

**Why not MediaSession API?** The MediaSession API requires the renderer to be the media source. In YTP's architecture, YTM runs inside a `WebContentsView` which already sets up its own MediaSession. We can't reliably intercept or override it. `globalShortcut` works at the OS level — it captures hardware media keys before any other app, which satisfies D-03 ("steal from other apps if necessary").

**Registration:**
```typescript
import { globalShortcut } from 'electron'

// In app.whenReady():
globalShortcut.register('MediaPlayPause', () => executePlaybackCommand(ytmView, 'play-pause'))
globalShortcut.register('MediaNextTrack', () => executePlaybackCommand(ytmView, 'next'))
globalShortcut.register('MediaPreviousTrack', () => executePlaybackCommand(ytmView, 'previous'))
```

**Cleanup:** `globalShortcut.unregisterAll()` in `app.on('will-quit')` or `app.on('window-all-closed')`.

**Failure mode:** If another app already holds the media key registration, `globalShortcut.register()` returns `false`. Should log a warning but not crash. Electron 41 on Windows handles this reliably.

### 2. Seek Command — `<video>` Element

**Approach:** YTM uses a standard HTML5 `<video>` element for playback. Setting `video.currentTime` directly is the most reliable seek method.

```javascript
// executeJavaScript on ytmView:
const video = document.querySelector('video');
if (video) video.currentTime = targetSeconds;
```

**IPC design:** The existing `PlaybackCommand` type is a simple string union. Rather than complicating it with parameters, add a separate IPC channel:
- New IPC: `ipcMain.on('seek-to', (_event, seconds: number) => ...)` 
- New preload API: `seek: (seconds: number) => ipcRenderer.send('seek-to', seconds)`
- Keeps existing `playback-command` pattern unchanged

**Input validation:** Clamp `seconds` to `[0, duration]` to prevent invalid seek positions.

### 3. Mini Player Progress Bar

**HTML:** A thin container div at the bottom of `#mini-player` with an inner fill div.

**CSS:** Full-width, 3px tall, `#ffffff33` background (track), `#ff0000` or white fill. The bar should be positioned at the very bottom edge of the mini player.

**Interaction:**
- Click anywhere on the bar → seek to `(clickX / barWidth) * duration`
- Optional: drag support via `mousedown` + `mousemove` + `mouseup`
- Cursor: `pointer` on hover

**Data flow:** `metadata.progress` and `metadata.duration` already arrive via `onMetadataUpdate`. Update bar width: `(progress / duration) * 100%`.

**Edge case:** When `duration === 0` (no track loaded), hide or grey out the bar.

### 4. App Icon

**electron-builder convention:** Place `icon.ico` in `build/` directory. The `electron-builder.yml` already references `buildResources: build`.

**Required sizes in .ico:** 16x16, 32x32, 48x48, 256x256 for Windows.

**Generation:** Can be created programmatically or sourced. For v1.0, a simple music note or play button icon works. The agent can create an SVG and convert, or generate a minimal .ico.

### 5. Splash/Loading Screen

**Approach:** Add a loading overlay to `index.html` that covers the area below the title bar (where ytmView renders). The overlay shows a centered spinner/pulsing element on `#0f0f0f` background.

**Flow:**
1. App starts → overlay visible (default state in HTML)
2. `ytmView.webContents.on('did-finish-load')` → main sends IPC `'ytm-loaded'` to mainWindow renderer
3. Renderer receives `'ytm-loaded'` → hides overlay with a fade-out transition

**No new window needed.** The overlay sits in the titlebar renderer's HTML, positioned absolutely to cover the full window below the title bar.

### 6. Navigation-Away Detection (D-10)

**Event:** `ytmView.webContents.on('did-navigate', (event, url) => ...)`

**Logic:**
- Parse URL hostname — if not `music.youtube.com`, broadcast a "not on YTM" state
- Mini player renderer checks for this state and shows "Not on YouTube Music" message, disables playback buttons
- Auto-recover: when user navigates back to YTM, normal metadata flow resumes

**Note:** The existing `will-navigate` handler already blocks most external navigation. The `did-navigate` event catches in-page navigation changes within the allowed domains.

### 7. YTM Reload Recovery (D-12)

**Current code issue:** `startMetadataPolling()` has `if (pollTimer) return` guard — it won't restart if already polling.

**Fix:** In the `did-finish-load` handler, call `stopMetadataPolling()` before `startMetadataPolling()`. This handles both initial load and subsequent reloads.

### 8. Network Disconnection (D-11)

**Approach:** No special handling needed. Per D-11, keep showing last-known metadata in the mini player. The existing metadata pipeline already does this — if polling fails (metadata returns null), the last-known values remain displayed. Just need to ensure the mini player renderer doesn't clear metadata on null (currently it does show "Not playing" — this needs a tweak to distinguish "null because no track" from "null because network error").

**Simple approach per D-11:** Let YTM handle network state. The metadata polling already has `consecutiveFailures` counter — when failures accumulate, just stop broadcasting rather than sending null.

## Don't Hand-Roll

- Media key registration — use Electron's built-in `globalShortcut`, don't try to use native Node addons
- Video seeking — use the `<video>` element's `currentTime` property, don't try to interact with YTM's custom progress bar DOM

## Common Pitfalls

1. **globalShortcut registration failure** — Returns `false` silently. Must check return value and log.
2. **Seek during loading** — `<video>` element may not exist during page load. Guard with null check.
3. **Progress bar division by zero** — `duration === 0` when no track loaded. Always guard.
4. **Overlay z-index** — The splash overlay must render above the ytmView area but below the title bar controls.
5. **did-finish-load fires multiple times** — On reload, navigation, etc. The `stopMetadataPolling()` + `startMetadataPolling()` pattern handles this.

## Validation Architecture

### Critical Paths
1. Media key press → `globalShortcut` handler → `executePlaybackCommand` → YTM DOM click → playback state change
2. Progress bar click → seek position calculation → IPC `seek-to` → `video.currentTime` → YTM playback position updates
3. App launch → splash overlay visible → YTM loads → `did-finish-load` → hide splash

### Boundary Conditions
- Media key registration failure (another app holds keys)
- Seek to invalid position (beyond duration, negative)
- Progress update when duration is 0
- Navigation away from YTM while mini player is visible
- YTM page reload during active playback

---
*Research completed: 2026-04-24*

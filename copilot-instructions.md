<!-- GSD:project-start source:PROJECT.md -->
## Project

**YTP — YouTube Music Desktop Player**

A dedicated Windows desktop wrapper for YouTube Music that runs outside the browser. It embeds the YT Music web app in a frameless Electron window with a custom title bar, and features a resizable always-on-top mini player that shows now-playing info and playback controls. Built with Electron.

**Core Value:** Play YouTube Music in its own desktop window with a compact mini player that stays visible while you work.

### Constraints

- **Platform**: Windows only — no cross-platform considerations
- **Tech Stack**: Electron — chosen for reliable web wrapping, DOM injection, and multi-window support
- **Dependencies**: Requires YouTube Music web app to remain functional (external dependency)
- **Performance**: Should feel lightweight despite Electron — minimize memory footprint where possible
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| **Electron** | ^41.0.0 (41.3.0 latest) | App shell, window management, web embedding | Latest stable. Chromium 146, Node 24.15.0. Frameless window support, `WebContentsView` for embedding, `globalShortcut` for media keys, multi-window support — all built-in. | HIGH |
| **TypeScript** | ^5.8.0 | Language for all app code | Type safety for IPC contracts and DOM injection code. | HIGH |
| **electron-vite** | ^5.0.0 | Build tooling (dev server + bundler) | Pre-configured Vite for Electron with separate main/preload/renderer build targets. | HIGH |
| **electron-builder** | ^26.0.0 | Packaging & distribution | Best Windows installer support (NSIS, portable exe, Squirrel). | HIGH |
### Supporting Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| **electron-store** | ^11.0.0 | Persist window position, size, preferences |

## Architecture Notes (Stack-Relevant)
### Window Embedding: `WebContentsView` (NOT `BrowserView`)
- **Main window**: `BrowserWindow` (frameless) — its own webContents renders the custom title bar HTML/CSS
- **YouTube Music embed**: `WebContentsView` added as a child view, positioned below the title bar
- **Mini player**: Separate `BrowserWindow` (always-on-top, frameless) with its own HTML/CSS renderer

## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **`BrowserView`** | Deprecated in Electron 41. | `WebContentsView` |
| **`<webview>` tag** | Poor performance, officially discouraged. | `WebContentsView` |
| **`@electron/remote`** | Deprecated. Security risk. | IPC via `contextBridge` + `ipcMain`/`ipcRenderer`. |
| **`nodeIntegration: true`** | Security vulnerability. | `contextIsolation: true` + `sandbox: true` + preload scripts. |
| **React / Vue / Angular** | Overkill for ~50 lines of UI. | Vanilla TypeScript + CSS. |
<!-- GSD:stack-end -->

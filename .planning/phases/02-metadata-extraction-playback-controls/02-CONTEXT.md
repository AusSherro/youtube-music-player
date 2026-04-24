# Phase 2: Metadata Extraction & Playback Controls - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract now-playing metadata (title, artist, album art, duration, progress, play state) from the YouTube Music DOM and expose playback controls (play/pause, next, previous) via IPC. This phase delivers the data pipeline and control interface — no mini player window, no media key bindings.

</domain>

<decisions>
## Implementation Decisions

### Extraction Method
- **D-01:** Use `executeJavaScript()` on `ytmView.webContents` from the main process to run DOM scraping code inside the YTM page — no second preload script needed. This is simpler than managing a separate preload for the ytmView and avoids CSP complications.
- **D-02:** Poll on a setInterval from main process (every 1-2 seconds) rather than MutationObserver. Polling is more resilient to DOM structure changes and avoids injecting persistent observers that could break on YTM page navigations/reloads.

### Metadata Scope
- **D-03:** Extract the full set needed for mini player (Phase 3): track title, artist name, album art URL, duration (total), current progress (elapsed), play state (playing/paused/idle), and shuffle/repeat state.
- **D-04:** Like/dislike status is deferred — not needed for mini player MVP.

### Playback Control Approach
- **D-05:** Simulate clicks on YTM's own DOM transport buttons (play/pause, next, previous). This is the most reliable approach — it uses the same UI the user would click, ensuring all YTM internal state stays consistent.
- **D-06:** Do NOT attempt to use YTM's internal player API or undocumented APIs — too fragile and could break on any YTM update.

### Data Flow Architecture
- **D-07:** Metadata flows: `ytmView (executeJS) → main process → renderer (title bar)` via IPC. Main process is the hub — it polls ytmView, stores current state, and broadcasts to any renderer that subscribes.
- **D-08:** Main process emits `metadata-update` event to all subscribed renderers when metadata changes (diffed — only send on actual change). This prepares for Phase 3 where the mini player renderer also subscribes.
- **D-09:** Playback controls flow: `renderer → main process (IPC) → ytmView (executeJS click)`. Same hub pattern in reverse.

### Selector Resilience
- **D-10:** Centralize all YTM DOM selectors in a single constants object (e.g., `YTM_SELECTORS`) so they can be updated in one place when YTM changes their DOM.
- **D-11:** Use aria-labels and data attributes as selectors where available (more stable than class names). Fall back to class-based selectors where necessary.
- **D-12:** If metadata extraction fails (selectors broken), emit a null/empty metadata object rather than crashing — graceful degradation.

### Agent's Discretion
- Exact polling interval (1s vs 2s — balance responsiveness vs overhead)
- Specific YTM DOM selectors (must be discovered by inspecting live YTM page)
- Whether to store metadata in electron-store for persistence across restarts
- Error logging/retry strategy for failed executeJavaScript calls

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Project-Level
- `.planning/PROJECT.md` — Core value, constraints (Windows only, Electron)
- `.planning/ROADMAP.md` §Phase 2 — Goal and success criteria
- `.planning/STATE.md` — "DOM selector fragility is the highest technical risk (Phase 2)"

### Phase 1 Implementation (context for building on)
- `.planning/phases/01-core-wrapper-window-chrome/01-01-SUMMARY.md` — IPC bridge pattern, WebContentsView setup, window.ts exports
- `.planning/phases/01-core-wrapper-window-chrome/01-02-SUMMARY.md` — Title bar renderer pattern, vanilla TS approach

### Key Source Files
- `src/main/window.ts` — `createMainWindow()` returns `{ mainWindow, ytmView }` — ytmView.webContents is the injection target
- `src/main/index.ts` — IPC handler registration pattern
- `src/preload/index.ts` — contextBridge pattern for renderer API
- `src/preload/index.d.ts` — ElectronAPI type declarations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ytmView.webContents` — Already created in `window.ts`, accessible for `executeJavaScript()` calls
- IPC bridge pattern — `contextBridge.exposeInMainWorld('electronAPI', {...})` established in preload
- `ipcMain.on` / `ipcMain.handle` pattern in `index.ts` for handling renderer requests

### Established Patterns
- **IPC pattern:** `contextBridge.exposeInMainWorld` → `ipcRenderer.send/invoke` → `ipcMain.on/handle`
- **Renderer pattern:** Vanilla TS + CSS, no framework (KD-04)
- **Window module:** `src/main/window.ts` exports factory function returning typed result

### Integration Points
- `ytmView.webContents.executeJavaScript()` — entry point for DOM scraping and playback control
- `mainWindow.webContents.send()` — push metadata updates to title bar renderer
- `src/preload/index.ts` + `index.d.ts` — extend ElectronAPI with new metadata/playback channels
- Title bar renderer can display now-playing info (preparation for Phase 3 mini player)

</code_context>

<specifics>
## Specific Ideas

- The metadata extraction module should be cleanly separable so Phase 3 (mini player) can subscribe to the same data stream
- Selectors will need to be discovered by inspecting the live YouTube Music page — this is inherently fragile and the selector constants file is the mitigation strategy
- The polling approach from main process means no code runs persistently inside the YTM page — cleaner separation of concerns

</specifics>

<deferred>
## Deferred Ideas

- Like/dislike status extraction — belongs in Phase 4 (polish) or a future phase
- Lyrics extraction — out of scope for v1.0
- Queue/playlist info extraction — out of scope for v1.0
- Volume control — YTM handles this natively, no need to wrap

</deferred>

---

*Phase: 02-metadata-extraction-playback-controls*
*Context gathered: 2026-04-24*

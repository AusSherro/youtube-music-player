# Phase 1: Core Wrapper & Window Chrome - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Electron app that loads YouTube Music (music.youtube.com) in a frameless desktop window with Google sign-in support, Widevine DRM for Premium audio quality, and a custom dark title bar with window controls and a shrink-to-mini button. This phase delivers a working standalone wrapper — no metadata extraction, no mini player, no media keys.

</domain>

<decisions>
## Implementation Decisions

### Title Bar Visual Style
- **D-01:** Dark/minimal title bar — dark background matching YT Music's dark theme, minimal chrome, blends seamlessly with the embedded page
- **D-02:** No title text in the title bar — clean and minimal, app name only shows in the taskbar
- **D-03:** No visible border between title bar and YT Music content — seamless dark-on-dark appearance

### Title Bar Layout & Controls
- **D-04:** Standard Windows layout — close/maximize/minimize on the right, shrink-to-mini button on the left
- **D-05:** Standard title bar height (~32px)
- **D-06:** Shrink-to-mini button uses a chevron/arrow-down icon suggesting "shrink down"

### Title Bar Interaction
- **D-07:** Subtle hover highlights on buttons, red highlight on close button (Windows convention)
- **D-08:** Double-clicking the title bar drag area toggles maximize/restore (standard Windows behavior)
- **D-09:** Full Windows snap support — drag-to-edge, Win+Arrow shortcuts

### Title Bar Implementation
- **D-10:** Plain HTML/CSS for the title bar renderer — no framework overhead for a few buttons

### Agent's Discretion
- Window default size and minimum size at launch
- Auth/loading UX details (splash, error states)
- Electron packaging approach and project folder structure
- Specific CSS color values for the dark theme (should match YT Music's palette)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements are fully captured in decisions above and in:

### Project-Level
- `.planning/PROJECT.md` — Core value, constraints (Windows only, Electron, no system tray)
- `.planning/REQUIREMENTS.md` §Wrapper & Auth — WRAP-01, WRAP-02, WRAP-03 requirements
- `.planning/REQUIREMENTS.md` §Window Chrome — WNDW-01 requirement
- `.planning/ROADMAP.md` §Phase 1 — Success criteria and dependency chain

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase sets the patterns for the project

### Integration Points
- Title bar must coexist with BrowserView/webview loading music.youtube.com
- Shrink-to-mini button wiring will be connected in Phase 3 (mini player)

</code_context>

<specifics>
## Specific Ideas

- Title bar should feel invisible — dark-on-dark seamless with YT Music's existing dark UI
- Window controls should behave exactly like native Windows (hover red on close, snap layouts, double-click maximize)
- Shrink-to-mini button placement on the left separates it visually from the standard window controls on the right

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-core-wrapper-window-chrome*
*Context gathered: 2026-04-24*

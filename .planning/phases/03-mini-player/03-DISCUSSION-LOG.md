# Phase 3: Mini Player - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 03-mini-player
**Areas discussed:** Window behavior, Layout & content, Transition & toggling, Visual style
**Mode:** Auto-selected (--chain flag, all areas selected with recommended defaults)

---

## Window Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Separate BrowserWindow | Independent window with own renderer, subscribes to same IPC streams | ✓ |
| Resize main window | Shrink the existing window to mini size | |
| WebContentsView overlay | Add a view on top of the main window | |

**User's choice:** Separate BrowserWindow (auto-selected — recommended for clean architecture)
**Notes:** Separate window allows independent always-on-top behavior, own position/size persistence, and clean show/hide toggling. Resizing main window would require repositioning ytmView and managing complex layout states.

---

## Layout & Content

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal strip | Album art left, title/artist center, controls right — single compact row | ✓ |
| Stacked vertical | Album art top, info middle, controls bottom | |
| Art-only with overlay | Large album art with text/controls overlaid | |

**User's choice:** Horizontal strip (auto-selected — most compact for always-on-top overlay)
**Notes:** Horizontal layout at ~320×100px keeps the footprint minimal while showing all essential info. No progress bar — keeps it clean. Stacked vertical would take more vertical screen space. Art overlay looks nice but obscures the art.

---

## Transition & Toggling

| Option | Description | Selected |
|--------|-------------|----------|
| Hide main, show mini | Main window hides (not closed), mini shows — clean swap | ✓ |
| Keep both visible | Main stays open, mini floats over it | |
| Minimize main to tray | Main goes to system tray, mini player appears | |

**User's choice:** Hide main, show mini (auto-selected — simplest mental model)
**Notes:** Only one window visible at a time. Click shrink → main hides + mini shows. Click expand → mini hides + main shows. Closing either window closes the app. No system tray involvement (deferred).

---

## Visual Style

| Option | Description | Selected |
|--------|-------------|----------|
| Match main dark theme | Same #0f0f0f bg, white icons, reuse CSS variables | ✓ |
| Distinct mini theme | Different background/accent to distinguish modes | |
| Translucent/frosted | Semi-transparent with backdrop blur | |

**User's choice:** Match main dark theme (auto-selected — consistency with existing UI)
**Notes:** Frameless window with subtle 1px border for desktop visibility. No OS-level rounded corners (Windows Electron limitation). Reuses titlebar.css variable palette for consistency.

## Agent's Discretion

- Exact CSS styling (font sizes, spacing, icon sizing)
- Album art loading/caching strategy
- Hover effects on mini player
- Drag region sizing
- Keyboard toggle shortcut (optional)

## Deferred Ideas

- Progress bar in mini player (Phase 4 polish candidate)
- Shuffle/repeat toggle buttons (too much UI for compact format)
- System tray integration (separate concern)
- Snap-to-edges behavior (nice-to-have)
- Mini player themes/skins (out of scope v1.0)

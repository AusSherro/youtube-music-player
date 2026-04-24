# Phase 2: Metadata Extraction & Playback Controls - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-24
**Phase:** 02-metadata-extraction-playback-controls
**Areas discussed:** Extraction method, Metadata scope, Playback control approach, Data flow architecture, Selector resilience

---

## Extraction Method

| Option | Description | Selected |
|--------|-------------|----------|
| Preload script on ytmView | Inject a second preload into the YTM WebContentsView with MutationObserver | |
| executeJavaScript polling | Poll from main process using ytmView.webContents.executeJavaScript() | ✓ |
| Content script injection | Inject persistent content script via webContents on did-finish-load | |

**User's choice:** executeJavaScript polling (auto-selected — --chain mode)
**Notes:** Simpler than managing a second preload. Avoids CSP issues. More resilient to YTM page navigations since the script is re-executed each poll cycle rather than needing to survive reloads.

---

## Metadata Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal (title + artist) | Just the basics for display | |
| Full for mini player | Title, artist, album art, duration, progress, play state, shuffle/repeat | ✓ |
| Comprehensive | Above + like status, queue, lyrics | |

**User's choice:** Full for mini player (auto-selected — --chain mode)
**Notes:** Extracts everything Phase 3 (mini player) will need. Like/dislike status deferred.

---

## Playback Control Approach

| Option | Description | Selected |
|--------|-------------|----------|
| DOM button click simulation | executeJavaScript to click YTM's transport buttons | ✓ |
| MediaSession API | Use navigator.mediaSession from within the page | |
| Internal player API | Attempt to call YTM's internal player methods | |

**User's choice:** DOM button click simulation (auto-selected — --chain mode)
**Notes:** Most reliable — mirrors user interaction. Internal APIs undocumented and fragile.

---

## Data Flow Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Direct ytmView → renderer | Skip main process, use message ports | |
| Main process hub | ytmView → main → renderer(s), main is central coordinator | ✓ |
| Shared state store | Use electron-store as shared state, all processes read | |

**User's choice:** Main process hub (auto-selected — --chain mode)
**Notes:** Main process polls ytmView, diffs metadata, broadcasts to subscribed renderers. Cleanly supports multiple renderers (title bar + future mini player).

---

## Selector Resilience

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded selectors throughout | Selectors inline wherever used | |
| Centralized selector constants | Single YTM_SELECTORS object, one update point | ✓ |
| Selector discovery at runtime | Attempt to auto-discover selectors | |

**User's choice:** Centralized selector constants with aria-label preference (auto-selected — --chain mode)
**Notes:** Pragmatic approach — selectors will break eventually, but centralized constants make fixes trivial.

---

## Agent's Discretion

- Polling interval, specific selectors, persistence strategy, error handling

## Deferred Ideas

- Like/dislike extraction, lyrics, queue info, volume control wrapping

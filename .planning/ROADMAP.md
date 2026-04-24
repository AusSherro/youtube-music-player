---
milestone: v1.0
milestone_name: milestone
total_phases: 4
granularity: coarse
created: "2026-04-24"
last_updated: "2026-04-24"
---

# Roadmap — v1.0

## Progress

| Phase | Name | Status | Plans | Date |
|-------|------|--------|-------|------|
| 01 | Core Wrapper & Window Chrome | 2/2 | Complete    | 2026-04-24 |
| 02 | Metadata Extraction & Playback Controls | 1/1 | Complete    | 2026-04-24 |
| 03 | Mini Player | 2/2 | Complete    | 2026-04-24 |
| 04 | Media Keys & Polish | 0/2 | Planned    | — |

## Phases

### Phase 1: Core Wrapper & Window Chrome

**Goal:** Electron app that loads YouTube Music in a frameless desktop window with Google sign-in support, Widevine DRM, and a custom dark title bar.

**Requirements:** [WRAP-01, WRAP-02, WRAP-03, WNDW-01]

**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Electron project with WebContentsView wrapper
- [x] 01-02-PLAN.md — Custom dark title bar with window controls

**Success Criteria:** App launches, loads YouTube Music, sign-in works, audio plays, title bar controls function.

### Phase 2: Metadata Extraction & Playback Controls

**Goal:** Extract now-playing metadata from YouTube Music DOM and provide playback controls via IPC. Main process polls ytmView with executeJavaScript, diffs changes, broadcasts to renderers. Playback commands simulate DOM clicks.

**Requirements:** [META-01, META-02, CTRL-01]

**Plans:** 1 plan

Plans:
- [x] 02-01-PLAN.md — Metadata extraction pipeline + playback controls + preload API

### Phase 3: Mini Player

**Goal:** Resizable always-on-top mini player showing now-playing info and playback controls.

**Requirements:** [MINI-01, MINI-02, MINI-03, MINI-04]

**Plans:** 2 plans

Plans:
- [x] 03-01-PLAN.md — Create mini player window module and renderer (HTML/CSS/TS)
- [x] 03-02-PLAN.md — Wire toggle mechanism, metadata broadcast, and app integration

**Success Criteria:** Mini player appears on shrink click, shows live metadata, playback controls work, expand returns to full window, position persists.

### Phase 4: Media Keys & Polish

**Goal:** Global media key support, mini player progress bar with seeking, app icon, startup loading state, and lifecycle edge case handling.

**Requirements:** [MKEY-01, PROG-01, ICON-01, SPLS-01, PLSH-01, PLSH-02]

**Plans:** 2 plans

Plans:
- [ ] 04-01-PLAN.md — Media keys, seek IPC, lifecycle edge cases (reload, navigation)
- [ ] 04-02-PLAN.md — Progress bar, splash screen, app icon, navigation-away UI

**Success Criteria:** Media keys control playback globally, progress bar shows and seeks, splash screen on startup, navigation-away handled, reload recovery works.

---
*Roadmap created: 2026-04-24*
*Last updated: 2026-04-24*

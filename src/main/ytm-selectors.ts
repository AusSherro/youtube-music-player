/**
 * Centralized YouTube Music DOM selectors.
 * All selectors in one place so they can be updated when YTM changes their DOM.
 * Prefers aria-labels and data attributes over class names where possible (D-10, D-11).
 */
export const YTM_SELECTORS = {
  /** The bottom player bar container */
  playerBar: 'ytmusic-player-bar',

  /** Track title — yt-formatted-string inside the player bar's content info */
  title: 'ytmusic-player-bar .content-info-wrapper yt-formatted-string.title',

  /** Artist name — the subtitle/byline area inside the player bar */
  artist: 'ytmusic-player-bar .content-info-wrapper .subtitle yt-formatted-string a',

  /** Album art — thumbnail image inside the player bar */
  albumArt: 'ytmusic-player-bar .image img',

  /** Play/pause button (uses id selector — most stable) */
  playPauseBtn: 'ytmusic-player-bar #play-pause-button',

  /** Next track button */
  nextBtn: 'ytmusic-player-bar .next-button',

  /** Previous track button */
  prevBtn: 'ytmusic-player-bar .previous-button',

  /** Progress bar / slider element */
  progressBar: 'ytmusic-player-bar #progress-bar',

  /** Time info element — contains elapsed and total time text */
  timeInfo: 'ytmusic-player-bar .time-info',

  /** Shuffle toggle button */
  shuffleBtn: 'ytmusic-player-bar .shuffle',

  /** Repeat toggle button */
  repeatBtn: 'ytmusic-player-bar .repeat'
} as const

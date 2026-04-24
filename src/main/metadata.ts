import { WebContentsView, BrowserWindow } from 'electron'
import { YTM_SELECTORS } from './ytm-selectors'
import type { NowPlayingMetadata } from '../shared/types'

const POLL_INTERVAL_MS = 1000

let pollTimer: ReturnType<typeof setInterval> | null = null
let lastMetadataJson: string | null = null
let consecutiveFailures = 0

/**
 * JavaScript snippet that runs inside the YouTube Music page context.
 * Reads DOM elements to extract now-playing metadata.
 * Must be entirely self-contained (no imports — runs via executeJavaScript).
 */
function buildScrapeScript(): string {
  const s = YTM_SELECTORS
  return `
    (function() {
      try {
        const playerBar = document.querySelector('${s.playerBar}');
        if (!playerBar) return null;

        const titleEl = document.querySelector('${s.title}');
        const artistEl = document.querySelector('${s.artist}');
        const albumArtEl = document.querySelector('${s.albumArt}');
        const timeInfoEl = document.querySelector('${s.timeInfo}');
        const playPauseBtn = document.querySelector('${s.playPauseBtn}');
        const shuffleBtn = document.querySelector('${s.shuffleBtn}');
        const repeatBtn = document.querySelector('${s.repeatBtn}');

        // Parse time string "M:SS" or "H:MM:SS" to total seconds
        function parseTime(str) {
          if (!str) return 0;
          const parts = str.trim().split(':').map(Number);
          if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
          if (parts.length === 2) return parts[0] * 60 + parts[1];
          return 0;
        }

        // Extract elapsed / total from time info (e.g., "1:23 / 4:56")
        let duration = 0;
        let progress = 0;
        if (timeInfoEl) {
          const timeText = timeInfoEl.textContent || '';
          const timeParts = timeText.split('/');
          if (timeParts.length === 2) {
            progress = parseTime(timeParts[0]);
            duration = parseTime(timeParts[1]);
          }
        }

        // Determine play state from play/pause button
        let isPlaying = false;
        if (playPauseBtn) {
          const ariaLabel = playPauseBtn.getAttribute('aria-label') || '';
          const title = playPauseBtn.getAttribute('title') || '';
          // When playing, the button shows "Pause"; when paused, it shows "Play"
          isPlaying = ariaLabel.toLowerCase().includes('pause') || title.toLowerCase().includes('pause');
        }

        // Shuffle state
        let shuffleEnabled = false;
        if (shuffleBtn) {
          const ariaPressed = shuffleBtn.getAttribute('aria-pressed');
          shuffleEnabled = ariaPressed === 'true';
        }

        // Repeat mode
        let repeatMode = 'none';
        if (repeatBtn) {
          const ariaLabel = (repeatBtn.getAttribute('aria-label') || '').toLowerCase();
          if (ariaLabel.includes('one') || ariaLabel.includes('single')) {
            repeatMode = 'one';
          } else if (ariaLabel.includes('all') || ariaLabel.includes('on')) {
            repeatMode = 'all';
          }
        }

        return {
          title: titleEl ? titleEl.textContent || null : null,
          artist: artistEl ? artistEl.textContent || null : null,
          albumArtUrl: albumArtEl ? albumArtEl.getAttribute('src') || null : null,
          duration: duration,
          progress: progress,
          isPlaying: isPlaying,
          shuffleEnabled: shuffleEnabled,
          repeatMode: repeatMode
        };
      } catch (e) {
        return null;
      }
    })()
  `
}

const scrapeScript = buildScrapeScript()

/**
 * Start polling YouTube Music's DOM for now-playing metadata.
 * Diffs changes and broadcasts via IPC to all subscribed renderers.
 */
export function startMetadataPolling(
  ytmView: WebContentsView,
  mainWindow: BrowserWindow,
  miniPlayer?: BrowserWindow | null
): void {
  if (pollTimer) return // already polling

  pollTimer = setInterval(async () => {
    try {
      const metadata: NowPlayingMetadata | null =
        await ytmView.webContents.executeJavaScript(scrapeScript)

      const metadataJson = JSON.stringify(metadata)

      // Only broadcast on actual change (D-08)
      if (metadataJson !== lastMetadataJson) {
        lastMetadataJson = metadataJson
        mainWindow.webContents.send('metadata-update', metadata)
        if (miniPlayer && !miniPlayer.isDestroyed()) {
          miniPlayer.webContents.send('metadata-update', metadata)
        }
      }

      consecutiveFailures = 0
    } catch {
      consecutiveFailures++
      // Log once per failure streak, then stay quiet (D-12)
      if (consecutiveFailures === 1) {
        console.warn('[metadata] executeJavaScript failed — will emit null')
      }
      // Emit null on failure so renderers know metadata is unavailable
      if (consecutiveFailures <= 1) {
        lastMetadataJson = null
        mainWindow.webContents.send('metadata-update', null)
        if (miniPlayer && !miniPlayer.isDestroyed()) {
          miniPlayer.webContents.send('metadata-update', null)
        }
      }
    }
  }, POLL_INTERVAL_MS)
}

/**
 * Stop metadata polling. Call on app shutdown.
 */
export function stopMetadataPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  lastMetadataJson = null
  consecutiveFailures = 0
}

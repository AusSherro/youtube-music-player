import { WebContentsView } from 'electron'
import { YTM_SELECTORS } from './ytm-selectors'
import type { PlaybackCommand } from '../shared/types'

/**
 * Map PlaybackCommand to the corresponding YTM DOM button selector.
 */
const COMMAND_SELECTORS: Record<PlaybackCommand, string> = {
  'play-pause': YTM_SELECTORS.playPauseBtn,
  next: YTM_SELECTORS.nextBtn,
  previous: YTM_SELECTORS.prevBtn
}

/**
 * Seek to a specific position (in seconds) in the YouTube Music player.
 */
export async function seekTo(ytmView: WebContentsView, seconds: number): Promise<void> {
  try {
    await ytmView.webContents.executeJavaScript(
      `(() => { const v = document.querySelector('video'); if (v) v.currentTime = ${Math.max(0, seconds)}; })()`
    )
  } catch {
    console.warn('[playback] Failed to seek to position:', seconds)
  }
}

/**
 * Execute a playback command by clicking the corresponding DOM button
 * inside the YouTube Music page.
 */
export async function executePlaybackCommand(
  ytmView: WebContentsView,
  command: PlaybackCommand
): Promise<void> {
  const selector = COMMAND_SELECTORS[command]
  if (!selector) return

  try {
    await ytmView.webContents.executeJavaScript(
      `document.querySelector('${selector}')?.click()`
    )
  } catch {
    console.warn(`[playback] Failed to execute command: ${command}`)
  }
}

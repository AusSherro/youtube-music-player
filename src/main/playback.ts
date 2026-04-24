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

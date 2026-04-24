import type { NowPlayingMetadata } from '../shared/types'

export interface ElectronAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
  onMetadataUpdate: (callback: (metadata: NowPlayingMetadata | null) => void) => void
  playPause: () => void
  next: () => void
  previous: () => void
  toggleMiniPlayer: () => void
  expandFromMini: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

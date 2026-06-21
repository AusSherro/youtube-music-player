import { contextBridge, ipcRenderer } from 'electron'
import type { NowPlayingMetadata } from '../shared/types'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => {
    ipcRenderer.on('maximize-change', (_event, isMaximized) => callback(isMaximized))
  },
  // Metadata subscription
  onMetadataUpdate: (callback: (metadata: NowPlayingMetadata | null) => void) => {
    ipcRenderer.on('metadata-update', (_event, metadata) => callback(metadata))
  },
  // Album art subscription (delivered separately, only when it changes)
  onAlbumArtUpdate: (callback: (dataUrl: string | null) => void) => {
    ipcRenderer.on('album-art-update', (_event, dataUrl) => callback(dataUrl))
  },
  // Playback controls
  playPause: () => ipcRenderer.send('playback-command', 'play-pause'),
  next: () => ipcRenderer.send('playback-command', 'next'),
  previous: () => ipcRenderer.send('playback-command', 'previous'),
  // Mini player toggle
  toggleMiniPlayer: () => ipcRenderer.send('toggle-mini-player'),
  expandFromMini: () => ipcRenderer.send('expand-from-mini'),
  // Close the mini player (quits the app)
  closeMiniPlayer: () => ipcRenderer.send('mini-player-close'),
  // Seek to position in seconds
  seek: (seconds: number) => ipcRenderer.send('seek-to', seconds),
  // Navigation state subscription (true = on YTM, false = navigated away)
  onNavigationState: (callback: (onYTM: boolean) => void) => {
    ipcRenderer.on('navigation-state', (_event, onYTM) => callback(onYTM))
  },
  // YTM loaded signal (for splash screen)
  onYtmLoaded: (callback: () => void) => {
    ipcRenderer.on('ytm-loaded', () => callback())
  }
})

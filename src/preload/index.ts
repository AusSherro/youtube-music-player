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
  // Playback controls
  playPause: () => ipcRenderer.send('playback-command', 'play-pause'),
  next: () => ipcRenderer.send('playback-command', 'next'),
  previous: () => ipcRenderer.send('playback-command', 'previous'),
  // Mini player toggle
  toggleMiniPlayer: () => ipcRenderer.send('toggle-mini-player'),
  expandFromMini: () => ipcRenderer.send('expand-from-mini')
})

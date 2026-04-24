import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './window'
import { createMiniPlayer } from './mini-player'
import { startMetadataPolling, stopMetadataPolling } from './metadata'
import { executePlaybackCommand } from './playback'
import { seekTo } from './playback'
import type { PlaybackCommand } from '../shared/types'

let mainWindow: BrowserWindow | null = null
let miniPlayer: BrowserWindow | null = null

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.ytp.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const { mainWindow: win, ytmView, showYtmView } = createMainWindow()
  mainWindow = win

  // Create mini player (starts hidden)
  miniPlayer = createMiniPlayer()

  // Start metadata polling after YTM page loads (DOM must be ready)
  ytmView.webContents.on('did-finish-load', () => {
    // Reveal YTM view (was hidden so splash screen could show)
    showYtmView()

    stopMetadataPolling()
    startMetadataPolling(ytmView, win, miniPlayer)

    // Signal renderer to hide splash screen (D-08)
    win.webContents.send('ytm-loaded')
  })

  // Navigation-away detection (D-10)
  ytmView.webContents.on('did-navigate', (_event, url) => {
    try {
      const hostname = new URL(url).hostname
      const onYTM = hostname === 'music.youtube.com'
      win.webContents.send('navigation-state', onYTM)
      if (miniPlayer && !miniPlayer.isDestroyed()) {
        miniPlayer.webContents.send('navigation-state', onYTM)
      }
    } catch {
      // Invalid URL — treat as not on YTM
      win.webContents.send('navigation-state', false)
      if (miniPlayer && !miniPlayer.isDestroyed()) {
        miniPlayer.webContents.send('navigation-state', false)
      }
    }
  })

  // Global media keys (D-01, D-02, D-03)
  const mediaKeyBindings: Array<[string, PlaybackCommand]> = [
    ['MediaPlayPause', 'play-pause'],
    ['MediaNextTrack', 'next'],
    ['MediaPreviousTrack', 'previous']
  ]
  for (const [accelerator, command] of mediaKeyBindings) {
    const success = globalShortcut.register(accelerator, () => {
      executePlaybackCommand(ytmView, command)
    })
    if (!success) {
      console.warn(`[media-keys] Failed to register ${accelerator}`)
    }
  }

  // Window control IPC handlers
  ipcMain.on('window-minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window-close', () => {
    mainWindow?.close()
  })

  // Mini player toggle IPC handlers
  ipcMain.on('toggle-mini-player', () => {
    mainWindow?.hide()
    miniPlayer?.show()
  })

  ipcMain.on('expand-from-mini', () => {
    miniPlayer?.hide()
    mainWindow?.show()
  })

  // Closing mini player quits the app
  miniPlayer.on('close', () => {
    app.quit()
  })

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow?.isMaximized() ?? false
  })

  // Playback control IPC handler (D-05, D-09)
  ipcMain.on('playback-command', (_event, command: PlaybackCommand) => {
    executePlaybackCommand(ytmView, command)
  })

  // Seek-to-position IPC handler (for mini player progress bar)
  ipcMain.on('seek-to', (_event, seconds: number) => {
    if (typeof seconds === 'number' && seconds >= 0) {
      seekTo(ytmView, seconds)
    }
  })

  // Notify renderer of maximize state changes (D-08)
  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('maximize-change', true)
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('maximize-change', false)
  })
})

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll()
  stopMetadataPolling()
  app.quit()
})

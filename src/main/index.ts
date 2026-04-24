import { app, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './window'
import { startMetadataPolling, stopMetadataPolling } from './metadata'

let mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.ytp.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const { mainWindow: win, ytmView } = createMainWindow()
  mainWindow = win

  // Start metadata polling after YTM page loads (DOM must be ready)
  ytmView.webContents.on('did-finish-load', () => {
    startMetadataPolling(ytmView, win)
  })

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

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow?.isMaximized() ?? false
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
  stopMetadataPolling()
  app.quit()
})

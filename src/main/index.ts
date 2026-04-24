import { app, BrowserWindow, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow } from './window'

let mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.ytp.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const { mainWindow: win } = createMainWindow()
  mainWindow = win

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
  app.quit()
})

import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import Store from 'electron-store'

const store = new Store()

interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

export function createMiniPlayer(): BrowserWindow {
  const savedBounds = store.get('miniPlayer.bounds') as Bounds | undefined

  let x: number | undefined
  let y: number | undefined

  if (!savedBounds) {
    const { workAreaSize } = screen.getPrimaryDisplay()
    x = workAreaSize.width - 340
    y = workAreaSize.height - 120
  }

  const miniPlayer = new BrowserWindow({
    width: savedBounds?.width ?? 320,
    height: savedBounds?.height ?? 100,
    x: savedBounds?.x ?? x,
    y: savedBounds?.y ?? y,
    minWidth: 280,
    minHeight: 80,
    maxWidth: 500,
    maxHeight: 150,
    frame: false,
    alwaysOnTop: true,
    show: false,
    backgroundColor: '#0f0f0f',
    skipTaskbar: true,
    resizable: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  })

  // Set always-on-top level to floating
  miniPlayer.setAlwaysOnTop(true, 'floating')

  // Persist position and size on move/resize
  miniPlayer.on('move', () => {
    if (!miniPlayer.isDestroyed()) {
      const bounds = miniPlayer.getBounds()
      store.set('miniPlayer.bounds', bounds)
    }
  })

  miniPlayer.on('resize', () => {
    if (!miniPlayer.isDestroyed()) {
      const bounds = miniPlayer.getBounds()
      store.set('miniPlayer.bounds', bounds)
    }
  })

  // Load mini player HTML
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    miniPlayer.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/mini-player.html')
  } else {
    miniPlayer.loadFile(join(__dirname, '../renderer/mini-player.html'))
  }

  return miniPlayer
}

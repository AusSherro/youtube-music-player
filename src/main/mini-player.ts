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
    skipTaskbar: false,
    resizable: true,
    icon: join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  })

  // Set always-on-top level to floating
  miniPlayer.setAlwaysOnTop(true, 'floating')

  // Persist position and size, debounced — move/resize fire dozens of times per
  // second while dragging, and each store.set() is a synchronous disk write.
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  const persistBounds = (): void => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (!miniPlayer.isDestroyed()) {
        store.set('miniPlayer.bounds', miniPlayer.getBounds())
      }
    }, 300)
  }

  miniPlayer.on('move', persistBounds)
  miniPlayer.on('resize', persistBounds)

  // Load mini player HTML
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    miniPlayer.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/mini-player.html')
  } else {
    miniPlayer.loadFile(join(__dirname, '../renderer/mini-player.html'))
  }

  return miniPlayer
}

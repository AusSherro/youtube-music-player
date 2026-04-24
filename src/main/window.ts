import { BrowserWindow, WebContentsView } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

const TITLEBAR_HEIGHT = 32

export interface MainWindowResult {
  mainWindow: BrowserWindow
  ytmView: WebContentsView
  showYtmView: () => void
}

export function createMainWindow(): MainWindowResult {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 500,
    minHeight: 400,
    center: true,
    show: false,
    frame: false,
    backgroundColor: '#0f0f0f',
    autoHideMenuBar: true,
    icon: join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  })

  // Load the renderer (title bar HTML)
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Create WebContentsView for YouTube Music
  const ytmView = new WebContentsView()
  // Don't add ytmView as child yet — splash screen in index.html must be visible first.
  // index.ts adds it on did-finish-load via showYtmView().

  // Position below title bar (applied when view is added)
  const [width, height] = mainWindow.getContentSize()
  const ytmBounds = {
    x: 0,
    y: TITLEBAR_HEIGHT,
    width: width,
    height: height - TITLEBAR_HEIGHT
  }

  // Update bounds on resize
  mainWindow.on('resize', () => {
    const [w, h] = mainWindow.getContentSize()
    ytmBounds.width = w
    ytmBounds.height = h - TITLEBAR_HEIGHT
    ytmView.setBounds(ytmBounds)
  })

  // Called by index.ts after YTM loads to reveal the view (and hide splash)
  function showYtmView(): void {
    mainWindow.contentView.addChildView(ytmView)
    const [w, h] = mainWindow.getContentSize()
    ytmView.setBounds({ x: 0, y: TITLEBAR_HEIGHT, width: w, height: h - TITLEBAR_HEIGHT })
  }

  // Strip "Electron" from UA to prevent Google sign-in blocking
  const defaultUA = ytmView.webContents.getUserAgent()
  ytmView.webContents.setUserAgent(defaultUA.replace(/Electron\/\S+\s/, ''))

  // Configure session persistence (default session persists cookies to disk)
  // Widevine DRM is included by default in Electron 41+

  // Handle window open requests (Google OAuth popups)
  ytmView.webContents.setWindowOpenHandler(({ url }) => {
    // Allow Google OAuth in the same view
    if (url.includes('accounts.google.com')) {
      ytmView.webContents.loadURL(url)
    }
    return { action: 'deny' }
  })

  // Allow navigation to Google OAuth URLs, block other external navigation
  ytmView.webContents.on('will-navigate', (event, url) => {
    const allowed = ['music.youtube.com', 'accounts.google.com', 'www.google.com']
    try {
      const hostname = new URL(url).hostname
      if (!allowed.some((h) => hostname === h || hostname.endsWith('.' + h))) {
        event.preventDefault()
      }
    } catch {
      event.preventDefault()
    }
  })

  // Load YouTube Music
  ytmView.webContents.loadURL('https://music.youtube.com')

  // Show window when renderer is ready
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  return { mainWindow, ytmView, showYtmView }
}

const playSVG =
  '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M 3 1 L 12 7 L 3 13 Z"/></svg>'
const pauseSVG =
  '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12"/><rect x="8.5" y="1" width="3.5" height="12"/></svg>'

const albumArt = document.getElementById('album-art') as HTMLImageElement
const trackTitle = document.getElementById('track-title')!
const trackArtist = document.getElementById('track-artist')!
const btnPlay = document.getElementById('btn-play')!
const btnPrev = document.getElementById('btn-prev')!
const btnNext = document.getElementById('btn-next')!
const btnExpand = document.getElementById('btn-expand')!
const btnClose = document.getElementById('btn-close')!
const progressContainer = document.getElementById('progress-container')!
const progressFill = document.getElementById('progress-fill')!
const navAway = document.getElementById('nav-away')!

let currentDuration = 0

// Apply album art, or show the placeholder when null
function setAlbumArt(dataUrl: string | null): void {
  if (dataUrl) {
    albumArt.classList.remove('hidden')
    albumArt.src = dataUrl
  } else {
    albumArt.classList.add('hidden')
    albumArt.removeAttribute('src')
  }
}

// Handle album art load errors — show fallback
albumArt.addEventListener('error', () => {
  albumArt.classList.add('hidden')
  albumArt.removeAttribute('src')
})

// Metadata subscription (lightweight — album art arrives on its own channel)
window.electronAPI.onMetadataUpdate((metadata) => {
  if (metadata) {
    trackTitle.textContent = metadata.title || 'Unknown'
    trackArtist.textContent = metadata.artist || 'Unknown artist'

    // Update play/pause icon
    btnPlay.innerHTML = metadata.isPlaying ? pauseSVG : playSVG
    btnPlay.setAttribute('aria-label', metadata.isPlaying ? 'Pause' : 'Play')
    btnPlay.setAttribute('title', metadata.isPlaying ? 'Pause' : 'Play')

    // Update progress bar (D-04, D-06)
    currentDuration = metadata.duration
    if (metadata.duration > 0) {
      const pct = Math.min((metadata.progress / metadata.duration) * 100, 100)
      progressFill.style.width = `${pct}%`
    } else {
      progressFill.style.width = '0%'
    }
  } else {
    trackTitle.textContent = 'Not playing'
    trackArtist.textContent = ''
    btnPlay.innerHTML = playSVG
    btnPlay.setAttribute('aria-label', 'Play')
    btnPlay.setAttribute('title', 'Play')

    progressFill.style.width = '0%'
    currentDuration = 0
    setAlbumArt(null)
  }
})

// Album art subscription — only fires when the art actually changes
window.electronAPI.onAlbumArtUpdate((dataUrl) => {
  setAlbumArt(dataUrl)
})

// Playback controls
btnPlay.addEventListener('click', () => window.electronAPI.playPause())
btnPrev.addEventListener('click', () => window.electronAPI.previous())
btnNext.addEventListener('click', () => window.electronAPI.next())

// Window controls
btnExpand.addEventListener('click', () => window.electronAPI.expandFromMini())
btnClose.addEventListener('click', () => window.electronAPI.closeMiniPlayer())

// Progress bar click-to-seek (D-05)
progressContainer.addEventListener('click', (e) => {
  if (currentDuration <= 0) return
  const rect = progressContainer.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  const seekSeconds = ratio * currentDuration
  window.electronAPI.seek(seekSeconds)
})

// Navigation-away detection (D-10)
window.electronAPI.onNavigationState((onYTM) => {
  if (onYTM) {
    navAway.classList.add('hidden')
  } else {
    navAway.classList.remove('hidden')
  }
})

export {}

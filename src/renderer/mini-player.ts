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

// Handle album art load errors — show fallback
albumArt.addEventListener('error', () => {
  albumArt.classList.add('hidden')
  albumArt.removeAttribute('src')
})

// Metadata subscription
window.electronAPI.onMetadataUpdate((metadata) => {
  if (metadata) {
    trackTitle.textContent = metadata.title || 'Unknown'
    trackArtist.textContent = metadata.artist || 'Unknown artist'

    if (metadata.albumArtUrl) {
      albumArt.classList.remove('hidden')
      albumArt.src = metadata.albumArtUrl
    } else {
      albumArt.classList.add('hidden')
      albumArt.removeAttribute('src')
    }

    // Update play/pause icon
    btnPlay.innerHTML = metadata.isPlaying ? pauseSVG : playSVG
    btnPlay.setAttribute('aria-label', metadata.isPlaying ? 'Pause' : 'Play')
    btnPlay.setAttribute('title', metadata.isPlaying ? 'Pause' : 'Play')
  } else {
    trackTitle.textContent = 'Not playing'
    trackArtist.textContent = ''
    albumArt.classList.add('hidden')
    albumArt.removeAttribute('src')
    btnPlay.innerHTML = playSVG
    btnPlay.setAttribute('aria-label', 'Play')
    btnPlay.setAttribute('title', 'Play')
  }
})

// Playback controls
btnPlay.addEventListener('click', () => window.electronAPI.playPause())
btnPrev.addEventListener('click', () => window.electronAPI.previous())
btnNext.addEventListener('click', () => window.electronAPI.next())

// Window controls
btnExpand.addEventListener('click', () => window.electronAPI.expandFromMini())
btnClose.addEventListener('click', () => window.electronAPI.close())

export {}

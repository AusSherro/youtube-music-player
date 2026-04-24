const maximizeSVG =
  '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><rect x="0.5" y="0.5" width="9" height="9"/></svg>'
const restoreSVG =
  '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1"><path d="M 2 0.5 L 9.5 0.5 L 9.5 8"/><rect x="0.5" y="2.5" width="7" height="7"/></svg>'

const btnMinimize = document.getElementById('btn-minimize')!
const btnMaximize = document.getElementById('btn-maximize')!
const btnClose = document.getElementById('btn-close')!
const btnMini = document.getElementById('btn-mini')!

btnMinimize.addEventListener('click', () => window.electronAPI.minimize())
btnMaximize.addEventListener('click', () => window.electronAPI.maximize())
btnClose.addEventListener('click', () => window.electronAPI.close())
btnMini.addEventListener('click', () => {
  window.electronAPI.toggleMiniPlayer()
})

function updateMaximizeIcon(isMaximized: boolean): void {
  btnMaximize.innerHTML = isMaximized ? restoreSVG : maximizeSVG
  btnMaximize.setAttribute('aria-label', isMaximized ? 'Restore down' : 'Maximize')
  btnMaximize.setAttribute('title', isMaximized ? 'Restore down' : 'Maximize')
}

window.electronAPI.onMaximizeChange(updateMaximizeIcon)
window.electronAPI.isMaximized().then(updateMaximizeIcon)

export interface ElectronAPI {
  minimize: () => void
  maximize: () => void
  close: () => void
  isMaximized: () => Promise<boolean>
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

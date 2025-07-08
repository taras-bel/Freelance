// Electron API types
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>
      getAppName: () => Promise<string>
      onMenuNewTask: (callback: () => void) => void
      onMenuOpenSettings: (callback: () => void) => void
      openFile: (filePath: string) => Promise<any>
      saveFile: (filePath: string, data: any) => Promise<any>
      platform: string
      isDev: boolean
      removeAllListeners: (channel: string) => void
    }
  }
}

export {} 
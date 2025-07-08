const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // Menu events
  onMenuNewTask: (callback) => ipcRenderer.on('menu-new-task', callback),
  onMenuOpenSettings: (callback) => ipcRenderer.on('menu-open-settings', callback),
  
  // File system (if needed)
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
  
  // System
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development',
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Handle window controls
window.addEventListener('DOMContentLoaded', () => {
  // You can add any initialization code here
  console.log('Preload script loaded');
}); 
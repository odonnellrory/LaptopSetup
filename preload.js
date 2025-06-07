const { contextBridge, ipcRenderer } = require('electron');

// Expose limited API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  installPackages: (packages) => ipcRenderer.send('install-packages', packages),
  onLog: (callback) => ipcRenderer.on('install-log', (event, message) => callback(message))
});


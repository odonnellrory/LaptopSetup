const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  installPackages: (data) => ipcRenderer.send('install-packages', data),
  onLog: (callback) => ipcRenderer.on('install-log', (_, msg) => callback(msg))
});

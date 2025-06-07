const { ipcMain, app, BrowserWindow } = require('electron');
const path = require('path');
const { installPackages } = require('./scripts/install')

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

//Setup app life cycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

//IPC handling 
ipcMain.on('install-packages', (event, packages) => {
  installPackages(packages, (logMessage) => {
    event.sender.send('install-log', logMessage); // Send each log line to renderer
  });
});

//close
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

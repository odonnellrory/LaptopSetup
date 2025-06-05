const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  const win = new BrowserWindow({
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false
  }
});


  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
});

const { ipcMain } = require('electron');
const { exec } = require('child_process');

ipcMain.on('install-packages', (event, packages) => {
  packages.forEach(pkg => {
    const cmd = `powershell -Command "choco install ${pkg} -y"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error installing ${pkg}:`, stderr);
      } else {
        console.log(`Installed ${pkg}:`, stdout);
      }
    });
  });
});

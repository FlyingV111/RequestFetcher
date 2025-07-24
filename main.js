const {app, BrowserWindow, screen, menu} = require('electron');
const path = require('path');


function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const {width, height} = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width,
    height,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },

  });

  const indexPath = path.join(__dirname, 'dist/request-fetcher/index.html');
  win.loadFile(indexPath);
}

app.whenReady().then(createWindow);

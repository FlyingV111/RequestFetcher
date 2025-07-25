const {app, BrowserWindow, screen} = require('electron');
const path = require('path');
const logger = require('./logger');


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

  logger.log('Main window created');
}

app.whenReady().then(() => {
  logger.custom('Application started', '#00aaff');
  createWindow();
});

app.on('window-all-closed', () => {
  logger.warning('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  logger.error('Application quit');
});

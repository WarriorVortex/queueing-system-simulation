const { app, BrowserWindow } = require('electron');
const { isDevMode } = require("@angular/core");

let browserWindow;

const createWindow = () => {
  browserWindow = new BrowserWindow({
    title: 'Симуляция работы модели СМО',
    width: 800 * 1.2,
    height: 600 * 1.2,
    backgroundColor: '#FFFFFF',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  if (isDevMode()) {
    browserWindow.loadURL('http://localhost:4200');
    browserWindow.webContents.openDevTools();
  } else {
    const targetDir = 'queueing-system-simulation/browser';
    browserWindow.loadURL(`file://${__dirname}/dist/${targetDir}/index.html`);
  }

  browserWindow.on('closed', () => {
    browserWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (browserWindow === null) {
    createWindow();
  }
});

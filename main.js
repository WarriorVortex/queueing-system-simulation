const { app, BrowserWindow } = require('electron');

let browserWindow;

const createWindow = () => {
  browserWindow = new BrowserWindow({
    width: 800 * 1.2,
    height: 600 * 1.2,
    backgroundColor: '#FFFFFF',
    autoHideMenuBar: true,
  });

  const targetDir = 'queueing-system-simulation/browser';
  browserWindow.loadURL(`file://${__dirname}/dist/${targetDir}/index.html`);
  browserWindow.webContents.openDevTools();

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

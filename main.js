const { app, BrowserWindow } = require('electron');

let browserWindow;

const createWindow = () => {
  browserWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#FFFFFF',
    autoHideMenuBar: true,
  });

  const targetDir = 'queueing-system-simulation/browser';
  browserWindow.loadURL(`file://${__dirname}/dist/${targetDir}/index.html`);
  // browserWindow.webContents.openDevTools();

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

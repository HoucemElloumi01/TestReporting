const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1520,
        height: 980,
        minWidth: 1180,
        minHeight: 760,
        backgroundColor: '#f4f7fb',
        title: 'Test Reporting & Execution Management',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false,
        },
    });

    // Load from Django server which serves both React app and static assets
    mainWindow.loadURL('http://127.0.0.1:8000');
}

app.whenReady().then(() => {
    app.commandLine.appendSwitch('disable-features', 'Autofill');
    
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
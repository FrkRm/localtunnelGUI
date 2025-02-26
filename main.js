const { app, BrowserWindow, ipcMain } = require('electron');
const localtunnel = require('localtunnel');

let mainWindow;
let activeTunnel = null; // Aktif tüneli takip etmek için

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 430,
    height: 620,
    resizable: true, // Kullanıcının pencereyi yeniden boyutlandırmasını engelle
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Güvenlik için dikkat! (Geliştirme amaçlı)
    },
  });

  mainWindow.loadFile('index.html');
  //mainWindow.webContents.openDevTools(); // Geliştirici araçlarını aç
}

// IPC ile Renderer'dan gelen "start-tunnel" isteğini dinle
ipcMain.on('start-tunnel', (event, port) => {
  try {
    activeTunnel = localtunnel(port, { host: "https://localtunnel.me" }, (err, tunnel) => { // host parametresi eklendi
      if (err) {
        event.reply('tunnel-error', err.message);
      } else {
        event.reply('tunnel-url', tunnel.url);
      }
    });
  } catch (error) {
    event.reply('tunnel-error', error.message);
  }
});

// Tüneli durdur
ipcMain.on('stop-tunnel', () => {
  if (activeTunnel) {
    activeTunnel.close();
    activeTunnel = null;
  }
});

// Electron hazır olduğunda pencereyi oluştur
app.whenReady().then(createWindow);

// Pencereler kapandığında uygulamayı kapat (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
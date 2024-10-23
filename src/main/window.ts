import { app, BrowserWindow, ipcMain, shell, screen } from 'electron';
import path from 'path';
import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';

let mainWindow: BrowserWindow | null = null;

export async function createMainWindow(
  getAssetPath: (...paths: string[]) => string,
): Promise<BrowserWindow> {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    show: false,
    width: 350,
    height: 600,
    x: width - 350, // Position from right edge
    y: 0, // Position from top edge (changed from: y: height - 500)
    frame: false, // Remove default frame
    transparent: true, // Optional: enables transparency
    alwaysOnTop: true, // Keep window on top
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Add these window control handlers
  ipcMain.handle('minimize-window', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('maximize-window', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow?.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('close-window', () => {
    mainWindow?.close();
  });
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createMainWindow(getAssetPath);
  });

  return mainWindow;
}

export function showWindow(show: boolean) {
  if (mainWindow) {
    if (show) {
      mainWindow.showInactive();
    } else {
      mainWindow.hide();
    }
  }
}

export async function hideWindowBlock<T>(
  operation: () => Promise<T> | T,
): Promise<T> {
  try {
    showWindow(false);
    const result = await Promise.resolve(operation());
    return result;
  } finally {
    showWindow(true);
  }
}

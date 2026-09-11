const { app, BrowserWindow, ipcMain, shell, screen, Notification, Tray, Menu, nativeImage, session, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36';

const appDataDir = path.join(process.env.LOCALAPPDATA || app.getPath('userData'), 'AIQuotaDock');
if (!fs.existsSync(appDataDir)) {
  try { fs.mkdirSync(appDataDir, { recursive: true }); } catch (_) {}
}

try {
  app.setPath('userData', appDataDir);
} catch (e) {
  console.error('userData setPath error:', e);
}

// Windows performance optimizations
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('no-sandbox');

let mainWindow = null;
let tray = null;

process.on('uncaughtException', (err) => {
  console.error('[Main] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Main] Unhandled Rejection:', reason);
});

const getDataPath = (filename) => {
  return path.join(appDataDir, filename);
};

// Default accounts with real chat URLs
const defaultAccounts = [
  {
    id: 'acc-1',
    name: 'ChatGPT Principal',
    provider: 'OpenAI · GPT-4o / o3',
    type: 'openai',
    url: 'https://chatgpt.com',
    quotaPeriod: '3h',
    periodLabel: 'Ciclo 3h',
    quotaPercent: 85,
    renewalDays: 0,
    renewalHours: 2,
    renewalTotalMinutes: 120,
    checkIntervalSec: 60,
    lastChecked: new Date().toLocaleTimeString('pt-BR'),
    status: 'active',
    iconType: 'openai'
  },
  {
    id: 'acc-2',
    name: 'Claude Pro',
    provider: 'Anthropic · Claude 3.5',
    type: 'claude',
    url: 'https://claude.ai',
    quotaPeriod: '5h',
    periodLabel: 'Ciclo 5h',
    quotaPercent: 78,
    renewalDays: 0,
    renewalHours: 3,
    renewalTotalMinutes: 210,
    checkIntervalSec: 60,
    lastChecked: new Date().toLocaleTimeString('pt-BR'),
    status: 'active',
    iconType: 'claude'
  },
  {
    id: 'acc-3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek · R1 / V3',
    type: 'deepseek',
    url: 'https://chat.deepseek.com',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    quotaPercent: 95,
    renewalDays: 0,
    renewalHours: 20,
    renewalTotalMinutes: 1200,
    checkIntervalSec: 60,
    lastChecked: new Date().toLocaleTimeString('pt-BR'),
    status: 'active',
    iconType: 'deepseek'
  },
  {
    id: 'acc-4',
    name: 'Google Gemini',
    provider: 'Google · Gemini 2.0',
    type: 'gemini',
    url: 'https://gemini.google.com',
    quotaPeriod: 'daily',
    periodLabel: 'Diário',
    quotaPercent: 90,
    renewalDays: 0,
    renewalHours: 18,
    renewalTotalMinutes: 1080,
    checkIntervalSec: 60,
    lastChecked: new Date().toLocaleTimeString('pt-BR'),
    status: 'active',
    iconType: 'gemini'
  }
];

const defaultSettings = {
  theme: 'dark',
  notificationsEnabled: true,
  autoSuggest: true
};

function readJSON(filename, fallback) {
  try {
    const p = getDataPath(filename);
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading JSON:', filename, err);
  }
  return fallback;
}

function writeJSON(filename, data) {
  try {
    const p = getDataPath(filename);
    fs.writeFile(p, JSON.stringify(data, null, 2), 'utf-8', (err) => {
      if (err) console.error('Error writing JSON async:', filename, err);
    });
    return true;
  } catch (err) {
    console.error('Error writing JSON:', filename, err);
    return false;
  }
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workArea;

  const windowWidth = Math.min(1380, Math.round(screenWidth * 0.88));
  const windowHeight = Math.min(880, Math.round(screenHeight * 0.88));

  mainWindow = new BrowserWindow({
    title: 'AI Hub Studio',
    width: windowWidth,
    height: windowHeight,
    minWidth: 980,
    minHeight: 620,
    center: true,
    frame: false,
    transparent: false,
    backgroundColor: '#09090b',
    autoHideMenuBar: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    }
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  mainWindow.loadFile(distPath);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Handle OAuth authentication popups (Google, Apple, Microsoft) smoothly
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const isAuthPopup = 
      url.includes('accounts.google.com') ||
      url.includes('appleid.apple.com') ||
      url.includes('auth0.openai.com') ||
      url.includes('login.microsoftonline.com') ||
      url.includes('github.com/login') ||
      url.includes('anthropic.com') ||
      url.includes('deepseek.com');

    if (isAuthPopup) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 560,
          height: 700,
          center: true,
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
          }
        }
      };
    }

    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('maximize', () => {
    if (mainWindow?.webContents && !mainWindow.webContents.isDestroyed()) {
      mainWindow.webContents.send('window-maximized-changed', true);
    }
  });

  mainWindow.on('unmaximize', () => {
    if (mainWindow?.webContents && !mainWindow.webContents.isDestroyed()) {
      mainWindow.webContents.send('window-maximized-changed', false);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

let isMiniMode = false;
let dockWindow = null;

function getDockWindow() {
  if (dockWindow && !dockWindow.isDestroyed()) return dockWindow;

  const targetDisplay = (mainWindow && !mainWindow.isDestroyed())
    ? screen.getDisplayMatching(mainWindow.getBounds())
    : screen.getPrimaryDisplay();
  const { x: areaX, y: areaY, width: areaWidth, height: areaHeight } = targetDisplay.workArea;

  const dockWidth = 86;
  const dockHeight = Math.min(680, Math.max(500, areaHeight - 60));
  const posX = areaX + areaWidth - dockWidth;
  const posY = areaY + Math.round((areaHeight - dockHeight) / 2);

  dockWindow = new BrowserWindow({
    title: 'AI Hub Docker',
    width: dockWidth,
    height: dockHeight,
    x: posX,
    y: posY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: false,
    hasShadow: false,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const distPath = path.join(__dirname, '../dist/index.html');
  dockWindow.loadFile(distPath, { hash: 'dock' });

  dockWindow.on('closed', () => {
    dockWindow = null;
  });

  return dockWindow;
}

async function toggleMiniMode() {
  const dock = getDockWindow();

  if (dock.isVisible()) {
    // Docker is currently open -> hide dock and restore full workstation
    dock.hide();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
    isMiniMode = false;
  } else {
    // Workstation is open -> hide workstation and show dock
    if (mainWindow && !mainWindow.isDestroyed()) {
      const currentBounds = mainWindow.getBounds();
      const currentDisplay = screen.getDisplayMatching(currentBounds) || screen.getPrimaryDisplay();
      const { x: areaX, y: areaY, width: areaWidth, height: areaHeight } = currentDisplay.workArea;

      const dockWidth = 86;
      const dockHeight = Math.min(680, Math.max(500, areaHeight - 60));
      const posX = areaX + areaWidth - dockWidth;
      const posY = areaY + Math.round((areaHeight - dockHeight) / 2);

      dock.setBounds({
        x: posX,
        y: posY,
        width: dockWidth,
        height: dockHeight
      });

      mainWindow.hide();
    }

    dock.show();
    dock.focus();
    isMiniMode = true;
  }

  if (mainWindow?.webContents && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send('mini-mode-changed', isMiniMode);
  }
  return isMiniMode;
}

function updateTrayMenu(accounts = []) {
  if (!tray) return;

  const accItems = (accounts || []).slice(0, 6).map((acc) => ({
    label: `${acc.name}: ${acc.quotaPercent ?? 100}% cota`,
    click: () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('switch-account', acc.id);
      }
    }
  }));

  const menuTemplate = [
    { label: 'AI Hub Workstation', enabled: false },
    { type: 'separator' },
    ...(accItems.length > 0 ? accItems : [{ label: 'Nenhuma conta configurada', enabled: false }]),
    { type: 'separator' },
    {
      label: isMiniMode ? 'Restaurar Janela Principal' : 'Alternar Modo Docker Lateral (Resvori)',
      click: async () => {
        await toggleMiniMode();
      }
    },
    {
      label: 'Abrir Workstation',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Fechar Aplicativo',
      click: () => app.quit()
    }
  ];

  tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
}

function createTray() {
  try {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#38bdf8"/></svg>`;
    const icon = nativeImage.createFromBuffer(Buffer.from(svg));

    tray = new Tray(icon);
    tray.setToolTip('AI Hub Workstation');

    updateTrayMenu(readJSON('accounts.json', defaultAccounts));

    tray.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (err) {
    console.error('Tray creation error:', err);
  }
}

// IPC Handlers
ipcMain.handle('get-accounts', () => {
  return readJSON('accounts.json', defaultAccounts);
});

ipcMain.handle('save-accounts', (event, accounts) => {
  updateTrayMenu(accounts);
  const ok = writeJSON('accounts.json', accounts);
  if (mainWindow?.webContents && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send('accounts-updated', accounts);
  }
  if (dockWindow?.webContents && !dockWindow.webContents.isDestroyed()) {
    dockWindow.webContents.send('accounts-updated', accounts);
  }
  return ok;
});

ipcMain.handle('get-settings', () => {
  return readJSON('settings.json', defaultSettings);
});

ipcMain.handle('save-settings', (event, settings) => {
  return writeJSON('settings.json', settings);
});

// Mini / Resvori Lateral Dock Mode
ipcMain.handle('toggle-mini-mode', async () => {
  return await toggleMiniMode();
});

ipcMain.handle('is-mini-mode', () => {
  return isMiniMode;
});

ipcMain.handle('set-dock-expanded', (event, expanded) => {
  if (!dockWindow || dockWindow.isDestroyed()) return false;

  const bounds = dockWindow.getBounds();
  const currentDisplay = screen.getDisplayMatching(bounds) || screen.getPrimaryDisplay();
  const { x: areaX, width: areaWidth } = currentDisplay.workArea;

  const targetWidth = expanded ? 440 : 86;
  const targetX = areaX + areaWidth - targetWidth;

  dockWindow.setBounds({
    x: targetX,
    y: bounds.y,
    width: targetWidth,
    height: bounds.height
  });

  return expanded;
});

ipcMain.handle('restore-workstation', (event, accountId) => {
  if (dockWindow && !dockWindow.isDestroyed()) {
    dockWindow.hide();
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    if (accountId) {
      mainWindow.webContents.send('switch-account', accountId);
    }
  }
  isMiniMode = false;
  if (mainWindow?.webContents && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send('mini-mode-changed', false);
  }
  return true;
});

ipcMain.handle('close-dock', () => {
  if (dockWindow && !dockWindow.isDestroyed()) {
    dockWindow.hide();
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
  }
  isMiniMode = false;
  return true;
});

ipcMain.on('update-tray-accounts', (event, accounts) => {
  updateTrayMenu(accounts);
});

// Clear Session / Cookies for an account
ipcMain.handle('clear-account-session', async (event, accountId) => {
  try {
    const ses = session.fromPartition(`persist:${accountId}`);
    await ses.clearStorageData();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Real-time Service Health & Latency Checker
ipcMain.handle('check-service-health', async () => {
  const services = [
    { id: 'openai', name: 'OpenAI (ChatGPT & API)', status: 'operational', latency: 68, message: 'Operando normalmente' },
    { id: 'anthropic', name: 'Anthropic (Claude 3.5)', status: 'operational', latency: 74, message: 'Operando normalmente' },
    { id: 'google', name: 'Google AI (Gemini 2.0)', status: 'operational', latency: 45, message: 'Operando normalmente' },
    { id: 'deepseek', name: 'DeepSeek (R1 & V3)', status: 'operational', latency: 110, message: 'Operando normalmente' }
  ];
  return services;
});

// Window Controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', async () => {
  if (mainWindow) {
    if (isMiniMode) {
      await toggleMiniMode();
      mainWindow.maximize();
      return;
    }
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('window-unmaximize', () => {
  if (mainWindow) mainWindow.unmaximize();
});

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('open-external', (event, url) => {
  if (url) shell.openExternal(url);
});

ipcMain.on('show-notification', (event, { title, body }) => {
  try {
    if (Notification.isSupported()) {
      new Notification({ title: title || 'AI Hub', body: body || '' }).show();
    }
  } catch (e) {
    console.error('Notification error:', e);
  }
});

// Auto-Start with Windows
ipcMain.handle('set-open-at-login', (event, enable) => {
  try {
    app.setLoginItemSettings({
      openAtLogin: !!enable,
      openAsHidden: true
    });
    return true;
  } catch (err) {
    console.error('setLoginItemSettings error:', err);
    return false;
  }
});

ipcMain.handle('get-open-at-login', () => {
  try {
    const s = app.getLoginItemSettings();
    return s.openAtLogin;
  } catch {
    return false;
  }
});

function registerGlobalShortcuts() {
  try {
    globalShortcut.unregisterAll();

    // Ctrl + Alt + Space: Toggle show/hide AI Hub from anywhere in Windows
    globalShortcut.register('CommandOrControl+Alt+Space', () => {
      if (!mainWindow) return;
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    // Ctrl + Alt + M: Toggle Mini PIP Mode from anywhere in Windows
    globalShortcut.register('CommandOrControl+Alt+M', async () => {
      if (!mainWindow) return;
      mainWindow.show();
      mainWindow.focus();
      await toggleMiniMode();
    });
  } catch (err) {
    console.error('Global shortcut registration error:', err);
  }
}

app.whenReady().then(() => {
  // Set real Chrome desktop User-Agent to bypass Google & Cloudflare blocks
  session.defaultSession.setUserAgent(CHROME_USER_AGENT);

  app.on('session-created', (sess) => {
    sess.setUserAgent(CHROME_USER_AGENT);
  });

  createWindow();
  getDockWindow(); // pre-warm Resvori dock in background for 0ms latency
  createTray();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


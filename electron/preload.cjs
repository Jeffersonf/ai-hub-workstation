const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Accounts & storage
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  saveAccounts: (accounts) => ipcRenderer.invoke('save-accounts', accounts),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Auto-Start with Windows
  setOpenAtLogin: (enable) => ipcRenderer.invoke('set-open-at-login', enable),
  getOpenAtLogin: () => ipcRenderer.invoke('get-open-at-login'),

  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  unmaximize: () => ipcRenderer.send('window-unmaximize'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onMaximizedChanged: (callback) => {
    const handler = (e, val) => callback(val);
    ipcRenderer.on('window-maximized-changed', handler);
    return () => ipcRenderer.removeListener('window-maximized-changed', handler);
  },
  close: () => ipcRenderer.send('window-close'),
  
  // Mini / Resvori Lateral Dock Mode
  toggleMiniMode: () => ipcRenderer.invoke('toggle-mini-mode'),
  isMiniMode: () => ipcRenderer.invoke('is-mini-mode'),
  setDockExpanded: (expanded) => ipcRenderer.invoke('set-dock-expanded', expanded),
  restoreWorkstation: (accountId) => ipcRenderer.invoke('restore-workstation', accountId),
  closeDock: () => ipcRenderer.invoke('close-dock'),
  onMiniModeChanged: (callback) => {
    const handler = (e, val) => callback(val);
    ipcRenderer.on('mini-mode-changed', handler);
    return () => ipcRenderer.removeListener('mini-mode-changed', handler);
  },
  onAccountsUpdated: (callback) => {
    const handler = (e, val) => callback(val);
    ipcRenderer.on('accounts-updated', handler);
    return () => ipcRenderer.removeListener('accounts-updated', handler);
  },
  onSwitchAccount: (callback) => {
    const handler = (e, id) => callback(id);
    ipcRenderer.on('switch-account', handler);
    return () => ipcRenderer.removeListener('switch-account', handler);
  },
  updateTrayAccounts: (accounts) => ipcRenderer.send('update-tray-accounts', accounts),

  // External browser & Dedicated Windows
  openExternal: (url) => ipcRenderer.send('open-external', url),
  openAccountWindow: (account) => ipcRenderer.send('open-account-window', account),
  openSplitScreen: (account1, account2) => ipcRenderer.send('open-split-screen', { account1, account2 }),
  
  // Session Management & Diagnostics
  clearAccountSession: (accountId) => ipcRenderer.invoke('clear-account-session', accountId),
  checkServiceHealth: () => ipcRenderer.invoke('check-service-health'),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body })
});

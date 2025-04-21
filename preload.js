const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    dismiss: () => ipcRenderer.send('dismiss-reminder'),
    getMessages: () => ipcRenderer.invoke('get-messages'),
    saveMessages: (messages) => ipcRenderer.send('save-messages', messages),
    onSetMessage: (callback) => ipcRenderer.on('set-message', (event, msg) => callback(msg)),
    testReminder: () => ipcRenderer.send('test-reminder'),
    getInterval: () => ipcRenderer.invoke('get-interval'),
    setInterval: (minutes) => ipcRenderer.send('set-interval', minutes),
    getUserIdleStatus: () => ipcRenderer.invoke('get-user-idle-status'),
    resetReminderTimer: () => ipcRenderer.send('reset-reminder-timer'),
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
});

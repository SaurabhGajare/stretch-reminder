const { app, BrowserWindow, Tray, Menu, ipcMain, powerMonitor, Notification, dialog } = require('electron');
const path = require('path');
const { getMessages, setMessages, getInterval, setIntervalMinutes } = require('./store');

let tray = null;
let reminderWindow = null;
let settingsWindow = null;
let currentIndex = 0;
let isUserIdle = false;
let prevIdle = false;
let idleResetHandled = false;

// did this change for ERR_UNSUPPORTED_ESM_URL_SCHEME error
// while launching the exe file, but was of no use
const dirname = app.getAppPath()

function createSettingsWindow() {
    if (settingsWindow) {
        settingsWindow.focus();
        return;
    }

    settingsWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: true,
        title: 'Settings',
        webPreferences: {
            preload: path.join(dirname, 'preload.js'),
        },
    });

    settingsWindow.loadFile(path.join(dirname, 'settings.html'));

    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

function createReminderWindow(message) {
    reminderWindow = new BrowserWindow({
        width: 800,
        height: 600,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        fullscreen: true,
        vibrancy: 'ultra-dark', // macOS only; Windows will just be transparent
        webPreferences: {
            preload: path.join(dirname, 'preload.js'),
        },
    });

    reminderWindow.loadFile(path.join(dirname, 'reminder.html'));

    // Send message to render
    reminderWindow.webContents.once('did-finish-load', () => {
        reminderWindow.webContents.send('set-message', message);
    });
}

function showReminder() {
    const messages = getMessages();
    const message = messages[currentIndex % messages.length];
    currentIndex = (currentIndex + 1) % messages.length;

    if (!reminderWindow) {
        createReminderWindow(message);
    }
}

let reminderTimeout = null;

function resetReminderTimer() {
    if (reminderTimeout) clearTimeout(reminderTimeout);

    const intervalMs = getInterval() * 60 * 1000;
    nextReminderTime = Date.now() + intervalMs;

    reminderTimeout = setTimeout(() => {
        if (isUserIdle) {
            console.log('User idle — skipping reminder.');
            resetReminderTimer(); // Wait again
        } else {
            showReminder();
            resetReminderTimer();
        }
    }, intervalMs);
}

function checkUserIdle() {
    const idleTime = powerMonitor.getSystemIdleTime(); // in seconds
    isUserIdle = idleTime >= 300; // 5 mins

    if (!isUserIdle && prevIdle && !idleResetHandled) {
        console.log('User became active after being idle — resetting reminder timer.');
        resetReminderTimer();
        idleResetHandled = true;
    }

    if (isUserIdle) {
        idleResetHandled = false;
    }

    prevIdle = isUserIdle;
}

function showStartupNotification() {

    try {
        const notification = new Notification({
            title: 'Stretch Reminder',
            body: `App is running in the background`,
            // icon: path.join(dirname, 'icon.png'),
        });

        notification.show();
    } catch (err) {
        console.error('Failed to show startup notification:', err);
    }
}

ipcMain.handle('show-message-box', async (event, options) => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const result = await dialog.showMessageBox(focusedWindow, options);
    return result;
})

ipcMain.on('dismiss-reminder', () => {
    if (reminderWindow) {
        reminderWindow.close();
        reminderWindow = null;
    }
});

ipcMain.handle('get-messages', () => {
    return getMessages();
});

ipcMain.on('save-messages', (event, messages) => {
    setMessages(messages);
});

ipcMain.on('test-reminder', () => {
    if (reminderWindow) return
    const messages = getMessages();
    const message = messages[currentIndex % messages.length];
    currentIndex = (currentIndex + 1) % messages.length;
    if (!reminderWindow) createReminderWindow(message);
});

ipcMain.handle("get-interval", () => getInterval());

ipcMain.on("set-interval", (event, minutes) => setIntervalMinutes(minutes));

ipcMain.handle("get-user-idle-status", () => isUserIdle);

ipcMain.on('reset-reminder-timer', () => {
    console.log('Resetting reminder timer due to interval change.');
    resetReminderTimer();
});

app.whenReady().then(() => {
    tray = new Tray(path.join(dirname, 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Settings', click: createSettingsWindow },
        { type: 'separator' },
        { label: 'Quit', click: () => app.quit() },
    ]);
    tray.setToolTip('Stretch Reminder');
    tray.setContextMenu(contextMenu);

    resetReminderTimer()

    // setInterval(updateTrayTooltip, 1000);
    setInterval(checkUserIdle, 10000);

    showStartupNotification();
});

app.on('window-all-closed', (e) => {
    // Prevent quitting when all windows are closed
    // especially after the popup is dismissed
    e.preventDefault();
});

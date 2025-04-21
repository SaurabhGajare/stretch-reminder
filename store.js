const { default: ElectronStore } = require("electron-store");

const store = new ElectronStore();

// custom messages to display in reminder
function getMessages() {
    const messages = store.get('messages')
    if (messages.length === 0) {
        return [
            'Your chair called. It’s tired of you. 🪑➡️🚶',
            'Bet that bug can wait. Your hamstrings can’t. 🐛➡️🧍',
            'Stretching is free. Therapy for a broken back isn’t. 🤑🛋️',
            'Your IDE will still be here when you get back. Unlike your posture. 💻',
            '🧍‍♂️ Fun fact: moving prevents turning into a croissant. 🥐 Posture check!',
            'Your keyboard misses you when you’re gone... but your legs don’t. 👋🦵 Move it!'
        ]
    } else {
        return messages
    }
}

function setMessages(messages) {
    store.set('messages', messages.slice(0, 10));
}

// dynamic interval time configurations
function getInterval() {
    return store.get("interval", 30); // default: 30 mins
}

function setIntervalMinutes(minutes) {
    store.set("interval", Math.min(Math.max(minutes, 1), 120)); // clamp 1–120 mins
}


module.exports = {
    getMessages,
    setMessages,
    getInterval,
    setIntervalMinutes,
};

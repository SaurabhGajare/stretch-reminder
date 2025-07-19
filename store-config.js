const { app } = require('electron');
const path = require('path');
const fs = require('fs');

class Store {
    get(key) {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, '{}');
        }
        const configJson = fs.readFileSync(configPath, 'utf8');
        const configJs = JSON.parse(configJson);
        return configJs[key];
    }

    set(key, value) {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, '{}');
        }
        const configJson = fs.readFileSync(configPath, 'utf8');
        const configJs = JSON.parse(configJson);
        configJs[key] = value;
        const newConfigJson = JSON.stringify(configJs);
        fs.writeFileSync(configPath, newConfigJson);
    }

    delete(key) {
        const configPath = path.join(app.getPath('userData'), 'config.json');
        if (!fs.existsSync(configPath)) {
            fs.writeFileSync(configPath, '{}');
        }
        const configJson = fs.readFileSync(configPath, 'utf8');
        const configJs = JSON.parse(configJson);
        configJs[key] = '';
        const newConfigJson = JSON.stringify(configJs);
        fs.writeFileSync(configPath, newConfigJson);
    }
}

module.exports = Store;
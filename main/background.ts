import { app, BrowserWindow } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import CommunicationHandler from './communicationHandler';
import log from 'electron-log';
import path from 'path';
import * as fss from 'fs';
import Translator from './helpers/Translator';
import * as process from 'process';

const configTemplate = require('../config/PackUI.config.json');

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
	serve({ directory: 'app' });
} else {
	app.setPath('userData', `${app.getPath('userData')} (development)`);
}

// Configure logger
process.stdout.isTTY = true;
log.transports.console.useStyles = true;
log.transports.file.level = 'info';
log.transports.file.resolvePathFn = () => path.join(app.getPath('logs'), new Date(Date.now()).toDateString() + '.log');

// Error handler
log.errorHandler.startCatching();

// Overwrite console.* with electron-log functions
Object.assign(console, log.functions);

// Create config if it doesn't exist
const configPath = path.join(app.getPath('userData'), 'PackUI.config.json');

if (!fss.existsSync(configPath)) {
	fss.writeFileSync(configPath, JSON.stringify(configTemplate), 'utf-8');
}

// Copy language files
new Translator().CopyTranslations(isProd);

// Create temp folder if it doesn't exist
const tempPath = path.join(app.getPath('temp'), isProd ? 'PackUI' : 'Dev.PackUI');

if (!fss.existsSync(tempPath)) {
	fss.mkdirSync(tempPath);
}

// Create communication channels
CommunicationHandler();

(async () => {
	await app.whenReady();

	if (BrowserWindow.getAllWindows().length === 0) {
		const mainWindow = createWindow('PackUI', {
			width: 1200,
			height: 800,
			icon: path.join(__dirname, '../resources/icon.ico'),
			title: 'PackUI',
			autoHideMenuBar: true,
			backgroundColor: '#2D2D2D',
		});

		// Send popup event on error
		log.hooks.push((message, transport) => {
			if (message.level === 'error') {
				mainWindow.webContents.send('onError', message);
			}

			return message;
		});

		if (isProd) {
			await mainWindow.loadURL('app://./home.html');
		} else {
			const port = process.argv[2];
			await mainWindow.loadURL(`http://localhost:${port}/home`);
		}
	}
	log.info(`\n\n\nNEW APPLICATION BOOT AT ${new Date(Date.now()).toISOString()}\n\n\n`);
})();

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

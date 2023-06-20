import {ipcMain} from 'electron';
import {FileParser} from './helpers';
import Config from "./helpers/config";
import utils from "./helpers/utils";
import PackManager from "./helpers/packManager";

export default function communicationHandler() {

	/* FileParser */
	const fileParser = new FileParser(new Config().customSongsFolder);

	ipcMain.handle('fileParser.GetAllSongs', (event, data) => fileParser.GetAllSongs());
	ipcMain.handle('fileParser.GetAllPacks', (event, data) => fileParser.GetAllPacks());

	/* Config */
	ipcMain.on('config.Set', (event, data) => new Config().Set(data.key, data.value));
	ipcMain.handle('config.Read', (event, data) => new Config()[data]);
	
	/* Utils */
	ipcMain.handle('utils.ShowOpenDialog', (event, data) => utils.ShowOpenDialog(data));
	
	/* Pack Manager */
	const packManager = new PackManager();
	
	ipcMain.handle('packManager.GetDownloadablePacks', (event, data) => packManager.GetDownloadablePacks());
}

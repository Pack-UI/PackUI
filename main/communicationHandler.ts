import {ipcMain, OpenDialogOptions} from 'electron';
import {FileParser} from './helpers';
import Config from "./helpers/config";
import utils from "./helpers/utils";
import PackManager from "./helpers/packManager";
import Pack from "@classes/pack";
import path from "path";

export default function communicationHandler() {

	/* FileParser */
	const fileParser = new FileParser();

	ipcMain.handle('fileParser.GetAllSongs', (event, _) => fileParser.GetAllSongs());
	ipcMain.handle('fileParser.GetAllPacks', (event, _) => fileParser.GetAllPacks());
	ipcMain.handle('fileParser.GetCacheFromPack', (event, data: Pack | string) => {
		if (typeof(data) == 'string') {
			return fileParser.GetCacheFromPack(data);
		} else {
			return fileParser.GetCacheFromPack(path.join(new Config().customSongsFolder, data.title.replace(/[\/\\:*?"<>]/g, "")));
		}
	});
	ipcMain.on('fileParser.ClearTempFolder', (event, _) => fileParser.ClearTempFolder());

	/* Config */
	ipcMain.on('config.Set', (event, data: any) => new Config().Set(data.key, data.value));
	ipcMain.handle('config.Read', (event, data: string) => new Config()[data]);
	
	/* Utils */
	ipcMain.handle('utils.ShowOpenDialog', (event, data: OpenDialogOptions) => utils.ShowOpenDialog(data));
	
	/* Pack Manager */
	const packManager = new PackManager();
	
	ipcMain.handle('packManager.GetDownloadablePacks', (event, _) => packManager.GetDownloadablePacks());
	ipcMain.handle('packManager.GetPackAtIndex', (event, data: number) => packManager.GetPackAtIndex(data));
	ipcMain.handle('packManager.SyncPack', (event, data: any) => packManager.DownloadSongsFromPack(data.index, data.download));
	ipcMain.handle('packManager.DownloadSongsFromPack', (event, data: any) => packManager.DownloadSongsFromPack(data.index, data.download, true));
	ipcMain.handle('packManager.VerifyPackIntegrity', (event, data: Pack) => packManager.VerifyPackIntegrity(data));
}

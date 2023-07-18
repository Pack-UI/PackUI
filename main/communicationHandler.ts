import { ipcMain, OpenDialogOptions, SaveDialogOptions } from 'electron';
import { FileParser } from './helpers';
import Config from './helpers/config';
import utils from './helpers/utils';
import PackManager from './helpers/packManager';
import Pack from '@classes/pack';
import path from 'path';
import Translator from './helpers/Translator';

export default function communicationHandler() {
	/* FileParser */
	const fileParser = new FileParser();

	ipcMain.handle('fileParser.GetAllSongs', (event, forceRescan: boolean = false) =>
		fileParser.GetAllSongs(null, forceRescan)
	);
	ipcMain.handle('fileParser.GetAllPacks', (event, forceRescan: boolean = false) =>
		fileParser.GetAllPacks(forceRescan)
	);
	ipcMain.handle('fileParser.GetCacheFromPack', (event, data: Pack | string) => {
		if (typeof data == 'string') {
			return fileParser.GetCacheFromPack(data.replace(/[\/\\:*?"<>]/g, ''));
		} else {
			return fileParser.GetCacheFromPack(
				path.join(new Config().customSongsFolder, data.title.replace(/[\/\\:*?"<>]/g, ''))
			);
		}
	});
	ipcMain.on('fileParser.ClearTempFolder', (event, _) => fileParser.ClearTempFolder());
	ipcMain.handle('fileParser.GetPackAtPath', (event, packPath: string) =>
		fileParser.GetPackAtPath(path.join(new Config().customSongsFolder, packPath))
	);

	/* Config */
	ipcMain.on('config.Set', (event, data: any) => new Config().Set(data.key, data.value));
	ipcMain.handle('config.Read', (event, data: string) => new Config()[data]);

	/* Utils */
	ipcMain.handle('utils.ShowOpenDialog', (event, data: OpenDialogOptions) => utils.ShowOpenDialog(data));
	ipcMain.handle('utils.ShowSaveDialog', (event, data: SaveDialogOptions) => utils.ShowSaveDialog(data));

	/* Pack Manager */
	const packManager = new PackManager();

	ipcMain.handle('packManager.GetDownloadablePacks', (event, data: boolean = false) =>
		packManager.GetDownloadablePacks(data)
	);
	ipcMain.handle('packManager.GetPackAtIndex', (event, index: number) => packManager.GetPackAtIndex(index));
	ipcMain.handle('packManager.SyncPack', (event, data: any) =>
		packManager.DownloadSongsFromPack(data.index, data.download)
	);
	ipcMain.handle('packManager.DownloadSongsFromPack', (event, data: any) =>
		packManager.DownloadSongsFromPack(data.index, data.download, true)
	);
	ipcMain.handle('packManager.VerifyPackIntegrity', (event, data: Pack) => packManager.VerifyPackIntegrity(data));
	ipcMain.handle('packManager.GeneratePack', (event, data: object) => packManager.GeneratePack(data));
	ipcMain.handle('packManager.ExportPack', (event, data: object) => packManager.ExportPack(data));
	ipcMain.handle('packManager.ImportPack', (event, packPath: string) => packManager.ImportPack(packPath));
	ipcMain.handle('packManager.DeletePack', (event, packPath: string) => packManager.DeletePack(packPath));

	/* Translator */
	const translator = new Translator();

	ipcMain.on('translator.ReloadTranslations', (event, _) => translator.ReloadTranslations());
	ipcMain.handle('translator.GetTranslation', (event, data: string) => translator.GetTranslation(data));
	ipcMain.handle('translator.GetAvailableLanguages', (event, _) => translator.GetAvailableLanguages());
}

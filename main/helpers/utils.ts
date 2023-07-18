import { dialog, OpenDialogOptions, OpenDialogReturnValue, SaveDialogOptions, SaveDialogReturnValue } from 'electron';
import Logger from 'electron-log';

export default class utils {
	static async ShowOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
		return dialog.showOpenDialog(options);
	}

	static async ShowSaveDialog(options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
		return dialog.showSaveDialog(options);
	}

	static getValidFileName(fileName: string) {
		const newFileName = fileName.replaceAll(new RegExp(/[\/:*?"<>|.]/, 'gi'), '');
		if (newFileName.length == 0) {
			throw 'File Name ' + fileName + ' results in a empty fileName!';
		}
		return newFileName;
	}
}

import { app, dialog, OpenDialogOptions, OpenDialogReturnValue } from 'electron';
import fs from 'fs/promises';
import path from 'path';

export default class utils {
	static async ShowOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
		return dialog.showOpenDialog(options);
	}
}

import {dialog, OpenDialogOptions, OpenDialogReturnValue} from 'electron';

export default class utils {
	static async ShowOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
		return dialog.showOpenDialog(options)
	}
}
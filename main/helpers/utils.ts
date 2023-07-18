import {
	app,
	dialog,
	OpenDialogOptions,
	OpenDialogReturnValue,
	SaveDialogOptions,
	SaveDialogReturnValue,
} from 'electron';
import fetch from 'node-fetch';
import semver from 'semver/preload';

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

	static async CheckUpdate() {
		const r = await fetch(`https://api.github.com/repos/Pack-UI/packUI/tags`);
		if (r.ok) {
			const data = (await r.json()) as any[];
			const latestTag = data.pop();
			if (semver.compare(app.getVersion(), latestTag.name.replace('V', '')) == -1) {
				return {
					available: true,
					currentVersion: `V${app.getVersion()}`,
					latestVersion: latestTag.name,
				};
			} else {
				return {
					available: false,
				};
			}
		}
	}
}

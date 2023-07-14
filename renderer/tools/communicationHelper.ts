import Song from '../../main/classes/song';
import Pack from '../../main/classes/pack';
import { ipcRenderer, IpcRenderer } from 'electron';

async function GetAllSongs(ipcRenderer: IpcRenderer, forceRescan: boolean = false): Promise<Song[]> {
	return ipcRenderer.invoke('fileParser.GetAllSongs', forceRescan);
}

async function GetAllPacks(ipcRenderer: IpcRenderer, forceRescan: boolean = false): Promise<Pack[]> {
	return ipcRenderer.invoke('fileParser.GetAllPacks', forceRescan);
}

function SetConfigField(ipcRenderer: IpcRenderer, key: string, value: any) {
	ipcRenderer.send('config.Set', { key, value });
}

function GetConfigField(key: string): Promise<any> {
	return ipcRenderer ? ipcRenderer.invoke('config.Get', key) : undefined;
}

function ClearTempFolder(ipcRenderer: IpcRenderer) {
	ipcRenderer.send('fileParser.ClearTempFolder');
}

async function GetAPISourceTags(ipcRenderer: IpcRenderer) {
	return new Promise<object[]>((resolve, reject) =>
		ipcRenderer.invoke('config.Read', 'sources').then((data: string[]) => {
			let tags: object[] = [];
			data.forEach(source => tags.push({ id: source, text: source }));
			resolve(tags);
		})
	);
}

async function VerifyPackIntegrity(ipcRenderer: IpcRenderer, pack: Pack): Promise<number> {
	return ipcRenderer.invoke('packManager.VerifyPackIntegrity', pack);
}

export {
	GetAllSongs,
	GetAllPacks,
	SetConfigField,
	GetConfigField,
	GetAPISourceTags,
	ClearTempFolder,
	VerifyPackIntegrity,
};

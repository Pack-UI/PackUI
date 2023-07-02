import Song from '../../main/classes/song';
import Pack from '../../main/classes/pack';
import {IpcRenderer} from "electron";

async function GetAllSongs(ipcRenderer: IpcRenderer): Promise<Song[]> {
	return ipcRenderer.invoke('fileParser.GetAllSongs');
}

async function GetAllPacks(ipcRenderer: IpcRenderer): Promise<Pack[]> {
	return ipcRenderer.invoke('fileParser.GetAllPacks');
}

function SetConfigField(ipcRenderer: IpcRenderer, key: string, value: any) {
	ipcRenderer.send('config.Set', {key, value});
}

function ClearTempFolder(ipcRenderer: IpcRenderer) {
	ipcRenderer.send('fileParser.ClearTempFolder');
}

async function GetAPISourceTags(ipcRenderer: IpcRenderer) {
	return new Promise<object[]>((resolve, reject) =>
		ipcRenderer.invoke('config.Read', "sources").then((data: string[]) => {
			let tags: object[] = [];
			data.forEach(source => tags.push({id: source, text: source}));
			resolve(tags);
		}))
}

async function VerifyPackIntegrity(ipcRenderer: IpcRenderer, pack: Pack): Promise<number> {
	return ipcRenderer.invoke('packManager.VerifyPackIntegrity', pack)
}

export {GetAllSongs, GetAllPacks, SetConfigField, GetAPISourceTags, ClearTempFolder, VerifyPackIntegrity};

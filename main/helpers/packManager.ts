import Config from "./config";
import Pack from "../classes/pack";
import fetch from 'node-fetch';
import Logger from "electron-log";
import Song from "../classes/song";
import {Validator} from "jsonschema";
import log from "electron-log";
import {app, BrowserWindow} from "electron";
import path from "path";
import fs from "fs/promises";
import fss from "fs";
import FileParser from "../helpers/fileParser";
import {hashElement} from "folder-hash";
const decompress = require("decompress");
const downloader = require("download");
const downloadSchema = require('../../schemas/PackUI.download.schema.json');

const isProd = process.env.NODE_ENV === 'production';

export default class PackManager {
	sources: string[];
	packs: Pack[];
	
	constructor() {
		this.sources = new Config().sources;
	}
	
	GetPackAtIndex(index: number): Pack | undefined {
		return this.packs.length > index ? this.packs[index] : undefined;
	}
	
	async GetDownloadablePacks(): Promise<Pack[]> {
		
		let packs: Pack[] = [];
		
		return new Promise<Pack[]>(async (resolve) => {
			
			await Promise.all(new Config().sources.map(async (url) => {
				
				const resp = await fetch(url);
				
				if (!resp.ok) {
					Logger.error(`Invalid response from "${url}", code: ${resp.statusText}`);
					return;
				}
				
				const packData = await resp.json();

				const v = new Validator();

				if (!v.validate(packData, downloadSchema).valid) {
					log.warn(`Response from "${url}" did not pass validation, please contact the respective developer`)
				}
				
				packs.push(new Pack(
					url,
					packData["title"] || "Title",
					packData["description"] || "",
					packData["author"] || "",
					packData["artist"] || "",
					packData["difficulty"] || 8,
					packData["color"] || "#FFFFFF",
					packData["creationDate"] || "",
					packData["lastUpdate"] || "",
					packData["songs"].map((songData) => {
						return new Song(
							songData["download"] || "",
							songData["title"] || "Title",
							songData["artist"] || "",
							songData["author"] || "",
							songData["bpm"] || 0,
							songData["seizureWarning"] || false,
							songData["difficulty"] || 8,
							songData["song"] || "",
							songData["cover"] || "/logo.png",
							songData["events"] || 0,
							songData["tiles"] || 0,
							songData["duration"] || 0,
							songData["download"] || ""
						)
					}) || [],
					packData["version"] || undefined,
					packData["tags"] || undefined,
					packData["cover"] || undefined,
					packData["icon"] || undefined
				));
				
			}));
			
			this.packs = packs;
			resolve(packs);
		});
	}
	
	async DownloadSongsFromPack(index: number, downloads: boolean[], redownload: boolean = false): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			
			const pack = this.GetPackAtIndex(index);
			
			if (!pack) {
				Logger.error(`No pack at index ${index}, this should not happen`);
				reject();
			}
			
			if (redownload) {
				await this.RemovePackFolder(path.join(new Config().customSongsFolder, pack.title.replace(/[\/\\:*?"<>]/g, "")))
			}
			
			const packPath = await this.CreatePackFolder(pack);
			const songs = pack.songs;
			let cache = await new FileParser().GetCacheFromPack(packPath);
			
			await Promise.all(downloads.map(async (download, index) => {
				
				if (!download) {
					return;
				}
				
				const song = songs[index];
				const downloadPath = path.join(app.getPath('temp'), isProd ? "PackUI" : "Dev.PackUI");
				const songZipName = song.download.split('/').pop();
				
				await downloader(song.download, downloadPath).catch(() => {Logger.error(`Level ${song.title} failed to download, skipping...`); return});
				
				const songPath =  path.join(packPath, song.title.replace(/[\/\\:*?"<>]/g, ""));
				
				await decompress(path.join(downloadPath, songZipName), songPath).catch((e) => Logger.warn(`Something went wrong while decompressing "${song.title}, skipping..."`))

				const folderHash = await hashElement(songPath, { files: { include: '*' } });
				
				cache.push({
					type: 'folder',
					name: song.title.replace(/[\/\\:*?"<>]/g, ""),
					hash: folderHash.hash
				})
				
				BrowserWindow.getAllWindows()[0].webContents.send('progress.SongComplete');
			}));
			
			await fs.writeFile(path.join(packPath, 'PackUI.cache'), JSON.stringify(cache));
			
			resolve();
		}) || undefined;
	}
	
	async RemovePackFolder(packPath: string) {
		await fs.rm(packPath, {recursive: true, force: true})
	}
	
	async CreatePackFolder(pack: Pack): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			
			const packTitle = pack.title.replace(/[\/\\:*?"<>]/g, "");
			const packPath = path.join(new Config().customSongsFolder, packTitle);

			if (!fss.existsSync(packPath)) {
				await fs.mkdir(packPath);
			}
			
			// *.pack
			await fs.writeFile(path.join(packPath, `${packTitle}.pack`), 
				`title = ${pack.title}\n` +
				`author = ${pack.author}\n` +
				`artist = ${pack.artist}\n` +
				`difficulty = ${pack.difficulty}\n` +
				`description = ${pack.description}\n` +
				`color = ${pack.color}\n` +
				`image = ${pack.coverImagePath}\n` +
				`icon = ${pack.iconImagePath}`,
				{ flag: 'wx'}
			).catch(() => {})
			
			
			// PackUI.cache
			const fileHash = await hashElement(path.join(packPath, `${packTitle}.pack`));
			await fs.writeFile(path.join(packPath, 'PackUI.cache'), JSON.stringify([
				{
					type: 'version',
					version: pack.version
				},
				{
					type: 'file',
					name: `${packTitle}.pack`,
					hash: fileHash.hash
				}
			]));
			
			resolve(packPath)
		})
	}
	
	async VerifyPackIntegrity(pack: Pack): Promise<number> {
		return new Promise<number>(async (resolve, reject) => {

			let songsFailed = 0;
			
			const packPath = path.join(new Config().customSongsFolder, pack.title.replace(/[\/\\:*?"<>]/g, ""))
			
			if (!fss.existsSync(packPath)) {
				Logger.error(`Invalid path ${packPath}`);
				reject();
			}
			
			const cache = await new FileParser().GetCacheFromPack(packPath).catch(() => reject());
			
			await Promise.all(cache.map(async (cacheElement: any, index: number) => {
				
				switch (cacheElement.type) {
					case "file":
						const fileHash = await hashElement(path.join(packPath, cacheElement.name))
						if (cacheElement.hash != fileHash.hash){
							songsFailed++;
							Logger.warn(`File "${cacheElement.name}" failed integrity check`)
						} else {
							Logger.log(`File "${cacheElement.name}" passed integrity check`)
						}
						return;
						
					case "folder":
						const folderHash = await hashElement(path.join(packPath, cacheElement.name), { files: { include: ["*"] } })
						if (cacheElement.hash != folderHash.hash){
							songsFailed++;
							Logger.warn(`Folder "${cacheElement.name}" failed integrity check`)
						} else {
							Logger.log(`Folder "${cacheElement.name}" passed integrity check`)
						}
						return;
						
					case "version":
						// TODO: Check if pack is latest version
						break;
						
					default:
						Logger.log(`Unknown cache type "${cacheElement.type}" in folder "${packPath}"`)
						return;
				}
			}));
			
			resolve(songsFailed);
		});
	}
}
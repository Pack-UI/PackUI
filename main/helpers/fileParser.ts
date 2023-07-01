import Song from '../classes/song';
import Pack from "../classes/pack";
import * as fs from 'fs/promises';
import * as fss from 'fs';
import path from 'path';
import {jsonrepair} from 'jsonrepair';
import log from "electron-log";
import Config from "./config";
import {app} from "electron";

const isProd = process.env.NODE_ENV === 'production';

export default class FileParser {
	async GetAllPacks() {
		const customSongsPath = new Config().customSongsFolder
		
		if (!fss.existsSync(customSongsPath)) {
			log.error(`Path ${customSongsPath} does not exist`);
			return new Promise<Pack[]>(resolve => resolve([]))
		}
		
		return new Promise<Pack[]>(async (resolve, _) => {

			log.info("Loading packs in " + customSongsPath)

			let packs: Pack[] = [];

			// Get all dirs in custom songs
			const folders = await fs.readdir(customSongsPath);

			await Promise.all(
				folders.map(async folder => {
					const folderPath = path.join(customSongsPath, folder);
					const files = await fs.readdir(folderPath);

					// Check if folder is pack
					const packFiles = files.filter(file => file.split('.').pop() === 'pack');
					if (packFiles.length !== 0) {

						const rawData = await fs.readFile(path.join(folderPath, packFiles[0]), 'utf-8');

						const packConfig = {};

						rawData.split(/\r?\n/).forEach(line => {
							let keyValuePair = line.split("=", 2);
							packConfig[keyValuePair[0].trim()] = keyValuePair[1].trim();
						});

						// Check if preview image exists
						const iconExists = "icon" in packConfig ? fss.existsSync(path.join(folderPath, <string>packConfig["icon"])) : false;
						const coverExists = "image" in packConfig ? fss.existsSync(path.join(folderPath, <string>packConfig["image"])) : false;

						const lastModified = new Date(Date.now());
						// TODO: Get last modified date from .pack file

						const songs = await this.GetAllSongs(folderPath);

						let pack = new Pack(
							folderPath,
							packConfig["title"] || null,
							packConfig["description"] || null,
							packConfig["author"] || null,
							packConfig["artist"] || null,
							packConfig["difficulty"] || null,
							packConfig["color"] || null,
							fss.statSync(path.join(folderPath, packFiles[0])).birthtime || null,
							lastModified || null,
							songs
						);

						iconExists ? pack.iconImagePath = packConfig["icon"] : null;
						coverExists ? pack.coverImagePath = packConfig["image"] : null;

						packs.push(pack);
					}
				})
			);
			resolve(packs);
		});
	}

	async ClearTempFolder() {
		await fs.rm(path.join(app.getPath('temp'), isProd ? "PackUI" : "Dev.PackUI"), {recursive: true, force: true});
	}
	
	async GetCacheFromPack(packPath: string): Promise<any> {
		return new Promise<any>(async (resolve, reject) => {
			
			const cachePath = path.join(packPath, "PackUI.cache")
			
			if (!fss.existsSync(cachePath)) {
				log.warn(`Path ${packPath} does not exist`);
				resolve([]);
				return;
			}
			
			const cache = await fs.readFile(cachePath)
			
			resolve(JSON.parse(cache.toString()))
		});
	}
	
	async GetAllSongs(pathToScan?: string) {

		const customSongsPath = new Config().customSongsFolder
		
		const rootPath = pathToScan ? pathToScan : customSongsPath;

		if (!fss.existsSync(customSongsPath)) {
			log.error(`Path ${rootPath} does not exist`);
			return new Promise<Song[]>(resolve => resolve([]))
		}
		
		log.info("Loading songs in " + rootPath)

		return new Promise<Song[]>(async (resolve, _) => {
			let songs: Song[] = [];

			// Get all dirs in custom songs
			const folders = await fs.readdir(rootPath);

			await Promise.all(
				folders.map(async folder => {
					const folderPath = path.join(rootPath, folder);

					if (folderPath.endsWith(".pack")) {
						// Skip .pack files
						return;
					}

					// Check if folder is song
					if (!fss.existsSync(path.join(folderPath, 'main.adofai'))) {
						// No main.adofai file
						log.warn(`FileMissing: No main.adofai file found in "${folderPath}"`);
						return;
					}

					const rawData = await fs.readFile(path.join(folderPath, 'main.adofai'));
					const fixedData = jsonrepair(rawData.toString().replace(/^\uFEFF/, ''));
					const adofaiData = JSON.parse(fixedData.toString());

					// Check if preview image exists
					const songExists = fss.existsSync(
						path.join(folderPath, adofaiData['settings']['songFilename'])
					);
					const coverExists = fss.existsSync(
						path.join(folderPath, adofaiData['settings']['previewImage'])
					);

					const tiles: number = (typeof (adofaiData.pathData) === 'string') ? String(adofaiData.pathData).length : adofaiData.angleData.length;

					songs.push(
						new Song(
							folderPath,
							adofaiData['settings']['song'] || null,
							adofaiData['settings']['artist'] || null,
							adofaiData['settings']['author'] || null,
							adofaiData['settings']['bpm'] || null,
							adofaiData['settings']['seizureWarning'] !== 'Disabled' || true,
							adofaiData['settings']['difficulty'] || null,
							adofaiData['settings']['songFilename'] !== '' && songExists
								? path.join(folderPath, adofaiData['settings']['songFilename'])
								: null,
							adofaiData['settings']['previewImage'] !== '' && coverExists
								? path.join(folderPath, adofaiData['settings']['previewImage'])
								: null,
							Array(adofaiData['actions']).length || null,
							tiles || null,
							null
						)
					);
				})
			);

			resolve(songs);
		});
	}
}

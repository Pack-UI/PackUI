import Song from '../classes/song';
import Pack from '../classes/pack';
import * as fs from 'fs/promises';
import * as fss from 'fs';
import path from 'path';
import { jsonrepair } from 'jsonrepair';
import log from 'electron-log';
import Config from './config';
import { app } from 'electron';
import utils from './utils';

const isProd = process.env.NODE_ENV === 'production';

interface Iscan {
	lastScan: number;
	songs: object;
	packs: Pack[];
}

export default class FileParser {
	scan: Iscan = { lastScan: 0, songs: {}, packs: [] };
	currentlyScanningSongs: boolean = false;
	currentlyScanningPacks: boolean = false;

	async GetAllPacks(forceRescan: boolean = false) {
		const startTime = performance.now(); // Timer

		// Check cache for packs
		if (this.scan && !forceRescan) {
			if (this.scan.packs.length > 0) {
				const endTime = performance.now(); // Timer
				console.log(
					`Loaded ${this.scan.packs.length} pack(s) in ${Math.ceil(endTime - startTime)}ms from cache`
				);

				return this.scan.packs;
			}
		}

		// Return empty if already scanning
		if (this.currentlyScanningPacks && !forceRescan) {
			return;
		}
		this.currentlyScanningPacks = true;

		const customSongsPath = new Config().customSongsFolder;

		// Check if path is valid
		if (!fss.existsSync(customSongsPath)) {
			log.error(`%cPath "${customSongsPath}" does not exist`, 'color: red');
			return new Promise<Pack[]>(resolve => resolve([]));
		}

		log.info(`Loading packs in %c"${customSongsPath}"`, 'color: gray');

		return new Promise<Pack[]>(async (resolve, _) => {
			let packs: Pack[] = [];

			// Get all dirs in custom songs
			const folders = await fs.readdir(customSongsPath);

			await Promise.all(
				folders.map(async folder => {
					const folderPath = path.join(customSongsPath, folder);
					const files = await fs
						.readdir(folderPath)
						.catch(() =>
							log.warn(`%c"${folderPath}" %cis not a dir, skipping`, 'color: gray', 'color: unset')
						);
					if (!files) return;

					// Check if folder is pack
					const packFiles = files.filter(file => file.split('.').pop() === 'pack');
					if (packFiles.length !== 0) {
						packs.push(await this.GetPackAtPath(folderPath));
					}
				})
			);

			// Update cache and finish scan
			this.scan.packs = packs;
			this.currentlyScanningPacks = false;

			const endTime = performance.now(); // Timer
			console.log(`Loaded ${packs.length} pack(s) in ${Math.ceil(endTime - startTime)}ms`);

			resolve(packs);
		});
	}

	async GetPackAtPath(packPath: string, forceRescan: boolean = false) {
		const packFile = (await fs.readdir(packPath)).filter(file => file.split('.').pop() === 'pack')[0];
		const rawData = await fs.readFile(path.join(packPath, packFile), 'utf-8');

		const packConfig = {};

		rawData.split(/\r?\n/).forEach(line => {
			let keyValuePair = line.split('=', 2);
			packConfig[keyValuePair[0].trim()] = keyValuePair[1].trim();
		});

		// Check if preview image exists
		const iconExists =
			'icon' in packConfig ? fss.existsSync(path.join(packPath, <string>packConfig['icon'])) : false;
		const coverExists =
			'image' in packConfig ? fss.existsSync(path.join(packPath, <string>packConfig['image'])) : false;

		const lastModified = new Date(Date.now());
		// TODO: Get last modified date from .pack file

		const songs = await this.GetAllSongs(packPath, forceRescan);

		let pack = new Pack(
			utils.getValidFileName(packConfig['title']),
			packConfig['title'] || null,
			packConfig['description'] || null,
			packConfig['author'] || null,
			packConfig['artist'] || null,
			packConfig['difficulty'] || null,
			packConfig['color'] || null,
			fss.statSync(path.join(packPath, packFile)).birthtime || null,
			lastModified || null,
			songs || []
		);

		iconExists ? (pack.iconImagePath = packConfig['icon']) : null;
		coverExists ? (pack.coverImagePath = packConfig['image']) : null;

		return pack;
	}

	async ClearTempFolder() {
		await fs.rm(path.join(app.getPath('temp'), isProd ? 'PackUI' : 'Dev.PackUI'), { recursive: true, force: true });
	}

	async GetCacheFromPack(packPath: string) {
		return new Promise<any[]>(async resolve => {
			const cachePath = path.join(packPath, 'PackUI.cache');

			// Check if path is valid
			if (!fss.existsSync(cachePath)) {
				log.warn(`Path ${packPath} does not exist`);
				resolve([]);
				return;
			}

			const cache = await fs.readFile(cachePath);
			resolve(JSON.parse(cache.toString()));
		});
	}

	async GetAllSongs(pathToScan?: string, forceRescan: boolean = false) {
		const startTime = performance.now(); // Timer

		const customSongsPath = new Config().customSongsFolder;
		const rootPath = pathToScan ? pathToScan : customSongsPath;

		// Check cache for songs
		if (this.scan && !forceRescan) {
			if (this.scan.songs[rootPath]) {
				const endTime = performance.now(); // Timer
				console.log(
					`Loaded ${this.scan.songs[rootPath].length} song(s) in ${Math.ceil(
						endTime - startTime
					)}ms from cache`
				);

				return this.scan.songs[rootPath];
			}
		}

		// Return empty if already scanning
		if (this.currentlyScanningSongs && !forceRescan) {
			return;
		}
		this.currentlyScanningSongs = true;

		// Check if song path is valid
		if (!fss.existsSync(rootPath)) {
			log.error(`%cPath ${rootPath} does not exist`, 'color: red');
			return new Promise<Song[]>(resolve => resolve([]));
		}

		log.info(`Loading songs in %c"${rootPath}"`, 'color: gray');

		return new Promise<Song[]>(async (resolve, _) => {
			let songs: Song[] = [];

			// Get all dirs in custom songs
			const folders = await fs.readdir(rootPath);

			await Promise.all(
				folders.map(async folder => {
					const folderPath = path.join(rootPath, folder);

					// Skip .pack files
					if (folderPath.endsWith('.pack')) return;

					// Check if folder is song
					if (!fss.existsSync(path.join(folderPath, 'main.adofai'))) return;

					const adofaiPath = path.join(folderPath, 'main.adofai');
					const rawData = await fs.readFile(adofaiPath);

					let adofaiData;

					try {
						adofaiData = JSON.parse(rawData.toString());
					} catch (e) {
						log.warn(`Error parsing ${adofaiPath}, attempting fix`);
						const fixedData = jsonrepair(rawData.toString().replace(/^\uFEFF/, '')).toString();

						await fs.rename(adofaiPath, `${adofaiPath}.backup`);
						await fs.writeFile(adofaiPath, fixedData);

						adofaiData = JSON.parse(fixedData);
					}

					// Check if preview image exists
					const songExists = fss.existsSync(path.join(folderPath, adofaiData['settings']['songFilename']));
					const coverExists = fss.existsSync(path.join(folderPath, adofaiData['settings']['previewImage']));

					const tiles: number =
						typeof adofaiData.pathData === 'string'
							? String(adofaiData.pathData).length
							: adofaiData.angleData.length;

					// Create song object
					songs.push(
						new Song(
							folder,
							adofaiData['settings']['song'] || null,
							adofaiData['settings']['artist'] || null,
							adofaiData['settings']['author'] || null,
							adofaiData['settings']['bpm'] || null,
							adofaiData['settings']['seizureWarning'] !== 'Disabled' || true,
							adofaiData['settings']['difficulty'] || null,
							adofaiData['settings']['songFilename'] !== '' && songExists
								? adofaiData['settings']['songFilename']
								: null,
							adofaiData['settings']['previewImage'] !== '' && coverExists
								? adofaiData['settings']['previewImage']
								: null,
							Array(adofaiData['actions']).length || null,
							tiles || null,
							null
						)
					);
				})
			);

			// Update cache and finish scan
			this.scan.songs[rootPath] = songs;
			this.currentlyScanningSongs = false;

			const endTime = performance.now(); // Timer
			console.log(`Loaded ${songs.length} song(s) in ${Math.ceil(endTime - startTime)}ms`);

			resolve(songs);
		});
	}
}

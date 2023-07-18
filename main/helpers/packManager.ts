import Config from './config';
import Pack from '../classes/pack';
import fetch from 'node-fetch';
import Logger from 'electron-log';
import log from 'electron-log';
import Song from '../classes/song';
import { Validator } from 'jsonschema';
import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import fss from 'fs';
import FileParser from './fileParser';
import { hashElement } from 'folder-hash';
import utils from './utils';
import archiver from 'archiver';
import { Catch, CatchAll } from '@magna_shogun/catch-decorator';

const decompress = require('decompress');
const downloader = require('download');
const downloadSchema = require('../../schemas/PackUI.download.schema.json');

const isProd = process.env.NODE_ENV === 'production';

export default class PackManager {
	sources: string[] = [];
	packs: Pack[] = [];
	lastSources: string[] = [];

	constructor() {
		this.sources = new Config().sources;
		this.lastSources = this.sources;
	}

	@CatchAll((err, ctx) => Logger.error(err))
	GetPackAtIndex(index: number): Pack {
		return this.packs.length > index ? this.packs[index] : undefined;
	}

	@CatchAll((err, ctx) => Logger.error(err))
	async GetDownloadablePacks(forceRefresh: boolean = false): Promise<Pack[]> {
		// Check if packs have not changed
		if (this.packs.length == this.sources.length && this.lastSources == this.sources && !forceRefresh) {
			return this.packs;
		}

		let packs: Pack[] = [];

		return new Promise<Pack[]>(async resolve => {
			await Promise.all(
				new Config().sources.map(async url => {
					const resp = await fetch(url);

					if (!resp.ok) {
						Logger.error(`Invalid response from "${url}", code: ${resp.statusText}`);
						return;
					}

					const packData = await resp.json();

					if (!new Validator().validate(packData, downloadSchema).valid) {
						log.warn(
							`Response from "${url}" did not pass validation, please contact the respective developer`
						);
					}

					packs.push(
						new Pack(
							url,
							packData['title'] || 'Title',
							packData['description'] || '',
							packData['author'] || '',
							packData['artist'] || '',
							packData['difficulty'] || 8,
							packData['color'] || '#FFFFFF',
							packData['creationDate'] || '',
							packData['lastUpdate'] || '',
							packData['songs'].map(
								songData =>
									new Song(
										songData['download'] || '',
										songData['title'] || 'Title',
										songData['artist'] || '',
										songData['author'] || '',
										songData['bpm'] || 0,
										songData['seizureWarning'] || false,
										songData['difficulty'] || 8,
										songData['song'] || '',
										songData['cover'] || '/logo.png',
										songData['events'] || 0,
										songData['tiles'] || 0,
										songData['duration'] || 0,
										songData['download'] || ''
									)
							) || [],
							packData['version'] || undefined,
							packData['tags'] || undefined,
							packData['cover'] || undefined,
							packData['icon'] || undefined
						)
					);
				})
			);

			this.packs = packs;
			resolve(packs);
		});
	}

	@CatchAll((err, ctx) => Logger.error(err))
	async DownloadSongsFromPack(index: number, downloads: boolean[], redownload = false) {
		const customSongsFolder = new Config().customSongsFolder;

		return (
			new Promise<void>(async (resolve, reject) => {
				const pack = this.GetPackAtIndex(index);

				if (!pack) {
					Logger.error(`No pack at index ${index}, this should not happen`);
					reject();
				}

				if (redownload) {
					await this.RemovePackFolder(
						path.join(customSongsFolder, utils.getValidFileName(pack.title.replace(/[\/\\:*?"<>]/g, '')))
					);
				}

				const packPath = await this.CreatePackFolder(pack);
				let cache = await new FileParser().GetCacheFromPack(packPath);

				await Promise.all(
					downloads.map(async (download, index) => {
						if (!download) {
							return;
						}

						const song = pack.songs[index];
						const downloadPath = path.join(app.getPath('temp'), isProd ? 'PackUI' : 'Dev.PackUI');
						const songZipName = song.download.split('/').pop();

						if (!fss.existsSync(path.join(downloadPath, songZipName)) || redownload) {
							await downloader(song.download, downloadPath).catch(e => {
								Logger.error(`Level ${song.title} failed to download, skipping...`, e);
								return;
							});
						} else {
							Logger.log(`Skipping download, instead using ${songZipName} from cache`);
						}

						const songPath = path.join(
							packPath,
							utils.getValidFileName(song.title.replace(/[\/\\:*?"<>]/g, ''))
						);

						await decompress(path.join(downloadPath, songZipName), songPath).catch(e =>
							Logger.warn(`Something went wrong while decompressing "${song.title}, skipping..."`)
						);

						const folderHash = await hashElement(songPath, {
							files: { include: '*' },
						});

						cache.push({
							type: 'folder',
							name: utils.getValidFileName(song.title.replace(/[\/\\:*?"<>]/g, '')),
							hash: folderHash.hash,
						});

						BrowserWindow.getAllWindows()[0].webContents.send('progress.SongComplete');
					})
				);

				await fs.writeFile(path.join(packPath, 'PackUI.cache'), JSON.stringify(cache));

				resolve();
			}) || undefined
		);
	}

	@CatchAll((err, ctx) => Logger.error(err))
	RemovePackFolder(packPath: string) {
		return fs.rm(packPath, { recursive: true, force: true });
	}

	@CatchAll((err, ctx) => Logger.error(err))
	async CreatePackFolder(pack: Pack): Promise<string> {
		const customSongsFolder = new Config().customSongsFolder;

		return new Promise<string>(async (resolve, reject) => {
			const packTitle = utils.getValidFileName(pack.title.replace(/[\/\\:*?"<>]/g, ''));
			const packPath = path.join(customSongsFolder, packTitle);

			if (!fss.existsSync(packPath)) {
				await fs.mkdir(packPath);
			}

			// Download pack cover and icon
			if (pack.coverImagePath != '') {
				await downloader(pack.coverImagePath, packPath)
					.then(_ => {
						fs.rename(
							path.join(packPath, pack.coverImagePath.split('/').pop().split('#')[0].split('?')[0]),
							path.join(
								packPath,
								`cover.${pack.coverImagePath.substring(pack.coverImagePath.lastIndexOf('.') + 1)}`
							)
						);
					})
					.catch(e => {
						Logger.error(`failed to download "${pack.coverImagePath}", skipping...`, e);
						return;
					});
			}
			if (pack.iconImagePath != '') {
				await downloader(pack.iconImagePath, packPath)
					.then(_ => {
						fs.rename(
							path.join(packPath, pack.iconImagePath.split('/').pop().split('#')[0].split('?')[0]),
							path.join(
								packPath,
								`icon.${pack.iconImagePath.substring(pack.iconImagePath.lastIndexOf('.') + 1)}`
							)
						);
					})
					.catch(e => {
						Logger.error(`failed to download "${pack.iconImagePath}", skipping...`, e);
						return;
					});
			}

			// *.pack
			await fs
				.writeFile(
					path.join(packPath, `${packTitle}.pack`),
					`title = ${pack.title}\n` +
						`author = ${pack.author}\n` +
						`artist = ${pack.artist}\n` +
						`difficulty = ${pack.difficulty}\n` +
						`description = ${pack.description}\n` +
						`color = ${pack.color}\n` +
						`image = cover.${pack.coverImagePath.substring(pack.coverImagePath.lastIndexOf('.') + 1)}\n` +
						`icon = icon.${pack.iconImagePath.substring(pack.iconImagePath.lastIndexOf('.') + 1)}`,
					{ flag: 'wx' }
				)
				.catch(() => {});

			// PackUI.cache
			const fileHash = await hashElement(path.join(packPath, `${packTitle}.pack`));
			await fs.writeFile(
				path.join(packPath, 'PackUI.cache'),
				JSON.stringify([
					{
						type: 'version',
						version: pack.version,
					},
					{
						type: 'file',
						name: `${packTitle}.pack`,
						hash: fileHash.hash,
					},
				])
			);

			resolve(packPath);
		});
	}

	@CatchAll((err, ctx) => Logger.error(err))
	async VerifyPackIntegrity(pack: Pack): Promise<number> {
		const customSongsFolder = new Config().customSongsFolder;

		return new Promise<number>(async (resolve, reject) => {
			let songsFailed = 0;

			const packPath = path.join(customSongsFolder, pack.title.replace(/[\/\\:*?"<>]/g, ''));

			if (!fss.existsSync(packPath)) {
				Logger.error(`Invalid path ${packPath}`);
				reject();
			}

			const cache = await new FileParser().GetCacheFromPack(packPath);

			await Promise.all(
				cache.map(async (cacheElement: any, index: number) => {
					switch (cacheElement.type) {
						case 'file':
							const fileHash = await hashElement(path.join(packPath, cacheElement.name));
							if (cacheElement.hash != fileHash.hash) {
								songsFailed++;
								Logger.warn(`File "${cacheElement.name}" failed integrity check`);
							} else {
								Logger.log(`File "${cacheElement.name}" passed integrity check`);
							}
							return;

						case 'folder':
							const folderHash = await hashElement(path.join(packPath, cacheElement.name), {
								files: { include: ['*'] },
							});
							if (cacheElement.hash != folderHash.hash) {
								songsFailed++;
								Logger.warn(`Folder "${cacheElement.name}" failed integrity check`);
							} else {
								Logger.log(`Folder "${cacheElement.name}" passed integrity check`);
							}
							return;

						case 'version':
							// TODO: Check if pack is latest version
							break;

						default:
							Logger.log(`Unknown cache type "${cacheElement.type}" in folder "${packPath}"`);
							return;
					}
				})
			);

			resolve(songsFailed);
		});
	}

	@CatchAll((err, ctx) => Logger.error(err))
	async GeneratePack(packData: any): Promise<boolean> {
		// TODO: Use pack instead of any
		const customSongsFolder = new Config().customSongsFolder;

		return new Promise<boolean>(async (resolve, reject) => {
			const pack = new Pack(
				packData.packPath || '/',
				packData.title,
				packData.description,
				packData.author,
				packData.artist,
				packData.difficulty,
				packData.color,
				packData.creationDate,
				packData.lastUpdate,
				packData.songs,
				packData.version,
				packData.tags,
				packData.coverImagePath,
				packData.iconImagePath
			);

			if (pack.packPath == '/') {
				pack.packPath = utils.getValidFileName(pack.title.replace(/[\/\\:*?"<>]/g, ''));
			}

			let folderPath = path.join(customSongsFolder, pack.packPath);
			if (!fss.existsSync(folderPath)) {
				Logger.log(`Pack not found at %c"${folderPath}"%c, creation new pack`, 'color: gray', 'color: unset');
				folderPath = await this.CreatePackFolder(pack);
			} else {
				Logger.log('Pack already exists, updating');

				const packFileName = folderPath.split('\\').pop() + '.pack';

				// Update *.pack
				await fs
					.writeFile(
						path.join(folderPath, packFileName),
						`title = ${pack.title}\n` +
							`author = ${pack.author}\n` +
							`artist = ${pack.artist}\n` +
							`difficulty = ${pack.difficulty}\n` +
							`description = ${pack.description}\n` +
							`color = ${pack.color}\n` +
							`image = cover.${
								pack.coverImagePath.substring(pack.coverImagePath.lastIndexOf('.') + 1) || 'png'
							}\n` +
							`icon = icon.${
								pack.iconImagePath.substring(pack.iconImagePath.lastIndexOf('.') + 1) || 'png'
							}`,
						{ flag: 'w' }
					)
					.catch(() => {});
			}

			// Add songs to pack
			const packFileName = folderPath.split('\\').pop() + '.pack';
			const fileHash = await hashElement(path.join(folderPath, packFileName));
			let cache = [
				{
					type: 'version',
					version: pack.version,
				},
				{
					type: 'file',
					name: `${packFileName}`,
					hash: fileHash.hash,
				},
			];

			await Promise.all(
				pack.songs.map(async (song, index) => {
					const originPath = path.join(customSongsFolder, song.songPath);
					const destinationPath = path.join(folderPath, song.songPath);

					// Remove all dirs
					(await fs.readdir(folderPath, { withFileTypes: true }))
						.filter(dir => dir.isDirectory())
						.map(dir => fss.rmSync(path.join(folderPath, dir.name), { recursive: true, force: true }));

					await fs.mkdir(destinationPath).catch(_ => undefined);
					await fs.cp(originPath, destinationPath, { recursive: true });

					const folderHash = await hashElement(originPath, {
						files: { include: '*' },
					});

					cache.push({
						type: 'folder',
						name: song.songPath,
						hash: folderHash.hash,
					});
				})
			);

			await fs.writeFile(path.join(folderPath, 'PackUI.cache'), JSON.stringify(cache));

			resolve(true);
		});
	}

	@CatchAll((err, ctx) => Logger.error(err))
	async ExportPack(data: any) {
		return new Promise<void>((resolve, reject) => {
			const output = fss.createWriteStream(data.saveTo);
			const archive = archiver('zip', {
				zlib: { level: 9 },
			});

			output.on('close', function () {
				console.log(archive.pointer() + ' total bytes');
				console.log('archiver has been finalized and the output file descriptor has closed.');
			});

			archive.on('error', function (err) {
				throw err;
			});

			archive.pipe(output);

			// append files from a sub-directory, putting its contents at the root of archive
			archive.directory(path.join(new Config().customSongsFolder, data.packPath), false);

			archive.finalize().then(resolve).catch(reject);
		});
	}

	@CatchAll((err, ctx) => Logger.error(err))
	async ImportPack(packPaths: string[]) {
		await Promise.all(
			packPaths.map(async packPath => {
				return new Promise<boolean>(async (resolve, reject) => {
					// Get pack name from zip name
					let packName = packPath.split(path.sep).pop().split('.')[0];

					// Check if pack with name already exists
					if (fss.existsSync(path.join(new Config().customSongsFolder, packName))) {
						reject(`Pack "${packName}" already exists, try deleting it first`);
					}

					// Unzip pack
					await decompress(packPath, path.join(new Config().customSongsFolder, packName)).catch(e => {
						reject(`Something went wrong while decompressing "${packName}"`);
					});

					resolve(true);
				}).catch(e => Logger.error(e));
			})
		);

		// Reload pack cache
		return new FileParser().GetAllPacks(true);
	}

	@CatchAll((err, ctx) => Logger.error(err))
	async DeletePack(packPath: string) {
		if (packPath == path.sep || packPath == '') return;

		// Delete pack
		await fs
			.rm(path.join(new Config().customSongsFolder, packPath), { recursive: true, force: true })
			.catch(e => Logger.error(e));

		// Reload pack cache
		return new FileParser().GetAllPacks(true);
	}
}

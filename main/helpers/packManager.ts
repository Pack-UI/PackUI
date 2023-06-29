import Config from "./config";
import Pack from "../classes/pack";
import fetch from 'node-fetch';
import Logger from "electron-log";
import Song from "../classes/song";

export default class PackManager {
	sources: string[];
	packs: Pack[];
	
	constructor() {
		this.sources = new Config().sources;
	}

	/**
	 *
	 * Safe get pack at index from last source fetch
	 * @returns Pack or undefined if index out of bounds
	 */
	GetPackAtIndex(index: number): Pack | undefined {
		return this.packs.length > index ? this.packs[index] : undefined;
	}

	/**
	 * 
	 * Get all packs from sources configured in PackUI.config.json
	 * @returns Promise of Pack[]
	 */
	async GetDownloadablePacks(): Promise<Pack[]> {
		
		let packs: Pack[] = [];
		
		return new Promise<Pack[]>(async (resolve) => {
			
			await Promise.all(new Config().sources.map(async (url) => {
				
				const resp = await fetch(url);
				
				if (!resp.ok) {
					Logger.error(`Invalid response from "${url}", code: ${resp.status}`);
					return;
				}
				
				const packData = await resp.json();
				
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
					packData["coverImagePath"] || undefined,
					packData["iconImagePath"] || undefined
				));
				
			}));
			
			this.packs = packs;
			resolve(packs);
		});
	}
}
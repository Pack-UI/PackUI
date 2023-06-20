import Config from "./config";
import Pack from "../classes/pack";
import log from "electron-log";
import fetch from "node-fetch";
import {Validator} from "jsonschema";
import Song from "../classes/song";
const downloadSchema = require('../../schemas/PackUI.download.schema.json');

export default class PackManager {
	packs: Pack[]
	
	GetPackByIndex(index: number): Pack {
		if (index > this.packs.length - 1) {
			return;
		}
		return this.packs[index];
	}
	
	GetDownloadablePacks(): Promise<Pack[]> {
		return new Promise<Pack[]>(async (resolve, reject) => {
			resolve(await Promise.all(new Config().sources.map(async (url, index) => {
				const response = await fetch(url);
				
				if (!response.ok) {
					log.error(`Invalid response from "${url}", ${response.statusText}`);
					return;
				}
				
				const data = JSON.parse(await response.text());
				
				const v = new Validator();
				
				if (!v.validate(data, downloadSchema).valid) {
					log.warn(`Response from "${url}" did not pass validation, please contact the respective developer`)	
				}
				
				return new Pack(
					url,
					data["title"] || "Unknown title",
					data["description"] || "",
					data["author"] || "",
					data["artist"] || "",
					data["difficulty"] || 0,
					data["color"] || "#2D2D2D",
					data["creationDate"] || new Date(Date.now()),
					data["lastUpdate"] || new Date(Date.now()),
					data["songs"] as Song[] || [],
					data["version"] || "1.0.0",
					data["tags"] || [],
					data["cover"] || "/logo.png",
					data["icon"] || "/logo.png"
				)
			})))
		});
	}
}
import Config from "./config";
import Pack from "../classes/pack";
import log from "electron-log";

export default class PackManager {
	sources: string[];
	
	constructor() {
		this.sources = new Config().sources;
	}
	
	GetDownloadablePacks(): Pack[] {
		log.error("Not yet implemented")
		return [];
	}
}
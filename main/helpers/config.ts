import * as fss from 'fs'
import path from "path";
import log from "electron-log";
import {app} from "electron";
import loadConfig from "tailwindcss/loadConfig";

const isProd = process.env.NODE_ENV === 'production';
let configPath: string;

export default class Config {
	customSongsFolder: string;
	sources: string[];
	
	constructor() {
		configPath = path.join(app.getPath('userData'), "PackUI.config.json");
		this.LoadConfig();
	}

	Set(key: string, value: any) {

		// Warn if key is invalid
		if (key ! in Object.getOwnPropertyNames(this)) {
			log.warn(`Setting unknown field "${key}"`);
		}

		const config = JSON.parse(fss.readFileSync(configPath, 'utf-8'));
		config[key] = value;
		fss.writeFileSync(configPath, JSON.stringify(config), 'utf-8');

		this.LoadConfig()
	}

	private ReadConfig(path: string): Config {
		return JSON.parse(fss.readFileSync(path, 'utf-8'))
	}
	
	private LoadConfig() {
		const config = this.ReadConfig(configPath);
		this.customSongsFolder = config.customSongsFolder;
		this.sources = config.sources;
	}
}
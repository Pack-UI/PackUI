import Song from "@classes/song";

export default class Pack {
	packPath: string;
	version?: string;
	title: string;
	description: string;
	author: string;
	artist: string;
	difficulty: number;
	tags?: string[];
	color: string;
	creationDate: Date;
	lastUpdate: Date;
	coverImagePath?: string;
	iconImagePath?: string;
	songs: Song[];


	constructor(packPath: string, title: string, description: string, author: string, artist: string, difficulty: number, color: string, creationDate: Date, lastUpdate: Date, songs: Song[], version?: string, tags?: string[], coverImagePath?: string, iconImagePath?: string) {
		this.packPath = packPath;
		this.title = title;
		this.description = description;
		this.author = author;
		this.artist = artist;
		this.difficulty = difficulty;
		this.color = color;
		this.creationDate = creationDate;
		this.lastUpdate = lastUpdate;
		this.songs = songs;
		this.version = version;
		this.tags = tags;
		this.coverImagePath = coverImagePath;
		this.iconImagePath = iconImagePath;
	}
}
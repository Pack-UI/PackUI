export default class Song {
	songPath: string;
	title: string;
	author: string;
	artist: string;
	bpm: number;
	download?: string;
	seizureWarning: boolean;
	difficulty: number;
	events: number;
	tiles: number;
	duration: number;
	coverFileName: string;
	songFileName: string;

	constructor(
		songPath: string,
		title: string,
		artist: string,
		author: string,
		bpm: number,
		seizureWarning: boolean,
		difficulty: number,
		songFilePath: string,
		coverFilePath: string,
		events: number,
		tiles: number,
		duration: number,
		download?: string
	) {
		this.songPath = songPath;
		this.title = title;
		this.artist = artist;
		this.author = author;
		this.bpm = bpm;
		this.seizureWarning = seizureWarning;
		this.difficulty = difficulty;
		this.songFileName = songFilePath;
		this.coverFileName = coverFilePath;
		this.events = events;
		this.tiles = tiles;
		this.duration = duration;
		this.download = download;
	}
}

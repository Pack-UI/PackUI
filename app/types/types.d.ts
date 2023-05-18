interface Song {
	songPath: string;
	title: string;
	artist: string;
	author: string;
	bpm: number;
	seizureWarning: boolean;
	difficulty: number;
	songFileName: string;
	coverFileName: string;
	events: number;
	tiles: number;
	duration: number;
}

interface Settings {
	customSongsFolder: string;
}

interface Color {
	R: number;
	G: number;
	B: number;
}

interface Data {
	songs: Song[];
	packs: Pack[];
}

interface DownloadPack {
	version: string;
	title: string;
	description: string;
	author: string;
	artist: string;
	difficulty: i8;
	tags: string[]?;
	color: Color?;
	creationDate: string?;
	lastUpdate: string?;
	cover: string?;
	icon: string?;
	songs: DownloadSong[];
}

interface DownloadSong {
	title: string;
	author: string;
	artist: string;
	bpm: i32?;
	download: string;
	seizureWarning: bool?;
	difficulty: i8?;
	events: i32?;
	tiles: i32?;
	duration: i16?;
	cover: string?;
}

interface Pack {
	path: string;
	songs: Song[];
	title: string;
	author: string;
	artist: string;
	difficulty: number;
	description: string;
	color: Color;
	image: string?;
	icon: string?;
}

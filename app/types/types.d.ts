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

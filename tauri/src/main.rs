// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

mod types;

use std::{fs::{self, File}, path::{Path, PathBuf}, io::{ BufReader, BufRead}};
use types::Song;

fn main() {
tauri::Builder::default()
	.invoke_handler(tauri::generate_handler![get_all_songs, get_custom_song_folder, set_custom_song_folder])
	.run(tauri::generate_context!())
	.expect("error while running tauri application");
}

#[tauri::command]
fn get_custom_song_folder(_folder: &str) {
	let config = File::open(r"D:\Projects\PackUI\tauri\src\packUI.config.js").unwrap();
	let lines = BufReader::new(config).lines();
	for line in lines {
		if line.as_ref().unwrap().trim().starts_with("customSongsFolder") {
			let mut chars = line.as_ref().unwrap().split_once(':').unwrap_or_default().1.trim().chars();
			chars.next();
			chars.next_back();
			chars.next_back();
			println!("{}", chars.as_str());
		}
	}
}

fn file_to_json(path: &PathBuf) -> jsondata::Json {

	// Parse json
	let json_string = fs::read_to_string(path).unwrap();
	let mut json_data: jsondata::Json = json_string.parse::<jsondata::Json>().unwrap();

	// Validate json
	match json_data.validate() {
		Ok(_) => (),
		Err(s) => println!("{:?}", s)
	}

	// Compute numbers
	match json_data.compute() {
		Ok(_) => (),
		Err(s) => println!("{:?}", s)
	}

	return json_data;
}

#[tauri::command]
fn set_custom_song_folder(folder: &str) {

	// Get config data
	let mut json_data = file_to_json(&PathBuf::from(r"D:\Projects\PackUI\tauri\src\packUI.config.json"));
	json_data.set("/customSongsFolder", jsondata::Json::String(folder.to_string())).expect("Could not update customSongFolder");
	fs::write(r"D:\Projects\PackUI\tauri\src\packUI.config.json", json_data.to_string()).expect("Could not write to file");
}


#[tauri::command]
fn get_all_songs(path: &str) -> Vec<Song> {

	// Wrong directory
	if !Path::exists(Path::new(path)) {
		return Vec::new()
	}

	let dirs = fs::read_dir(path).unwrap();
	let mut vec: Vec<Song> = Vec::new();

	for dir in dirs {
		let song_path = Path::new(dir.as_ref().unwrap().path().as_os_str()).join("main.adofai");

		// Check if folder is song
		if !song_path.exists() {
			continue;
		};

		// Get song data
		let json_data = file_to_json(&song_path);

		// Create song
		let song_data = Song {
			songPath: dir.as_ref().unwrap().path().as_os_str().to_os_string().into_string().unwrap(),
			title: json_data["settings"]["song"].to_string(),
			artist: json_data["settings"]["artist"].to_string(),
			author: json_data["settings"]["author"].to_string(),
			bpm: i16::try_from(json_data["settings"]["bpm"].to_integer().unwrap()).ok().unwrap(),
			seizureWarning: json_data["settings"]["seizureWarning"].to_bool().unwrap_or_default(),
			difficulty: i8::try_from(json_data["settings"]["difficulty"].to_integer().unwrap()).ok().unwrap(),
			songFileName: json_data["settings"]["songFilename"].to_string(),
			coverFileName: json_data["settings"]["previewImage"].to_string(),
			events: json_data["actions"].to_array().unwrap().len() as i32,
			tiles: json_data["pathData"].to_string().len() as i32,
			duration: 0
		};
		vec.push(song_data);
	};

	return vec;
}
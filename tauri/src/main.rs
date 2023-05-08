// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use std::fs;

fn main() {
tauri::Builder::default()
	.invoke_handler(tauri::generate_handler![get_all_songs])
	.run(tauri::generate_context!())
	.expect("error while running tauri application");
}

#[tauri::command]
fn get_all_songs(path: &str) -> Vec<String> {
	let dirs = fs::read_dir(path).unwrap();
	let mut vec: Vec<String> = Vec::new();

	for dir in dirs {
		vec.push(dir.unwrap().path().display().to_string());
	};

	return vec;
}
#![allow(dead_code)]
#![allow(non_snake_case)]

#[derive(serde::Serialize)]
pub struct Song {
	pub songPath: String,
	pub title: String,
	pub artist: String,
	pub author: String,
	pub bpm: i16,
	pub seizureWarning: bool,
	pub difficulty: i8,
	pub songFileName: String,
	pub coverFileName: String,
	pub events: i32,
	pub tiles: i32,
	pub duration: i32,
}

pub struct Settings {
	
}
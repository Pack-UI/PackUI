#![allow(dead_code)]
#![allow(non_snake_case)]

use std::str::FromStr;

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

#[derive(serde::Serialize, serde::Deserialize)]
pub struct Color {
    pub R: i8,
    pub G: i8,
    pub B: i8,
}

impl Color {
    pub fn clone(&self) -> Self {
        Color {
            R: self.R,
            G: self.B,
            B: self.B,
        }
    }

    pub fn to_string(&self) -> String {
        format!("{r}, {g}, {b}", r = self.R, g = self.G, b = self.B)
    }
}

impl FromStr for Color {
    type Err = std::num::ParseIntError;

    fn from_str(hex_code: &str) -> Result<Self, Self::Err> {
        let valid_hex: &str;
        if hex_code.starts_with('#') {
            let mut chars = hex_code.chars();
            chars.next();
            valid_hex = chars.as_str().trim();
        } else {
            valid_hex = hex_code.trim();
        }

        let r: i8 = u8::from_str_radix(&valid_hex[0..2], 16)? as i8;
        let g: i8 = u8::from_str_radix(&valid_hex[2..4], 16)? as i8;
        let b: i8 = u8::from_str_radix(&valid_hex[4..6], 16)? as i8;

        Ok(Color { R: r, G: g, B: b })
    }
}

#[derive(serde::Serialize)]
pub struct Pack {
    pub path: String,
    pub songs: Vec<Song>,
    pub title: String,
    pub author: String,
    pub artist: String,
    pub difficulty: i8,
    pub description: String,
    pub color: Color,
    pub image: Option<String>,
    pub icon: Option<String>,
}

impl Pack {
    pub fn default() -> Self {
        Pack {
            path: String::new(),
            songs: Vec::new(),
            title: "Default".to_string(),
            author: "Thijnmens".to_string(),
            artist: "Thijnmens".to_string(),
            difficulty: 0,
            description: "Please check if all folders have either a .pack or .adofai file"
                .to_string(),
            color: Color::from_str("#ffffff").unwrap(),
            image: Option::None,
            icon: Option::None,
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct DownloadPack {
    pub version: String,
    pub title: String,
    pub description: String,
    pub author: String,
    pub artist: String,
    pub difficulty: i8,
    pub tags: Option<Vec<String>>,
    pub color: Option<String>,
    pub creationDate: Option<String>,
    pub lastUpdate: Option<String>,
    pub cover: Option<String>,
    pub icon: Option<String>,
    pub songs: Vec<DownloadSong>,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct DownloadSong {
    pub title: String,
    pub author: String,
    pub artist: String,
    pub bpm: Option<i32>,
    pub download: String,
    pub seizureWarning: Option<bool>,
    pub difficulty: Option<i8>,
    pub events: Option<i32>,
    pub tiles: Option<i32>,
    pub duration: Option<i16>,
    pub cover: Option<String>,
}

#[derive(serde::Serialize)]
pub struct Settings {
    pub customSongsFolder: String,
}

#[derive(serde::Serialize)]
pub struct Data {
    pub songs: Vec<Song>,
    pub packs: Vec<Pack>,
}

impl Data {
    pub fn new() -> Self {
        Data {
            songs: Vec::new(),
            packs: Vec::new(),
        }
    }
}

pub enum HashMapData {
    String(String),
    I8(i8),
    Color(Color),
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod types;

use jsondata::Json;
use std::{
    collections::HashMap,
    fs::{self, DirEntry},
    path::{Path, PathBuf},
};
use types::{Color, Data, DownloadPack, HashMapData, Pack, Song};

fn main() {
    if !Path::exists(Path::new("packUI.config.json")) {
        fs::write("packUI.config.json", r#"{"$schema": "https://raw.githubusercontent.com/thijnmens/PackUI/main/schemas/packUI.config.schema.json","customSongsFolder": "C:\\Program Files (x86)\\Steam\\SteamLibrary\\steamapps\\common\\A Dance of Fire and Ice\\CustomSongs"}"#).expect("Could not create config file")
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_all_data,
            set_custom_song_folder,
            get_downloadable_packs,
            get_downloadable_pack_at_index
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn get_config_field(field: &str) -> Json {
    let json = file_to_json(&Path::new("packUI.config.json").to_path_buf());
    return json[field].clone();
}

fn pack_to_dict<'a>(
    path: &'a PathBuf,
    config: &'a mut HashMap<String, HashMapData>,
) -> &'a HashMap<String, HashMapData> {
    let mut config_bytes = fs::read_to_string(path).unwrap().as_bytes().to_vec();
    let config_data = remove_bom(config_bytes.as_mut());
    for line in config_data.as_str().lines() {
        let data = line.split_once('=').unwrap();
        let value: HashMapData;
        if data.1.trim().parse::<i8>().is_ok() {
            // I8
            value = HashMapData::I8(data.1.trim().parse::<i8>().unwrap())
        } else if data.1.trim().starts_with("#") {
            // Color
            value = HashMapData::Color(data.1.trim().parse::<Color>().unwrap())
        } else {
            // String
            value = HashMapData::String(data.1.trim().to_string())
        }
        config.insert(data.0.trim().to_string(), value);
    }

    return config;
}

fn remove_bom(data: &mut Vec<u8>) -> String {
    if data.starts_with(&[239]) {
        data.remove(2);
        data.remove(1);
        data.remove(0);
    }
    return String::from_utf8(data.to_vec()).unwrap();
}

fn file_to_json(path: &PathBuf) -> jsondata::Json {
    // Parse json
    let mut json_bytes = fs::read_to_string(path).unwrap().as_bytes().to_vec();
    let json_string = remove_bom(json_bytes.as_mut());
    let mut json_data = json_string.parse::<jsondata::Json>().expect(
        format!(
            "Error parsing .adofai at \"{}\"",
            &path.as_path().to_str().unwrap()
        )
        .as_str(),
    );

    // Validate json
    match json_data.validate() {
        Ok(_) => (),
        Err(s) => println!("{:?}", s),
    }

    // Compute numbers
    match json_data.compute() {
        Ok(_) => (),
        Err(s) => println!("{:?}", s),
    }

    return json_data;
}

#[tauri::command(async)]
async fn get_downloadable_packs() -> Vec<DownloadPack> {
    let mut packs: Vec<DownloadPack> = Vec::new();
    let sources = get_config_field("sources").to_array().unwrap();
    for source in sources {
        let url = source.to_string().replace("\"", "").trim().to_string();
        let r = reqwest::get(url).await.unwrap();
        let data = r.json::<DownloadPack>().await.unwrap();
        packs.push(data);
    }
    return packs;
}

#[tauri::command(async)]
async fn get_downloadable_pack_at_index(index: usize) -> DownloadPack {
    let sources = get_config_field("sources").to_array().unwrap();
    let url = sources[index]
        .to_string()
        .replace("\"", "")
        .trim()
        .to_string();
    let r = reqwest::get(url).await.unwrap();
    let data = r.json::<DownloadPack>().await.unwrap();

    return data;
}

#[tauri::command]
fn set_custom_song_folder(folder: &str) {
    // Get config data
    let mut json_data = file_to_json(&PathBuf::from("packUI.config.json"));
    json_data
        .set(
            "/customSongsFolder",
            jsondata::Json::String(folder.to_string()),
        )
        .expect("Could not update customSongFolder");
    fs::write("packUI.config.json", json_data.to_string()).expect("Could not write to file");
}

fn get_hashmap_string(key: &str, hashmap: &HashMap<String, HashMapData>) -> String {
    match hashmap.get(key).unwrap() {
        HashMapData::String(value) => return value.clone(),
        HashMapData::I8(value) => return value.to_string(),
        HashMapData::Color(value) => return value.to_string(),
    }
}

fn get_hashmap_i8(key: &str, hashmap: &HashMap<String, HashMapData>) -> i8 {
    match hashmap.get(key).unwrap() {
        HashMapData::String(value) => {
            return value.clone().as_mut().parse::<i8>().unwrap_or_default()
        }
        HashMapData::I8(value) => return value.clone(),
        HashMapData::Color(_) => return i8::default(),
    }
}

fn get_hashmap_color(key: &str, hashmap: &HashMap<String, HashMapData>) -> Color {
    match hashmap.get(key).unwrap() {
        HashMapData::String(_) => return Color { R: 0, G: 0, B: 0 },
        HashMapData::I8(_) => return Color { R: 0, G: 0, B: 0 },
        HashMapData::Color(value) => return value.clone(),
    }
}

#[tauri::command]
fn get_all_data(path: &str) -> Data {
    let mut data = Data::new();

    // Wrong directory
    if !Path::exists(Path::new(path)) {
        return data;
    }

    let dirs = fs::read_dir(path).unwrap();

    for dir in dirs {
        let song_path = Path::new(dir.as_ref().unwrap().path().as_os_str()).join("main.adofai");

        // Check if folder is song
        if !song_path.exists() {
            let dir2 = dir.as_ref().unwrap().path();
            let pack_folder = Path::new(dir2.as_os_str());
            let pack_songs = fs::read_dir(pack_folder).unwrap();

            let mut pack_data: Pack = Pack::default();

            for song in pack_songs {
                // Create Pack
                if song
                    .as_ref()
                    .unwrap()
                    .path()
                    .as_path()
                    .to_str()
                    .unwrap()
                    .ends_with(".pack")
                {
                    let mut pack_config: HashMap<String, HashMapData> = HashMap::new();
                    let pack_path = song.as_ref().unwrap().path();
                    let json_data = pack_to_dict(&pack_path, &mut pack_config);

                    pack_data = Pack {
                        path: pack_path.as_path().display().to_string(),
                        songs: Vec::new(),
                        title: get_hashmap_string("title", &json_data),
                        author: get_hashmap_string("author", &json_data),
                        artist: get_hashmap_string("artist", &json_data),
                        difficulty: get_hashmap_i8("difficulty", &json_data),
                        description: get_hashmap_string("description", &json_data),
                        color: get_hashmap_color("color", &json_data),
                        image: Option::None,
                        icon: Option::None,
                    };
                }
            }
            let pack_songs2 = fs::read_dir(pack_folder).unwrap();
            for packsong_path in pack_songs2 {
                // Add songs to pack
                if !packsong_path
                    .as_ref()
                    .unwrap()
                    .path()
                    .as_path()
                    .to_str()
                    .unwrap()
                    .ends_with(".pack")
                {
                    // Get song data
                    let song_data = file_to_json(
                        &Path::new(
                            packsong_path
                                .as_ref()
                                .unwrap()
                                .path()
                                .as_path()
                                .to_str()
                                .unwrap(),
                        )
                        .join("main.adofai"),
                    );

                    // Create song
                    let song = json_to_song(song_data, packsong_path.unwrap());

                    pack_data.songs.push(song);
                }
            }
            data.packs.push(pack_data);

            continue;
        };

        // Get song data
        let song_data = file_to_json(&song_path);

        // Create song
        let song = json_to_song(song_data, dir.unwrap());

        data.songs.push(song);
    }

    return data;
}

fn json_to_song(data: Json, dir: DirEntry) -> Song {
    return Song {
        songPath: dir.path().as_os_str().to_os_string().into_string().unwrap(),
        title: data["settings"]["song"].to_string(),
        artist: data["settings"]["artist"].to_string(),
        author: data["settings"]["author"].to_string(),
        bpm: i16::try_from(data["settings"]["bpm"].to_integer().unwrap())
            .ok()
            .unwrap(),
        seizureWarning: data["settings"]["seizureWarning"]
            .to_bool()
            .unwrap_or_default(),
        difficulty: i8::try_from(data["settings"]["difficulty"].to_integer().unwrap())
            .ok()
            .unwrap(),
        songFileName: data["settings"]["songFilename"].to_string(),
        coverFileName: data["settings"]["previewImage"].to_string(),
        events: data["actions"].to_array().unwrap().len() as i32,
        tiles: data["pathData"].to_string().len() as i32,
        duration: 0,
    };
}

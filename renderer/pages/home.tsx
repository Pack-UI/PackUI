import {useState} from "react";
import Image from "next/image";
import MapCard from "@components/mapcard";
import PackCard from "@components/packcard";
import * as electron from "electron";
import {GetAllPacks, GetAllSongs} from "@tools/communicationHelper";
import Song from "@classes/song";
import Pack from "@classes/pack";
import Translator from "@tools/translator";
import {BsPlus} from "react-icons/bs";

export default function Home() {
	let [songs, setSongs] = useState<Song[] | null>(null);
	let [packs, setPacks] = useState<Pack[] | null>(null);

	const ipcRenderer = electron.ipcRenderer || false;
	if (ipcRenderer) {
		if (songs == null) GetAllSongs(ipcRenderer).then(_ => setSongs(_));
		if (packs == null) GetAllPacks(ipcRenderer).then(_ => setPacks(_));
	}

	return <div className="text-white flex gap-4 w-full h-[90vh] p-8">
		<div
			className="border-white w-full h-full border-2 rounded-lg p-8 items-center justify-center text-center overflow-y-scroll scrollbar-pill">
			<h1 className="mb-2"><Translator translation="home.maps" /></h1>
			<hr/>
			<div className="grid grid-cols-1 grid-flow-row gap-2 my-2">
				{songs ? songs.map((song, i) => <MapCard key={i} song={song}/>) : <Image
					src="/spinner.svg"
					className="animate-spin w-5 h-5 m-auto text-white"
					alt="loading..."
					width={20}
					height={20}
				/>}
			</div>
		</div>
		<div className="border-white w-full h-full border-2 rounded-lg p-8  items-center justify-center text-center">
			<h1 className="mb-2"><Translator translation="home.packs" /></h1>
			<hr/>
			<div className="grid grid-cols-1 grid-flow-row gap-2 my-2">
				{packs ? packs.map((pack, i) => <PackCard key={i} pack={pack}/>) : <Image
					src="/spinner.svg"
					className="animate-spin w-5 h-5 m-auto text-white"
					alt="loading..."
					width={20}
					height={20}
				/>}
			</div>
		</div>
		<a href="/editor/new">
			<div className="absolute right-4 bottom-4 bg-green-600 rounded-full w-14 h-14 flex justify-center items-center cursor-pointer">
				<BsPlus className="w-12 h-12" aria-hidden="true" />
			</div>
		</a>
	</div>;
}

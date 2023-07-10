import { useState } from 'react';
import Image from 'next/image';
import MapCard from '@components/mapcard';
import PackCard from '@components/packcard';
import { GetAllPacks, GetAllSongs } from '@tools/communicationHelper';
import Song from '@classes/song';
import Pack from '@classes/pack';
import Translator from '@tools/translator';
import { BsPlus } from 'react-icons/bs';
import Link from 'next/link';
import { ipcRenderer } from 'electron';

export default function Home() {
	let [songs, setSongs] = useState<Song[] | null>(null);
	let [packs, setPacks] = useState<Pack[] | null>(null);

	if (ipcRenderer) {
		if (songs == null) GetAllSongs(ipcRenderer).then(_ => setSongs(_));
		if (packs == null && songs != null) GetAllPacks(ipcRenderer).then(_ => setPacks(_));
	}

	return (
		<div className="flex h-[90vh] w-full gap-4 p-8 text-white">
			<div className="scrollbar-pill h-full w-full items-center justify-center overflow-y-scroll rounded-lg border-2 border-white p-8 text-center">
				<h1 className="mb-2">
					<Translator translation="home.maps" />
				</h1>
				<hr />
				<div className="my-2 grid grid-flow-row grid-cols-1 gap-2">
					{songs ? (
						songs.map((song, i) => <MapCard key={i} song={song} />)
					) : (
						<Image
							src="/spinner.svg"
							className="m-auto h-5 w-5 animate-spin text-white"
							alt="loading..."
							width={20}
							height={20}
						/>
					)}
				</div>
			</div>
			<div className="h-full w-full items-center justify-center rounded-lg border-2  border-white p-8 text-center">
				<h1 className="mb-2">
					<Translator translation="home.packs" />
				</h1>
				<hr />
				<div className="my-2 grid grid-flow-row grid-cols-1 gap-2">
					{packs ? (
						packs.map((pack, i) => <PackCard key={i} pack={pack} />)
					) : (
						<Image
							src="/spinner.svg"
							className="m-auto h-5 w-5 animate-spin text-white"
							alt="loading..."
							width={20}
							height={20}
						/>
					)}
				</div>
			</div>
			<Link href="/editor/new">
				<div className="absolute bottom-4 right-4 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-green-600">
					<BsPlus className="h-12 w-12" aria-hidden="true" />
				</div>
			</Link>
		</div>
	);
}

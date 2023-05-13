'use client';

import Config from '../tauri/packUI.config.json';
import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import MapCard from './components/mapcard';

export default function Home() {
	let [songs, setSongs] = useState<Song[] | null>(null);

	useEffect(() => {
		invoke('get_all_songs', {
			path: Config.customSongsFolder,
		})
			.then((x: any) => {
				setSongs(x);
			})
			.catch(console.error);
	}, []);

	return (
		<div className=" text-white flex gap-4 w-full h-[90vh] p-8">
			<div className="border-white w-full h-full border-2 rounded-lg p-8 items-center justify-center text-center overflow-y-scroll scrollbar-pill">
				<h1 className="mb-2">Maps</h1>
				<hr />
				<div className="grid grid-cols-1 grid-flow-row gap-2 my-2">
					{songs ? (
						songs.map((song, i) => {
							return <MapCard key={i} song={song} />;
						})
					) : (
						<Image
							src="/spinner.svg"
							className="animate-spin w-5 h-5 m-auto text-white"
							alt="loading..."
							width={20}
							height={20}
						/>
					)}
				</div>
			</div>
			<div className="border-white w-full h-full border-2 rounded-lg p-8  items-center justify-center text-center">
				<h1 className="mb-2">Packs</h1>
				<hr />
			</div>
		</div>
	);
}

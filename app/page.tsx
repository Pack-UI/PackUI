'use client';

import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Home() {
	let [songs, setSongs] = useState<string[] | null>(null);

	useEffect(() => {
		invoke('get_all_songs', {
			path: 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\A Dance of Fire and Ice\\CustomSongs',
		})
			.then((x: any) => {
				console.log(x);
				setSongs(x);
			})
			.catch(console.error);
	}, []);

	return (
		<div className=" text-white flex gap-4 w-full h-full p-8">
			<div className="border-white w-full h-full border-2 rounded-lg p-8 items-center justify-center text-center">
				<h1 className="mb-2">Maps</h1>
				<hr />
				<div className="flex-1 gap-2 p-2">
					{songs ? (
						songs.map((song, i) => {
							return <h1 key={i}>{song.split('\\').at(-1)}</h1>;
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

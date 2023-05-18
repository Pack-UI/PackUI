'use client';
import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';
import DownloadCard from '../components/downloadcard';
import Image from 'next/image';

export default function Download() {
	let [data, setData] = useState<DownloadPack[] | null>(null);

	useEffect(() => {
		invoke('get_downloadable_packs')
			.then((x: any) => {
				setData(x);
			})
			.catch(console.error);
	}, []);

	return (
		<div className="m-16 text-white">
			{data ? (
				data.map((pack, i) => {
					return <DownloadCard key={i} index={i} pack={pack} />;
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
	);
}

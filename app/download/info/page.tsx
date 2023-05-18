'use client';
import { invoke } from '@tauri-apps/api/tauri';
import { useEffect, useState } from 'react';
import { BsFire, BsHash, BsDownload } from 'react-icons/bs';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function DownloadInfo() {
	let [data, setData] = useState<DownloadPack | null>(null);

	const id = Number(useSearchParams().get('id'));

	const date = new Date(Number(data?.creationDate) * 1000);

	useEffect(() => {
		invoke('get_downloadable_pack_at_index', { index: Number(id) })
			.then((x: any) => {
				setData(x);
			})
			.catch(console.error);
	}, [id]);

	if (!data) {
		return (
			<div className="m-16 text-white">
				<Image
					src="/spinner.svg"
					className="animate-spin w-5 h-5 m-auto text-white"
					alt="loading..."
					width={20}
					height={20}
				/>
			</div>
		);
	}

	console.log(data);
	return (
		<div className="mx-16 mt-16 mb-24 text-white">
			<div className="flex rounded-lg bg-white bg-opacity-5 p-2">
				<div className="h-full w-64 float-left">
					<Image
						src={data.cover ? data.cover : '/icon.png'}
						alt={`${data.title} Cover`}
						width="96"
						height="96"
						className="mt-[5%] mb-[5%] ml-[10%] object-cover h-52 w-52 shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] rounded-lg"
					/>
				</div>

				<div className="w-full float-right relative">
					<div className="flex items-center mt-3">
						<h1 className="font-bold text-lg h-8 pl-16">{data.title}</h1>
						<p className="italic font-thin text-sm ml-2 tracking-widest">
							({date.getDate()}/{date.getMonth()}/{date.getFullYear()})
						</p>
					</div>
					<p className="pl-16 mt-1">{data.description}</p>

					<div className="absolute bottom-0 w-full">
						<div className=" w-full grid grid-cols-2 grid-flow-col opacity-75 cursor-default text-center">
							<div className="group relative">
								<BsFire className="h-6 w-6 mx-auto" aria-hidden="true" />
								<p>{data.difficulty}</p>
								<div className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
									<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">
										Difficulty
									</p>
								</div>
							</div>
							<div className="group relative">
								<BsHash className="h-6 w-6 mx-auto" aria-hidden="true" />
								<p>{data.songs?.length}</p>
								<div className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
									<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">
										Songs
									</p>
								</div>
							</div>
						</div>
						<div>
							<button className="ml-16 mt-4 mb-2 p-2 rounded-t-lg bg-white bg-opacity-0 hover:bg-opacity-10 border-white border-opacity-10 border-b-4 hover:scale-105 transition-transform duration-100 ease-in-out">
								Sync selected
							</button>
							<button className="ml-16 mt-4 mb-2 p-2 rounded-t-lg bg-white bg-opacity-0 hover:bg-opacity-10 border-white border-opacity-10 border-b-4 hover:scale-105 transition-transform duration-100 ease-in-out">
								Download all
							</button>
						</div>
					</div>
				</div>
			</div>
			<div className="flex rounded-lg bg-white bg-opacity-5 p-2 mt-4">
				<div className="grid grid-flow-row grid-cols-1 border-2 p-2 border-white rounded-lg border-opacity-10">
					{data.songs.map((song, i) => {
						return (
							<div
								key={i}
								id={i.toString()}
								className="w-full flex align-middle my-2 gap-4 bg-white bg-opacity-0 cursor-default hover:bg-opacity-10"
							>
								<div className="m-1">
									<input
										className="w-5 h-5 accent-green-500 hover:scale-90 transition-all duration-100 ease-in-out"
										type="checkbox"
										id={i.toString()}
									/>
								</div>
								<h1 className="font-bold text-xl">{song.title}</h1>
								<p className="text-lg">by {song.author}</p>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

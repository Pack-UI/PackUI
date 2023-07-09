import Image from 'next/image';
import { BsDownload, BsFire, BsHash } from 'react-icons/bs';
import Pack from '@classes/pack';
import Translator from '@tools/translator';
import { ipcRenderer } from 'electron';
import ProgressPopup from '@components/progress';
import Popup from 'reactjs-popup';
import { useRef, useState } from 'react';
import { PopupActions } from 'reactjs-popup/dist/types';
import Link from 'next/link';

interface Props {
	pack: Pack;
	index: number;
}

export default function DownloadCard(props: Props) {
	let progress = useRef<PopupActions | null>(null);
	const pack = props.pack;
	const date = new Date(Number(pack.creationDate) * 1000);

	const DownloadPack = () => {
		progress.current?.open();

		function wait() {
			return new Promise(resolve => setTimeout(resolve, 1000));
		}

		if (ipcRenderer)
			ipcRenderer
				.invoke('packManager.DownloadSongsFromPack', {
					index: props.index,
					download: Array(pack.songs.length).fill(true),
				})
				.then(async () => {
					await wait();
					progress.current?.close();
				});
	};

	return (
		<>
			<Popup ref={progress} position="left center">
				<ProgressPopup count={pack.songs.length}></ProgressPopup>
			</Popup>
			<div className="relative">
				<Link href={`/download/info?id=${props.index}`}>
					<div className="mb-2 flex h-64 w-full rounded-2xl bg-white bg-opacity-5 p-2 align-middle hover:bg-opacity-20">
						<div className="float-left h-full w-52 pt-2">
							<div className="h-52 w-52 rounded-lg shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)]">
								<Image
									src={pack.coverImagePath ? pack.coverImagePath : '/logo.png'}
									alt={`${pack.title} Cover`}
									width="208"
									height="208"
									className="h-52 w-52 rounded-lg object-cover"
									onError={e => {
										e.currentTarget.src = 'https://cdn.packui.net/images/logo.png';
									}}
								/>
							</div>
						</div>

						<div className="relative float-right w-full">
							<div className="mt-3 flex items-center">
								<h1 className="h-8 pl-16 text-lg font-bold">{pack.title}</h1>
								<p className="ml-2 text-sm font-thin italic tracking-widest">
									({date.getDate()}/{date.getMonth()}/{date.getFullYear()})
								</p>
							</div>
							<p className="mt-1 pl-16">{pack.description}</p>
							<div className="absolute bottom-0 grid w-full cursor-default grid-flow-col grid-cols-2 text-center opacity-75">
								<div className="group relative">
									<BsFire className="mx-auto h-6 w-6" aria-hidden="true" />
									<p>{pack.difficulty}</p>
									<div className="absolute -bottom-6 w-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:delay-300">
										<p className="mx-auto w-fit rounded-lg bg-[#070707] px-2">
											<Translator translation="info.difficulty" />
										</p>
									</div>
								</div>
								<div className="group relative">
									<BsHash className="mx-auto h-6 w-6" aria-hidden="true" />
									<p>{pack.songs.length}</p>
									<div className="absolute -bottom-6 w-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:delay-300">
										<p className="mx-auto w-fit rounded-lg bg-[#070707] px-2">
											<Translator translation="info.songs" />
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Link>
				<div className="absolute right-2 top-2">
					<button onClick={DownloadPack}>
						<BsDownload className="m-4 h-8 w-8 cursor-pointer opacity-50 transition-all duration-100 ease-in-out hover:opacity-100" />
					</button>
				</div>
			</div>
		</>
	);
}

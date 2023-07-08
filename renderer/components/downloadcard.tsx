import Image from "next/image";
import {BsDownload, BsFire, BsHash} from "react-icons/bs";
import Pack from "@classes/pack";
import Translator from "@tools/translator";
import {ipcRenderer} from "electron";
import ProgressPopup from "@components/progress";
import Popup from "reactjs-popup";
import {useRef, useState} from "react";
import {PopupActions} from "reactjs-popup/dist/types";

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
		
		if (ipcRenderer) ipcRenderer.invoke('packManager.DownloadSongsFromPack', {index: props.index, download: Array(pack.songs.length).fill(true)})
			.then(async () => {
				await wait();
				progress.current?.close();
			});
	}

	return <>
	<Popup ref={progress} position="left center">
		<ProgressPopup count={pack.songs.length}></ProgressPopup>
	</Popup>
	<div className="relative">
		<a href={`/download/info?id=${props.index}`}>
			<div className="w-full h-64 align-middle flex bg-white bg-opacity-5 p-2 rounded-2xl hover:bg-opacity-20 mb-2">
				<div className="h-full w-52 float-left pt-2">
					<div className="shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] rounded-lg h-52 w-52">
						<Image
							src={
								pack.coverImagePath
									? pack.coverImagePath
									: '/logo.png'
							}
							alt={`${pack.title} Cover`}
							width="208"
							height="208"
							className="object-cover h-52 w-52 rounded-lg"
							onError={e => {
								e.currentTarget.src = 'https://cdn.packui.net/images/logo.png';
							}}
						/>
					</div>
				</div>
	
				<div className="w-full float-right relative">
					<div className="flex items-center mt-3">
						<h1 className="font-bold text-lg h-8 pl-16">{pack.title}</h1>
						<p className="italic font-thin text-sm ml-2 tracking-widest">
							({date.getDate()}/{date.getMonth()}/{date.getFullYear()})
						</p>
					</div>
					<p className="pl-16 mt-1">{pack.description}</p>
					<div
						className="absolute bottom-0 w-full grid grid-cols-2 grid-flow-col opacity-75 cursor-default text-center">
						<div className="group relative">
							<BsFire className="h-6 w-6 mx-auto" aria-hidden="true"/>
							<p>{pack.difficulty}</p>
							<div
								className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
								<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">
									<Translator translation="info.difficulty" />
								</p>
							</div>
						</div>
						<div className="group relative">
							<BsHash className="h-6 w-6 mx-auto" aria-hidden="true"/>
							<p>{pack.songs.length}</p>
							<div
								className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
								<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">
									<Translator translation="info.songs" />
								</p>
							</div>
						</div>
					</div>
				</div>			
			</div>
		</a>
		<div className="absolute right-2 top-2">
			<button onClick={DownloadPack}>
				<BsDownload
					className="h-8 w-8 m-4 cursor-pointer opacity-50 hover:opacity-100 transition-all duration-100 ease-in-out"/>
			</button>
		</div>
	</div>
	</>
}

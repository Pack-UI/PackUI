import {useRef, useState} from "react";
import {BsFire, BsHash, BsRecordFill} from "react-icons/bs";
import Image from "next/image";
import Popup from "reactjs-popup";
import {useRouter} from "next/router"
import {PopupActions} from "reactjs-popup/dist/types";
import ProgressPopup from "@components/progress";
import Pack from "@classes/pack";
import {ipcRenderer} from "electron";
import {AiOutlineArrowLeft} from "react-icons/ai";
import {VerifyPackIntegrity} from "@tools/communicationHelper";
import Translator from "@tools/translator";

export default function DownloadInfo() {
	let [pack, setPack] = useState<Pack | null>(null);
	let [installedSongs, setInstalledSongs] = useState<boolean[] | null>(null);
	let [count, setCount] = useState<number>(0);
	let indeterminateCheckbox = useRef<HTMLInputElement | null>(null);
	let progress = useRef<PopupActions | null>(null);
	let integrity = useRef<PopupActions | null>(null);

	let checkboxRefs: HTMLInputElement[] = [];

	let setRef = (ref: HTMLInputElement) => {
		checkboxRefs.push(ref);
		if (checkboxRefs.length === installedSongs.length) {

			installedSongs.forEach((installed, index) => checkboxRefs[index].checked = installed);

			const installedSongAmount = installedSongs.filter(e => e).length;

			if (installedSongAmount === checkboxRefs.length) {
				indeterminateCheckbox.current.checked = true;
				indeterminateCheckbox.current.indeterminate = false;
			} else if (installedSongAmount != 0) {
				indeterminateCheckbox.current.checked = false;
				indeterminateCheckbox.current.indeterminate = true;
			}
		}
	};

	const router = useRouter();
	const id = Number(router.query["id"]);
	const date = new Date(Number(pack?.creationDate) * 1000);

	if (ipcRenderer) {
		if (pack == null) ipcRenderer.invoke('packManager.GetPackAtIndex', id).then(_ => _ == undefined ? undefined : setPack(_));
		if (installedSongs == null && pack != null) ipcRenderer.invoke('fileParser.GetCacheFromPack', pack)
			.then(cache => setInstalledSongs(pack.songs.map((song) => cache.filter(e => e.name == song.title).length != 0)))
			.catch(() => installedSongs = new Array<boolean>(pack.songs.length))
	}

	function Sync() {
		let download: boolean[] = [];
		checkboxRefs.forEach(checkbox => download.push(checkbox.checked));
		setCount(download.filter(e => e).length);

		progress.current?.open();

		function wait() {
			return new Promise(resolve => setTimeout(resolve, 1000));
		}

		if (ipcRenderer) {
			ipcRenderer.invoke('packManager.DownloadSongsFromPack', {index: id, download: download}).then(async () => {
				await wait();
				progress.current?.close();
			});
		}
	}

	function ReloadPage() {
		router.reload();
	}

	if (!pack || !installedSongs) {
		return <div className="m-16 text-white">
			<Image
				src="/spinner.svg"
				className="animate-spin w-5 h-5 m-auto text-white"
				alt="loading..."
				width={20}
				height={20}
			/>
		</div>;
	}


	return <div className="mx-16 mt-16 mb-24 text-white relative">
		<Popup ref={progress} position="left center" onClose={ReloadPage}>
			<ProgressPopup count={count}></ProgressPopup>
		</Popup>
		<Popup ref={integrity} position="left center">
			<div className="w-screen h-screen bg-black bg-opacity-50 text-white">
				<div className="w-1/2 h-1/3 absolute top-1/3 left-1/4 bg-gray-900 bg-opacity-100 rounded-lg shadow-2xl">
					<h1><Translator translation="info.failedSongs" /></h1>
				</div>
			</div>
		</Popup>
		<div className="flex rounded-lg bg-white bg-opacity-5 p-2 h-64">
			<div className="absolute top-2 right-2 z-10">
				<a href="/download">
					<AiOutlineArrowLeft className="h-6 w-6 mx-auto" aria-hidden="true"/>
				</a>
			</div>
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

				<div className="absolute bottom-0 w-full">
					<div className=" w-full grid grid-cols-2 grid-flow-col opacity-75 cursor-default text-center">
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
							<p>{pack.songs?.length}</p>
							<div
								className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
								<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">
									<Translator translation="info.songs" />
								</p>
							</div>
						</div>
					</div>
					<hr className="ml-12 mr-4 px-4 mt-2 opacity-25"/>
					<div className="flex mx-16 mt-4 mb-2 gap-16">
						<button
							className="p-2 rounded-t-lg bg-white bg-opacity-0 hover:bg-opacity-10 border-white border-opacity-10 border-b-4 hover:scale-105 transition-transform duration-100 ease-in-out"
							onClick={() => Sync()}
						>
							<Translator translation="info.syncSelected" />
						</button>
						<button
							className="p-2 rounded-t-lg bg-white bg-opacity-0 hover:bg-opacity-10 border-white border-opacity-10 border-b-4 hover:scale-105 transition-transform duration-100 ease-in-out"
							onClick={() => {
								if (indeterminateCheckbox.current) {
									indeterminateCheckbox.current.indeterminate = false;
									indeterminateCheckbox.current.checked = true;

									checkboxRefs.forEach((ref, i) => {
										checkboxRefs[i].checked = true;
									});

									Sync();
								}
							}}
						>
							<Translator translation="info.downloadAll" />
						</button>
						<button
							className="p-2 rounded-t-lg bg-white bg-opacity-0 hover:bg-opacity-10 border-white border-opacity-10 border-b-4 hover:scale-105 transition-transform duration-100 ease-in-out"
							onClick={() => VerifyPackIntegrity(ipcRenderer, pack)}
						>
							<Translator translation="info.verifyIntegrity" />
						</button>
					</div>
				</div>
			</div>
		</div>

		<div className="flex-1 rounded-lg bg-white bg-opacity-5 p-2 mt-4">
			<div className="p-2 ml-1">
				<input
					className="w-5 h-5 accent-green-500 hover:scale-90 transition-all duration-100 ease-in-out"
					type="checkbox"
					ref={indeterminateCheckbox}
					onChange={() => {
						if (indeterminateCheckbox.current?.checked) {
							checkboxRefs.forEach((ref, i) => {
								checkboxRefs[i].checked = true;
							});
						} else {
							checkboxRefs.forEach((ref, i) => {
								checkboxRefs[i].checked = false;
							});
						}
					}}
				/>
			</div>
			<div className="grid grid-flow-row grid-cols-1 border-2 p-2 border-white rounded-lg border-opacity-10">
				{pack.songs.map((song, i) => {
					if (song.download.trim() == "") {
						console.log(song.title);
					}
					return <div
						key={i}
						id={i.toString()}
						className="w-full flex align-middle my-2 gap-4 bg-white bg-opacity-0 cursor-default hover:bg-opacity-10"
					>
						<div className="ml-1 h-min my-auto">
							<input
								className="w-5 h-5 mt-1 accent-green-500 hover:scale-90 transition-all duration-100 ease-in-out"
								type="checkbox"
								ref={setRef}
								id={i.toString()}
								onChange={() => {
									if (
										checkboxRefs.filter(e => !e.checked).length == 0 &&
										indeterminateCheckbox.current
									) {
										indeterminateCheckbox.current.indeterminate = false;
										indeterminateCheckbox.current.checked = true;
									} else if (
										checkboxRefs.filter(e => e.checked).length == 0 &&
										indeterminateCheckbox.current
									) {
										indeterminateCheckbox.current.indeterminate = false;
										indeterminateCheckbox.current.checked = false;
									} else if (indeterminateCheckbox.current) {
										indeterminateCheckbox.current.indeterminate = true;
										indeterminateCheckbox.current.checked = false;
									}
								}}
							/>
						</div>
						<h1 className="font-bold text-xl h-fit my-auto">
							{song.title}
						</h1>
						<p className="text-lg h-fit my-auto"><Translator translation="info.madeBy" /> {song.author}</p>
						<BsRecordFill
							className={`${
								installedSongs[i]
									? "text-green-600"
									: "text-red-500"
							} h-6 w-6 ml-auto mr-2 rounded-full my-auto`}
						/>
					</div>;
				})}
			</div>
		</div>
	</div>;
}

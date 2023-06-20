import {useEffect, useRef, useState} from "react";
import {BsFire, BsHash, BsRecordFill} from "react-icons/bs";
import Image from "next/image";
import Popup from "reactjs-popup";
import {PopupActions} from "reactjs-popup/dist/types";
import ProgressPopup from "../../../components/progress";
import Pack from "../../../../main/classes/pack";
import {useRouter} from 'next/router';
import {ipcRenderer} from "electron";
import {AiOutlineArrowLeft} from "react-icons/ai";
import Link from "next/link";

export default function DownloadInfo() {
	let [pack, setPack] = useState<Pack | null>(null);
	let [count, setCount] = useState<number>(0);
	let indeterminateCheckbox = useRef<HTMLInputElement | null>(null);
	let progress = useRef<PopupActions | null>(null);

	let checkboxRefs: HTMLInputElement[] = [];
	
	let setRef = (ref: HTMLInputElement) => checkboxRefs.push(ref);

	const id = Number(useRouter().query["id"]);
	const date = new Date(Number(pack?.creationDate) * 1000);

	if (ipcRenderer) {
		if (pack == null) ipcRenderer.invoke('packManager.GetPackByIndex', id).then(data => setPack(data));
	}
	
	async function Sync() {
		let download: boolean[] = [];
		checkboxRefs.forEach(checkbox => download.push(checkbox.checked));
		setCount(download.filter(e => e).length);

		progress.current?.open();

		//let e = await invoke("sync_packs", {pack: pack, download});

		function wait() {
			return new Promise(resolve => setTimeout(resolve, 1000));
		}

		await wait();

		progress.current?.close();
	}

	if (!pack) {
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

	return (
		<div className="mx-16 mt-16 mb-24 text-white relative">
		<Popup ref={progress} position="left center">
			<ProgressPopup count={count}></ProgressPopup>
		</Popup>
		<div className="flex rounded-lg bg-white bg-opacity-5 p-2">
			<div className="absolute top-2 right-2 z-10">
				<a href="/download" >
					<AiOutlineArrowLeft className="h-6 w-6 mx-auto" aria-hidden="true" />
				</a>
			</div>
			<div className="h-full w-64 float-left">
				<div className="mt-[5%] mb-[5%] ml-[10%] object-cover h-52 w-52 shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] rounded-lg">
					<Image
						src={pack.coverImagePath || "/icon.png"}
						alt={`${pack.title} Cover`}
						width="208"
						height="208"
						className="rounded-lg"
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
									Difficulty
								</p>
							</div>
						</div>
						<div className="group relative">
							<BsHash className="h-6 w-6 mx-auto" aria-hidden="true"/>
							<p>{pack.songs?.length}</p>
							<div
								className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
								<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">
									Songs
								</p>
							</div>
						</div>
					</div>
					<hr className="ml-12 mr-4 px-4 mt-2 opacity-25"/>
					<div>
						<button
							className="ml-16 mt-4 mb-2 p-2 rounded-t-lg bg-white bg-opacity-0 hover:bg-opacity-10 border-white border-opacity-10 border-b-4 hover:scale-105 transition-transform duration-100 ease-in-out"
							onClick={() => Sync()}
						>
							Sync selected
						</button>
						<button
							className="ml-16 mt-4 mb-2 p-2 rounded-t-lg bg-white bg-opacity-0 hover:bg-opacity-10 border-white border-opacity-10 border-b-4 hover:scale-105 transition-transform duration-100 ease-in-out"
							onClick={() => {
								if (indeterminateCheckbox.current) {
									indeterminateCheckbox.current.indeterminate = false;
									indeterminateCheckbox.current.checked = true;

									checkboxRefs.forEach((ref, i) => {
										checkboxRefs[i].checked = true;
									});
								}
							}}
						>
							Download all
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
						<p className="text-lg h-fit my-auto">by {song.author}</p>
						<BsRecordFill
							className={`${
								song.download.trim() == ""
									? "text-gray-600"
									: "text-red-500"
							} h-6 w-6 ml-auto mr-2 rounded-full my-auto`}
						/>
					</div>;
				})}
			</div>
		</div>
	</div>
	);
}
import { useEffect, useRef, useState } from 'react';
import { BsFire, BsHash, BsRecordFill } from 'react-icons/bs';
import Image from 'next/image';
import Popup from 'reactjs-popup';
import { useRouter } from 'next/router';
import { PopupActions } from 'reactjs-popup/dist/types';
import ProgressPopup from '@components/progress';
import Pack from '@classes/pack';
import { ipcRenderer } from 'electron';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { VerifyPackIntegrity } from '@tools/communicationHelper';
import Translator from '@tools/translator';
import Link from 'next/link';
import Song from '@classes/song';
import Notifications from '@tools/notifications';

export default function DownloadInfo() {
	let [pack, setPack] = useState<Pack | null>(null);
	let [songs, setSongs] = useState<Song[] | null>(null);
	let [installedSongs, setInstalledSongs] = useState<boolean[] | null>(null);
	let [count, setCount] = useState<number>(0);
	let [searchInput, setSearchInput] = useState<string>('');

	let indeterminateCheckbox = useRef<HTMLInputElement | null>(null);
	let progress = useRef<PopupActions | null>(null);
	let integrity = useRef<PopupActions | null>(null);

	let checkboxRefs: HTMLInputElement[] = [];

	// Set checkbox refs
	let setRef = (ref: HTMLInputElement) => {
		checkboxRefs.push(ref);
		if (checkboxRefs.length === installedSongs.length) {
			installedSongs.forEach((installed, index) => {
				if (checkboxRefs[index]) checkboxRefs[index].checked = installed;
			});

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
	const id = Number(router.query['id']);
	const date = new Date(Number(pack?.creationDate) * 1000);

	// Get data
	if (pack && songs == null) setSongs(pack.songs);
	if (ipcRenderer) {
		if (pack == null)
			ipcRenderer
				.invoke('packManager.GetPackAtIndex', id)
				.then(_ => (_ == undefined ? undefined : setPack(_)))
				.catch(e => Notifications.error(e));
		if (installedSongs == null && pack != null)
			ipcRenderer
				.invoke('fileParser.GetCacheFromPack', pack)
				.then(cache =>
					setInstalledSongs(pack.songs.map(song => cache.filter(e => e.name == song.title).length != 0))
				)
				.catch(() => (installedSongs = new Array<boolean>(pack.songs.length)));
	}

	function Sync(all: boolean = false) {
		let download: boolean[] = [];
		all
			? (download = Array(pack.songs.length).fill(true))
			: checkboxRefs.forEach(checkbox => download.push(checkbox.checked));
		setCount(download.filter(e => e).length);

		progress.current?.open();

		function wait() {
			return new Promise(resolve => setTimeout(resolve, 1000));
		}

		if (ipcRenderer) {
			ipcRenderer
				.invoke(all ? 'packManager.DownloadSongsFromPack' : 'packManager.SyncPack', {
					index: id,
					download: download,
				})
				.then(async () => {
					await wait();
					progress.current?.close();
				})
				.catch(e => Notifications.error(e));
		}
	}

	function ReloadPage() {
		router.reload();
	}

	// Search
	useEffect(() => {
		function GetSearchQuery(song: Song): string {
			return `${song.title},${song.artist},${song.author}`.toLowerCase();
		}

		const delayDebounceFn = setTimeout(() => {
			if (!pack) return;
			if (searchInput == '' && songs.length == pack.songs.length) return;

			if (searchInput == '') setSongs(pack.songs);
			else
				setSongs(
					pack.songs.filter(song => {
						return searchInput
							.toLowerCase()
							.split(',')
							.map(search => {
								// for each search, check all fields
								return (
									GetSearchQuery(song)
										.split(',')
										.filter(query => query.trim().includes(search.trim())).length > 0
								);
							})
							.every(e => e);
					})
				);
		}, 250);

		return () => clearTimeout(delayDebounceFn);
	}, [searchInput]);

	// If loading return spinner
	if (!pack || !installedSongs || !songs) {
		Translator('info.search.placeholder'); // This is needed for some reason
		return (
			<div className="m-16 text-white">
				<Image
					src="/spinner.svg"
					className="m-auto h-5 w-5 animate-spin text-white"
					alt="loading..."
					width={20}
					height={20}
				/>
			</div>
		);
	}

	return (
		<div className="relative mx-16 mb-24 mt-16 text-white">
			<Popup ref={progress} position="left center" onClose={ReloadPage}>
				<ProgressPopup count={count}></ProgressPopup>
			</Popup>
			<Popup ref={integrity} position="left center">
				<div className="h-screen w-screen bg-black bg-opacity-50 text-white">
					<div className="absolute left-1/4 top-1/3 h-1/3 w-1/2 rounded-lg bg-gray-900 bg-opacity-100 shadow-2xl">
						<h1>
							<Translator translation="info.failedSongs" />
						</h1>
					</div>
				</div>
			</Popup>
			<div className="flex h-64 rounded-lg bg-white bg-opacity-5 p-2">
				<div className="absolute right-2 top-2 z-10">
					<Link href="/download">
						<AiOutlineArrowLeft className="mx-auto h-6 w-6" aria-hidden="true" />
					</Link>
				</div>
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

					<div className="absolute bottom-0 w-full">
						<div className=" grid w-full cursor-default grid-flow-col grid-cols-2 text-center opacity-75">
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
								<p>{pack.songs?.length}</p>
								<div className="absolute -bottom-6 w-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:delay-300">
									<p className="mx-auto w-fit rounded-lg bg-[#070707] px-2">
										<Translator translation="info.songs" />
									</p>
								</div>
							</div>
						</div>
						<hr className="ml-12 mr-4 mt-2 px-4 opacity-25" />
						<div className="mx-16 mb-2 mt-4 flex gap-16">
							<button
								className="rounded-t-lg border-b-4 border-white border-opacity-10 bg-white bg-opacity-0 p-2 transition-transform duration-100 ease-in-out hover:scale-105 hover:bg-opacity-10"
								onClick={() => Sync()}>
								<Translator translation="info.syncSelected" />
							</button>
							<button
								className="rounded-t-lg border-b-4 border-white border-opacity-10 bg-white bg-opacity-0 p-2 transition-transform duration-100 ease-in-out hover:scale-105 hover:bg-opacity-10"
								onClick={() => {
									if (indeterminateCheckbox.current) {
										indeterminateCheckbox.current.indeterminate = false;
										indeterminateCheckbox.current.checked = true;

										checkboxRefs.forEach((ref, i) => {
											checkboxRefs[i].checked = true;
										});

										Sync(true);
									}
								}}>
								<Translator translation="info.downloadAll" />
							</button>
							<button
								className="rounded-t-lg border-b-4 border-white border-opacity-10 bg-white bg-opacity-0 p-2 transition-transform duration-100 ease-in-out hover:scale-105 hover:bg-opacity-10"
								onClick={() => VerifyPackIntegrity(ipcRenderer, pack)}>
								<Translator translation="info.verifyIntegrity" />
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-4 flex-1 rounded-lg bg-white bg-opacity-5 p-2">
				<div className="ml-1 flex justify-between p-2">
					<input
						className="hover:scale-9 my-auto h-5 w-5 accent-green-500 transition-all duration-100 ease-in-out"
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
					<input
						className="my-auto h-7 w-1/2 rounded-lg bg-gray-700 p-2 align-middle text-lg font-bold"
						type="text"
						onChange={e => setSearchInput(e.target.value)}
						placeholder={Translator('info.search.placeholder')}
					/>
				</div>
				<div className="grid grid-flow-row grid-cols-1 rounded-lg border-2 border-white border-opacity-10 p-2">
					{songs.map((song, i) => {
						return (
							<div
								key={i}
								id={i.toString()}
								className="my-2 flex w-full cursor-default gap-4 bg-white bg-opacity-0 align-middle hover:bg-opacity-10">
								<div className="my-auto ml-1 h-min">
									<input
										className="mt-1 h-5 w-5 accent-green-500 transition-all duration-100 ease-in-out hover:scale-90"
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
								<h1 className="my-auto h-fit text-xl font-bold">{song.title}</h1>
								<p className="my-auto h-fit text-lg">
									<Translator translation="info.madeBy" /> {song.author}
								</p>
								<BsRecordFill
									className={`${
										installedSongs[i] ? 'text-green-600' : 'text-red-500'
									} my-auto ml-auto mr-2 h-6 w-6 rounded-full`}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

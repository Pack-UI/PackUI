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
import { BiRefresh } from 'react-icons/bi';
import Notifications from '@tools/notifications';

export default function Home() {
	let [songs, setSongs] = useState<Song[] | null>(null);
	let [packs, setPacks] = useState<Pack[] | null>(null);

	if (ipcRenderer) {
		if (songs == null)
			GetAllSongs(ipcRenderer)
				.then(_ => setSongs(_))
				.catch(e => Notifications.error(e));
		if (packs == null && songs != null)
			GetAllPacks(ipcRenderer)
				.then(_ => setPacks(_))
				.catch(e => Notifications.error(e));
	}

	const refreshSongs = () => {
		Notifications.info('Reloading songs');
		GetAllSongs(ipcRenderer, true)
			.then(_ => setSongs(_))
			.catch(e => Notifications.error(e));
	};

	const refreshPacks = () => {
		Notifications.info('Reloading packs');
		GetAllPacks(ipcRenderer, true)
			.then(_ => setPacks(_))
			.catch(e => Notifications.error(e));
	};

	const importPack = () => {
		ipcRenderer
			.invoke('utils.ShowOpenDialog', {
				title: 'Import pack',
				message: 'Import pack',
				properties: ['openFile', 'multiSelections'],
				filters: [{ name: 'Pack', extensions: ['zip'] }],
			})
			.then(saveTo => {
				if (!saveTo.canceled) {
					Notifications.info('Starting pack import');
					ipcRenderer
						.invoke('packManager.ImportPack', saveTo.filePaths)
						.then(_ => {
							ipcRenderer.invoke('fileParser.GetAllSongs', true).then(_ => setSongs(_));
							ipcRenderer.invoke('fileParser.GetAllPacks', true).then(_ => setPacks(_));
							Notifications.success('Finished import');
						})
						.catch(_ => {
							Notifications.error('Something went wrong while importing');
						});
				}
			});
	};

	return (
		<div className="flex h-[90vh] w-full gap-4 p-8 text-white">
			<div className="scrollbar-pill h-full w-full items-center justify-center overflow-y-scroll rounded-lg border-2 border-white p-8 text-center">
				<h1 className="relative mb-2">
					<Translator translation="home.maps" />
					<BiRefresh
						className="absolute right-0 top-0 h-8 w-8 cursor-pointer opacity-20 transition-all duration-200 ease-in-out hover:-rotate-180 hover:opacity-100"
						aria-hidden={true}
						onClick={refreshSongs}
					/>
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
				<h1 className="relative mb-2">
					<button
						className="absolute -top-1 left-0 mr-2 rounded-md bg-gray-700 px-1 shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] transition-all duration-100 ease-in-out hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(100,100,100,0.15)]"
						onClick={importPack}>
						<p className="px-2 text-lg">Import</p>
					</button>
					<Translator translation="home.packs" />
					<BiRefresh
						className="absolute right-0 top-0 h-8 w-8 cursor-pointer opacity-20 transition-all duration-200 ease-in-out hover:-rotate-180 hover:opacity-100"
						aria-hidden={true}
						onClick={refreshPacks}
					/>
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
			<Link href="/editor/edit">
				<div className="absolute bottom-4 right-4 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-green-600">
					<BsPlus className="h-12 w-12" aria-hidden="true" />
				</div>
			</Link>
		</div>
	);
}

import { useEffect, useState } from 'react';
import DownloadCard from '@components/downloadcard';
import Image from 'next/image';
import { ipcRenderer } from 'electron';
import Pack from '@classes/pack';
import { BiRefresh } from 'react-icons/bi';
import Song from '@classes/song';

export default function Download() {
	let [packs, setPacks] = useState<Pack[] | null>(null);
	let [filteredPacks, setFilteredPacks] = useState<Pack[] | null>(null);
	let [searchInput, setSearchInput] = useState<string>('');

	if (packs && !filteredPacks) setFilteredPacks(packs);
	if (ipcRenderer) {
		if (packs == null)
			ipcRenderer
				.invoke('packManager.GetDownloadablePacks')
				.then(_ => setPacks(_))
				.catch(e => console.error(e));
	}

	const refreshPacks = () => {
		if (ipcRenderer)
			ipcRenderer
				.invoke('packManager.GetDownloadablePacks', true)
				.then(_ => {
					setPacks(_);
					setFilteredPacks(_);
				})
				.catch(e => console.error(e));
		setPacks([]);
		setFilteredPacks([]);
	};

	// Search
	useEffect(() => {
		function GetSearchQuery(pack: Pack): string {
			return `${pack.title},${pack.artist},${pack.author}`.toLowerCase();
		}

		const delayDebounceFn = setTimeout(() => {
			if (!packs) return;
			if (searchInput == '' && packs.length == filteredPacks.length) return;

			if (searchInput == '') setFilteredPacks(packs);
			else
				setFilteredPacks(
					packs.filter(pack => {
						return searchInput
							.toLowerCase()
							.split(',')
							.map(search => {
								// for each search, check all fields
								return (
									GetSearchQuery(pack)
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

	return (
		<div className="mx-16 mt-8 text-white">
			<div className="mb-4 flex justify-between">
				<form className="flex w-full gap-4">
					<input
						type="text"
						className="h-12 w-1/2 p-2"
						placeholder="Search"
						onChange={e => setSearchInput(e.target.value)}
					/>
				</form>
				<BiRefresh
					className="h-12 w-12 cursor-pointer opacity-20 transition-all duration-200 ease-in-out hover:-rotate-180 hover:opacity-100"
					aria-hidden={true}
					onClick={refreshPacks}
				/>
			</div>
			<div>
				<div className="relative">
					{filteredPacks && packs?.length != 0 ? (
						filteredPacks.map((pack, i) => <DownloadCard key={i} index={i} pack={pack} />)
					) : (
						<div className="mx-auto flex w-5 justify-center">
							<Image
								src="/spinner.svg"
								className="mx-auto h-5 w-5 animate-spin text-white"
								alt="loading..."
								width={20}
								height={20}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

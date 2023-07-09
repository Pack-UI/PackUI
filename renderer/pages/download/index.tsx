import { useState } from 'react';
import DownloadCard from '@components/downloadcard';
import Image from 'next/image';
import { ipcRenderer } from 'electron';
import Pack from '@classes/pack';
import { BiRefresh } from 'react-icons/bi';

export default function Download() {
	let [packs, setPacks] = useState<Pack[] | null>(null);

	if (ipcRenderer) {
		if (packs == null) ipcRenderer.invoke('packManager.GetDownloadablePacks').then(_ => setPacks(_));
	}

	const refreshPacks = () => {
		if (ipcRenderer) ipcRenderer.invoke('packManager.GetDownloadablePacks', true).then(_ => setPacks(_));
		setPacks([]);
	};

	return (
		<div className="mx-16 mt-8 text-white">
			<div className="mb-4 flex">
				<span className="w-full" />
				<BiRefresh
					className="h-12 w-12 cursor-pointer opacity-20 transition-all duration-200 ease-in-out hover:-rotate-180 hover:opacity-100"
					aria-hidden={true}
					onClick={refreshPacks}
				/>
			</div>
			<div>
				<div className="relative">
					{packs && packs?.length != 0 ? (
						packs.map((pack, i) => <DownloadCard key={i} index={i} pack={pack} />)
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

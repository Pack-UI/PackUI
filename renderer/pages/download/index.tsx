import {useState} from "react";
import DownloadCard from "@components/downloadcard";
import Image from "next/image";
import {ipcRenderer} from "electron";
import Pack from '@classes/pack';
import {BiRefresh} from "react-icons/bi";

export default function Download() {
	let [packs, setPacks] = useState<Pack[] | null>(null);

	if (ipcRenderer) {
		if (packs == null) ipcRenderer.invoke('packManager.GetDownloadablePacks').then(_ => setPacks(_));
	}
	
	const refreshPacks = () => {
		if (ipcRenderer) ipcRenderer.invoke('packManager.GetDownloadablePacks', true).then(_ => setPacks(_));
		setPacks([])
	}

	return <div className="mx-16 mt-8 text-white">
		<div className="flex mb-4">
			<span className="w-full" />
			<BiRefresh className="w-12 h-12 cursor-pointer hover:-rotate-180 transition-all duration-200 ease-in-out opacity-20 hover:opacity-100" aria-hidden={true} onClick={refreshPacks} />
		</div>
		<div>		
			<div className="relative">
				{packs && packs?.length != 0
					? packs.map((pack, i) => <DownloadCard key={i} index={i} pack={pack}/>)
					: <div className="flex justify-center w-5 mx-auto">
						<Image
							src="/spinner.svg"
							className="animate-spin w-5 h-5 mx-auto text-white"
							alt="loading..."
							width={20}
							height={20}
						/>
					</div>
				}
			</div>
		</div>
	</div>
}

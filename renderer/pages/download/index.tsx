import {useEffect, useState} from "react";
import DownloadCard from "../../components/downloadcard";
import Image from "next/image";
import {ipcRenderer} from "electron";
import Pack from '../../../main/classes/pack';

export default function Download() {
	let [packs, setPacks] = useState<Pack[] | null>(null);
	
	if (ipcRenderer) {
		if (packs == null) ipcRenderer.invoke('packManager.GetDownloadablePacks').then(_ => setPacks(_));
	}
	
	return <div className="m-16 text-white">
		{packs ? packs.map((pack, i) => <DownloadCard key={i} index={i} pack={pack}/>) : (
			<div className="flex justify-center w-5 mx-auto">
				<Image
					src="/spinner.svg"
					className="animate-spin w-5 h-5 mx-auto text-white"
					alt="loading..."
					width={20}
					height={20}
				/>
			</div>)}
	</div>;
}

import Popup from "reactjs-popup";
import {useState} from "react";
import {ipcRenderer} from "electron";
import log from "electron-log";
import {GetErrorMessage} from "../public/ErrorTitles";

interface Status {
	shown: boolean,
	message: string
}

export default function ErrorPopup() { 
	const [status, toggleStatus] = useState<Status>({shown: false, message: ""})
	
	if (ipcRenderer) {
		ipcRenderer.on('onError', (event, data: log.LogMessage) => {
			toggleStatus({ shown: true, message: data.data.join(', ')})
		})
	}
	
	return (
		<Popup open={status.shown} position="center center" onClose={() => toggleStatus({ shown: false, message: status.message })} >
			<div className="bg-black rounded-3xl text-white bg-opacity-90 w-[50vw] h-[50vh] bg-black flex-1 p-4 relative">
				<h1 className="text-2xl font-bold mx-auto text-center">{GetErrorMessage()}</h1>
				<hr className="my-4" />
				<p className="text-xl font-mono mx-auto">{status.message}</p>
				<p className="absolute bottom-4 opacity-25 text-center w-full -ml-4">Click anywhere to close</p>
			</div>
		</Popup>
	)
}

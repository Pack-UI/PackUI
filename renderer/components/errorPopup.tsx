import Popup from 'reactjs-popup';
import { useState } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { GetErrorMessage } from '../public/ErrorTitles';
import Translator from '@tools/translator';

interface Status {
	shown: boolean;
	message: string;
	location: string;
}

export default function ErrorPopup() {
	const [status, toggleStatus] = useState<Status>({
		shown: false,
		message: '',
		location: '',
	});

	if (ipcRenderer) {
		ipcRenderer.on('onError', (event, data: log.LogMessage) =>
			toggleStatus({
				shown: true,
				message: data.data.join(', '),
				location: data.scope,
			})
		);
	}

	return (
		<Popup
			open={status.shown}
			position="center center"
			onClose={() =>
				toggleStatus({
					shown: false,
					message: status.message,
					location: status.location,
				})
			}>
			<div className="relative h-[50vh] w-[50vw] flex-1 rounded-3xl bg-black bg-black bg-opacity-90 p-4 text-white">
				<h1 className="mx-auto text-center text-2xl font-bold">{GetErrorMessage()}</h1>
				<hr className="my-4" />
				<p className="mx-auto font-mono text-xl">{status.message}</p>
				<p className="mx-auto font-mono text-xl">{status.location}</p>
				<p className="absolute bottom-4 -ml-4 w-full text-center opacity-25">
					<Translator translation="error.close" />
				</p>
			</div>
		</Popup>
	);
}

import Image from 'next/image';
import ProgressBar from '@ramonak/react-progress-bar';
import { useState } from 'react';
import { ipcRenderer } from 'electron';
import Translator from '@tools/translator';

interface Props {
	count: number;
}

export default function ProgressPopup(props: Props) {
	const [progress, setProgress] = useState<number>(0);

	ipcRenderer.on('progress.SongComplete', (event, data) => setProgress(progress + 1));

	return (
		<div className="h-screen w-screen bg-black bg-opacity-50 text-white">
			<div className="absolute left-1/4 top-1/3 h-1/3 w-1/2 rounded-lg bg-gray-900 bg-opacity-100 shadow-2xl">
				<div className="relative m-4 h-fit">
					<div className="m-auto w-fit">
						<Image
							src="/spinner.svg"
							className="h-1/5 w-1/5 animate-spin text-white"
							alt="loading..."
							width={100}
							height={100}
						/>
					</div>
					<div className="mt-12 text-center">
						<ProgressBar completed={progress} maxCompleted={props.count} customLabel=" " />
						<h1 className="mt-2">
							<Translator translation="progress.installedCount" vars={[progress, props.count]} />
						</h1>
					</div>
				</div>
			</div>
		</div>
	);
}

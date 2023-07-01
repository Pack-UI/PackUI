import Image from "next/image";
import ProgressBar from "@ramonak/react-progress-bar";
import {useState} from "react";
import {ipcRenderer} from "electron";
import Logger from "electron-log";

interface Props {
	count: number;
}

export default function ProgressPopup(props: Props) {
	const [progress, setProgress] = useState<number>(0);
	
	ipcRenderer.on('progress.SongComplete', (event, data) => setProgress(progress + 1));
	
	return <div className="w-screen h-screen bg-black bg-opacity-50 text-white">
		<div className="w-1/2 h-1/3 absolute top-1/3 left-1/4 bg-gray-900 bg-opacity-100 rounded-lg shadow-2xl">
			<div className="relative m-4 h-fit">
				<div className="m-auto w-fit">
					<Image
						src="/spinner.svg"
						className="animate-spin w-1/5 h-1/5 text-white"
						alt="loading..."
						width={100}
						height={100}
					/>
				</div>
				<div className="mt-12 text-center">
					<ProgressBar
						completed={progress}
						maxCompleted={props.count}
						customLabel=" "
					/>
					<h1 className="mt-2">
						Installed {progress} out of {props.count} songs
					</h1>
				</div>
			</div>
		</div>
	</div>;
}

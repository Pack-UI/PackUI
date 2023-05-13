'use client';

import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

function SelectFolder() {
	open({ multiple: false, directory: true })
		.then((dir) => {
			if (dir) {
				invoke('set_custom_song_folder', { folder: dir });
			}
		})
		.catch((err) => {
			console.error(err);
		});
}

export default function Settings() {
	return (
		<div className="text-white p-4">
			<h1 className="font-bold text-3xl mb-2">Settings</h1>
			<hr />
			<div className="m-2 mt-4 text-lg">
				<div className="flex gap-2">
					<label className="py-1">Custom songs folder</label>
					<input
						type="button"
						value="Select folder"
						onClick={() => SelectFolder()}
						className="rounded-lg bg-gray-700 hover:bg-gray-800 px-2 py-1 cursor-pointer"
					/>
				</div>
			</div>
		</div>
	);
}

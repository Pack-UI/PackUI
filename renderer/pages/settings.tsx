import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import {WithContext as ReactTags} from 'react-tag-input';
import {useState} from "react";
import {GetAPISourceTags, SetConfigField} from "../tools/communicationHelper";

const delimiters = [9, 13, 188]; // Keycodes for tab (\t), enter (\n) and comma (,)

function SetCustomSongsFolder() {
	if (ipcRenderer) {
		ipcRenderer.invoke('utils.ShowOpenDialog', { properties: ['openDirectory', 'createDirectory', 'promptToCreate', 'dontAddToRecent'], message: 'Select ADOFAI Custom Songs folder'}).then((result: OpenDialogReturnValue) => {
			if (!result.canceled) {
				ipcRenderer.send('config.Set', {key: 'customSongsFolder', value: result.filePaths[0]})
				alert("Updated custom songs folder to " + result.filePaths[0])
			}
		})
	}
}

export default function Settings() {
	const [tags, setTags] = useState<object[]>([])
	
	let fetchedSourceTags = false;

	if (ipcRenderer) {
		if (tags.length === 0 && !fetchedSourceTags) GetAPISourceTags(ipcRenderer).then(_ => { setTags(_); fetchedSourceTags = true; });
	}
	
	const handleDelete = i => {
		let newTags = tags.filter((tag, index) => index !== i);
		SetConfigField(ipcRenderer, 'sources', newTags.map(_tag => _tag["text"]))
		
		setTags(newTags);
	};

	const handleAddition = tag => {
		let newTags = [...tags, tag];
		SetConfigField(ipcRenderer, 'sources', newTags.map(_tag => _tag["text"]))
		
		setTags(newTags);
	};
	
	return <div className="text-white p-4">
		<h1 className="font-bold text-3xl mb-2">Settings</h1>
		<hr/>
		<div className="m-2 mt-4 text-lg">
			
			{/* Custom song folder */}
			<div className="flex gap-2">
				<label className="py-1">Custom songs folder</label>
				<input
					type="button"
					value="Select folder"
					onClick={() => SetCustomSongsFolder()}
					className="rounded-lg bg-gray-700 hover:bg-gray-800 px-2 py-1 cursor-pointer"
				/>
			</div>

			{/* APIs */}
			<div className="flex gap-2 mt-4">
				<label className="py-1">Pack download APIs</label>
				<ReactTags
					tags={tags}
					delimiters={delimiters}
					handleDelete={handleDelete}
					handleAddition={handleAddition}
					allowDragDrop={false}
					inputFieldPosition="top"
					classNames={{
						tagInputField: "rounded-lg bg-gray-700 hover:bg-gray-800 px-2 py-1 cursor-pointer text-white mb-4 w-full max-w-3/4",
						tag: "bg-gray-700 text-white rounded-lg px-2 py-1 mr-2 mt-4 align-middle hover:bg-red-400 hover:bg-opacity-20 bg-opacity-100",
						remove: "ml-1 text-red-600 text-2xl hover:scale-110 transition-all ease-in-out duration-100"
					}}
				/>
			</div>
			
		</div>
	</div>;
}

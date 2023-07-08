import Translator from "@tools/translator";
import {WithContext as ReactTags} from 'react-tag-input';
import {useState} from "react";
import {SetConfigField} from "@tools/communicationHelper";
import {ipcRenderer} from "electron";
import Song from "@classes/song";
import MapCard from "@components/mapcard";
import Image from "next/image";

const delimiters = [9, 13, 188]; // Keycodes for tab (\t), enter (\n) and comma (,)

export default function NewPack() {
	const [tags, setTags] = useState<object[]>([]);
	const [difficulty, setDifficulty] = useState<number>(1);
	const [page, setPage] = useState<number>(1);
	const [songs, setSongs] = useState<Song[]>([]);

	
	if (ipcRenderer) {
		if (songs.length === 0) ipcRenderer.invoke('fileParser.GetAllSongs').then(_ => setSongs(_));
	}

	const paginate = (array, page_size, page_number) => {
		// human-readable page numbers usually start with 1, so we reduce 1 in the first argument
		return array.slice((page_number - 1) * page_size, page_number * page_size);
	}
	
	const handleDelete = i => {
		let newTags = tags.filter((tag, index) => index !== i);
		SetConfigField(ipcRenderer, 'sources', newTags.map(_tag => _tag["text"]));

		setTags(newTags);
	};

	const handleAddition = tag => {
		let newTags = [...tags, tag];
		SetConfigField(ipcRenderer, 'sources', newTags.map(_tag => _tag["text"]));

		setTags(newTags);
	};
	
	return <div className="mx-16 mt-16 mb-24 text-white relative no-scrollbar">
		<h1 className="font-bold text-3xl ml-2 mb-2"><Translator translation="editor.new.title" /></h1>
		<hr />
		<form className="grid grid-cols-8 gap-4 mt-4 text-lg text-right bg-gray-800 rounded-lg p-4">
			<label><Translator translation="editor.new.packname.label" /></label>
			<input type="text" className="col-span-3" />

			<label><Translator translation="editor.new.author.label" /></label>
			<input type="text" className="col-span-3" />

			<label><Translator translation="editor.new.artist.label" /></label>
			<input type="text" className="col-span-3" />

			<label><Translator translation="editor.new.difficulty.label" /></label>
			<div className="col-span-1 w-full grid grid-cols-4 gap-2">
				<input type="button" value="-" className="bg-gray-700 cursor-pointer" onClick={() => difficulty > 1 ? setDifficulty(difficulty - 1) : undefined } />
				<p className="col-span-2 bg-gray-700 px-2 rounded-md shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] text-center">{difficulty}</p>
				<input type="button" value="+" className="bg-gray-700 cursor-pointer" onClick={() => difficulty < 8 ? setDifficulty(difficulty + 1) : undefined } />
			</div>

			<label><Translator translation="editor.new.color.label" /></label>
			<input type="color" className="col-span-1 w-full"  />
			
			<label className="text-left"><Translator translation="editor.new.description.label" /></label>

				<label className="col-start-3"><Translator translation="editor.new.version.label" /></label>
				<input type="text" className="col-span-1 w-full" defaultValue="1.0.0"  />
			
			<textarea className="col-span-8 w-full h-32"  />

			<label className="text-left"><Translator translation="editor.new.tags.label" /></label>
			<div className="col-span-8">
				<ReactTags
					tags={tags}
					delimiters={delimiters}
					handleDelete={handleDelete}
					handleAddition={handleAddition}
					allowDragDrop={false}
					inputFieldPosition="top"
					placeholder={Translator("editor.new.tags.placeholder")}
					classNames={{
						tagInputField: "rounded-lg bg-gray-700 px-2 py-1 text-white mb-4 w-full max-w-3/4",
						tag: "bg-gray-700 text-white rounded-lg px-2 py-1 mr-2 mt-4 align-middle hover:bg-red-400 hover:bg-opacity-20 bg-opacity-100 shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)]",
						remove: "ml-1 text-red-600 text-2xl hover:scale-110 transition-all ease-in-out duration-100"
					}}
				/>
			</div>
			
			<button className="bg-gray-700 p-2 rounded-md shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] col-start-8 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(100,100,100,0.15)]"><Translator translation="editor.new.save.button" /></button>
			
		</form>
		
		<div className="mt-4 text-lg bg-gray-800 rounded-lg p-4">
			<h1 className="font-bold mb-2"><Translator translation="info.songs" /></h1>
			<hr />
			<div className="grid grid-cols-2 grid-flow-row gap-2 mt-2 text-center">
				{paginate(songs, 8, page).map((song, index) => {
					return <MapCard song={song} />
				})}
			</div>
			<div className="flex justify-center gap-2 pt-4 w-1/5 mx-auto">
				<form className="col-span-1 w-full grid grid-cols-4 gap-2">
					<input type="button" value="<" className="bg-gray-700 cursor-pointer" onClick={() => page > 1 ? setPage(page - 1) : undefined } />
					<p className="col-span-2 bg-gray-700 px-2 rounded-md shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] text-center">{page}</p>
					<input type="button" value=">" className="bg-gray-700 cursor-pointer" onClick={() => page < Math.ceil(songs.length / 8) ? setPage(page + 1) : undefined } />
				</form>
			</div>
		</div>
	</div>;
}

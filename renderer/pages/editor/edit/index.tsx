import Translator from '@tools/translator';
import { WithContext as ReactTags } from 'react-tag-input';
import { useState } from 'react';
import { ipcRenderer, OpenDialogOptions } from 'electron';
import Song from '@classes/song';
import MapCard from '@components/mapcard';
import { useRouter } from 'next/router';
import Notifications from '@tools/notifications';

interface Pack {
	packPath: string;
	version?: string;
	title: string;
	description: string;
	author: string;
	artist: string;
	difficulty: number;
	tags?: object[];
	color: string;
	creationDate: Date;
	lastUpdate: Date;
	coverImagePath?: string;
	iconImagePath?: string;
	songs: Song[];
}

const delimiters = [9, 13, 188]; // Keycodes for tab (\t), enter (\n) and comma (,)

export default function NewPack() {
	const [page, setPage] = useState<number>(1);
	const [songs, setSongs] = useState<Song[] | null>(null);
	const [pack, setPack] = useState<Pack>({
		packPath: '/',
		title: '',
		description: '',
		author: '',
		artist: '',
		difficulty: 1,
		color: '#FFFFFF',
		creationDate: new Date(Date.now()),
		lastUpdate: new Date(Date.now()),
		songs: [],
		version: '1.0.0',
		tags: [],
	});

	const router = useRouter();

	if (ipcRenderer) {
		if (!songs)
			ipcRenderer
				.invoke('fileParser.GetAllSongs', true)
				.then(_ => setSongs(_))
				.catch(e => Notifications.error(e));
		if (router.query?.path && pack.packPath == '/')
			ipcRenderer
				.invoke('fileParser.GetPackAtPath', decodeURIComponent(router.query.path as string))
				.then(_ => setPack(_));
	}

	const paginate = (array: any[], page_size: number, page_number: number) => {
		if (!array) return [];
		return array.slice((page_number - 1) * page_size, page_number * page_size);
	};

	const handleDelete = i => {
		let newTags = pack.tags.filter((tag, index) => index !== i);
		setPack({ ...pack, tags: newTags });
	};

	const handleAddition = tag => {
		setPack({ ...pack, tags: [...pack.tags, tag] });
	};

	const handleFormChange = e => {
		// there is prob a better way to do this, but eh
		switch (e.target.id) {
			case 'title':
				setPack({ ...pack, title: e.target.value });
				break;

			case 'author':
				setPack({ ...pack, author: e.target.value });
				break;

			case 'artist':
				setPack({ ...pack, artist: e.target.value });
				break;

			case 'lowerDif':
				setPack({ ...pack, difficulty: pack.difficulty - 1 });
				break;

			case 'raiseDif':
				setPack({ ...pack, difficulty: pack.difficulty + 1 });
				break;

			case 'color':
				setPack({ ...pack, color: e.target.value });
				break;

			case 'version':
				setPack({ ...pack, version: e.target.value });
				break;

			case 'description':
				setPack({ ...pack, description: e.target.value });
				break;

			default:
				console.error(`unknown id: ${e.target.id}`);
		}
	};

	const save = e => {
		Notifications.info('Creating/updating pack');
		ipcRenderer
			.invoke('packManager.GeneratePack', pack)
			.then(_ => (!_ ? Notifications.error('failed to create pack') : undefined));
		e.preventDefault();
	};

	const exportPack = () => {
		ipcRenderer
			.invoke('utils.ShowSaveDialog', {
				title: 'Export pack to...',
				message: 'Export pack to...',
				properties: ['createDirectory', 'showOverwriteConfirmation'],
				filters: [{ name: 'Pack', extensions: ['zip'] }],
				defaultPath: `${pack.title}.zip`,
			})
			.then(saveTo => {
				if (!saveTo.canceled) {
					Notifications.info('Starting pack export, this can take a while');
					ipcRenderer
						.invoke('packManager.ExportPack', {
							packPath: pack.packPath,
							saveTo: saveTo.filePath,
						})
						.then(_ => Notifications.success('Finished exporting'))
						.catch(e => Notifications.error(e));
				}
			});
	};

	const deletePack = () => {
		Notifications.success('Deleting pack');
		ipcRenderer.invoke('packManager.DeletePack', pack.packPath).then(_ => {
			Notifications.success('Successfully deleted pack');
			router.back();
		});
	};

	return (
		<div className="no-scrollbar relative mx-16 mb-24 mt-16 text-white">
			<h1 className="mb-2 ml-2 text-3xl font-bold">
				<Translator translation="editor.new.title" />
				<button
					className="float-right mr-2 rounded-md bg-gray-700 px-1 shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] transition-all duration-100 ease-in-out hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(100,100,100,0.15)]"
					onClick={exportPack}>
					<p className="px-2 text-lg">Export</p>
				</button>
				<button
					className="float-right mr-2 rounded-md bg-gray-700 px-1 shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] transition-all duration-100 ease-in-out hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(100,100,100,0.15)]"
					onClick={deletePack}>
					<p className="px-2 text-lg">Delete</p>
				</button>
			</h1>
			<hr />
			<form className="mt-4 grid grid-cols-8 gap-4 rounded-lg bg-gray-800 p-4 text-right text-lg" onSubmit={save}>
				<label className="after:ml-0.5 after:text-red-500 after:content-['*']">
					<Translator translation="editor.new.packname.label" />
				</label>
				<input
					type="text"
					className="col-span-3"
					onChange={handleFormChange}
					id="title"
					defaultValue={pack.title}
				/>

				<label className="after:ml-0.5 after:text-red-500 after:content-['*']">
					<Translator translation="editor.new.author.label" />
				</label>
				<input
					type="text"
					className="col-span-3"
					onChange={handleFormChange}
					id="author"
					defaultValue={pack.author}
				/>

				<label className="after:ml-0.5 after:text-red-500 after:content-['*']">
					<Translator translation="editor.new.artist.label" />
				</label>
				<input
					type="text"
					className="col-span-3"
					onChange={handleFormChange}
					id="artist"
					defaultValue={pack.artist}
				/>

				<label>
					<Translator translation="editor.new.difficulty.label" />
				</label>
				<div className="col-span-1 grid w-full grid-cols-4 gap-2">
					<input
						type="button"
						value="-"
						className="cursor-pointer bg-gray-700"
						onClick={() =>
							pack.difficulty > 1 ? setPack({ ...pack, difficulty: pack.difficulty - 1 }) : undefined
						}
						onChange={handleFormChange}
						id="lowerDif"
					/>
					<p className="col-span-2 rounded-md bg-gray-700 px-2 text-center shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)]">
						{pack.difficulty}
					</p>
					<input
						type="button"
						value="+"
						className="cursor-pointer bg-gray-700"
						onClick={() =>
							pack.difficulty < 8 ? setPack({ ...pack, difficulty: pack.difficulty + 1 }) : undefined
						}
						onChange={handleFormChange}
						id="raiseDif"
					/>
				</div>

				<label>
					<Translator translation="editor.new.color.label" />
				</label>
				<input
					type="color"
					className="col-span-1 w-full"
					onChange={handleFormChange}
					id="color"
					defaultValue={pack.color}
				/>

				<label className="text-left">
					<Translator translation="editor.new.description.label" />
				</label>

				<label className="col-start-3">
					<Translator translation="editor.new.version.label" />
				</label>
				<input
					type="text"
					className="col-span-1 w-full"
					onChange={handleFormChange}
					id="version"
					defaultValue={pack.version}
				/>

				<textarea
					className="col-span-8 h-32 w-full"
					onChange={handleFormChange}
					id="description"
					defaultValue={pack.description}
				/>

				<label className="text-left">
					<Translator translation="editor.new.tags.label" />
				</label>
				<div className="col-span-8">
					<ReactTags
						tags={pack.tags}
						delimiters={delimiters}
						handleDelete={handleDelete}
						handleAddition={handleAddition}
						allowDragDrop={false}
						inputFieldPosition="top"
						placeholder={Translator('editor.new.tags.placeholder')}
						classNames={{
							tagInputField: 'rounded-lg bg-gray-700 px-2 py-1 text-white mb-4 w-full max-w-3/4',
							tag: 'bg-gray-700 text-white rounded-lg px-2 py-1 mr-2 mt-4 align-middle hover:bg-red-400 hover:bg-opacity-20 bg-opacity-100 shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)]',
							remove: 'ml-1 text-red-600 text-2xl hover:scale-110 transition-all ease-in-out duration-100',
						}}
					/>
				</div>

				<input
					type="submit"
					className="col-start-8 cursor-pointer rounded-md bg-gray-700 p-2"
					value={Translator('editor.new.save.button')}
				/>
			</form>

			<div className="mt-4 rounded-lg bg-gray-800 p-4 text-lg">
				<h1 className="mb-2 font-bold">
					<Translator translation="info.songs" />
				</h1>
				<hr />
				<div className="mt-2 grid grid-flow-row grid-cols-2 gap-2 text-center">
					{paginate(songs, 8, page).map((song: Song, index) => {
						return (
							<span
								key={index}
								data-song={song}
								aria-checked={pack.songs.filter(_ => _.songPath == song.songPath).length > 0}
								className="rounded-2xl opacity-70 hover:bg-green-900 aria-checked:bg-green-800 aria-checked:opacity-100 hover:aria-checked:bg-red-800"
								onClick={e =>
									pack.songs.filter(_ => _.songPath == song.songPath).length > 0
										? setPack({
												...pack,
												songs: pack.songs.filter(_ => _.songPath != song.songPath),
										  })
										: setPack({ ...pack, songs: [...pack.songs, song] })
								}>
								<MapCard song={song} />
							</span>
						);
					})}
				</div>
				<div className="mx-auto flex w-1/5 justify-center gap-2 pt-4">
					<form className="col-span-1 grid w-full grid-cols-4 gap-2">
						<input
							type="button"
							value="<"
							className="cursor-pointer bg-gray-700"
							onClick={() => (page > 1 ? setPage(page - 1) : undefined)}
						/>
						<p className="col-span-2 rounded-md bg-gray-700 px-2 text-center shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)]">
							{page}
						</p>
						<input
							type="button"
							value=">"
							className="cursor-pointer bg-gray-700"
							onClick={() => (page < Math.ceil(songs.length / 8) ? setPage(page + 1) : undefined)}
						/>
					</form>
				</div>
			</div>
		</div>
	);
}

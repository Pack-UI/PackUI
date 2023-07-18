import { ipcRenderer, OpenDialogReturnValue } from 'electron';
import { WithContext as ReactTags } from 'react-tag-input';
import { useState } from 'react';
import { ClearTempFolder, GetAPISourceTags, SetConfigField } from '@tools/communicationHelper';
import Dropdown from 'react-dropdown';
import { useRouter } from 'next/router';
import Translator from '@tools/translator';
import Notifications from '@tools/notifications';

const delimiters = [9, 13, 188]; // Keycodes for tab (\t), enter (\n) and comma (,)

export default function Settings() {
	const [tags, setTags] = useState<object[]>([]);
	const [availableLanguages, setAvailableLanguages] = useState<any[] | null>(null);
	const [language, setLanguage] = useState<string | null>(null);

	let fetchedSourceTags = false;
	const router = useRouter();

	if (ipcRenderer) {
		if (tags.length === 0 && !fetchedSourceTags)
			GetAPISourceTags(ipcRenderer)
				.then(_ => {
					setTags(_);
					fetchedSourceTags = true;
				})
				.catch(e => Notifications.error(e));
		if (availableLanguages == null)
			ipcRenderer
				.invoke('translator.GetAvailableLanguages')
				.then(_ =>
					setAvailableLanguages(
						_.map(lang => {
							return {
								value: lang,
								label: lang.split('.')[0],
								className: 'hover:bg-gray-950 px-2 py-1 rounded-lg',
							};
						})
					)
				)
				.catch(e => Notifications.error(e));
		if (language == null)
			ipcRenderer
				.invoke('config.Read', 'language')
				.then(_ => setLanguage(_))
				.catch(e => Notifications.error(e));
	}

	function SetCustomSongsFolder() {
		if (ipcRenderer) {
			ipcRenderer
				.invoke('utils.ShowOpenDialog', {
					properties: ['openDirectory', 'createDirectory', 'promptToCreate', 'dontAddToRecent'],
					message: 'Select ADOFAI Custom Songs folder',
				})
				.then((result: OpenDialogReturnValue) => {
					if (!result.canceled) {
						Notifications.success(`Set custom songs folder to:\n${result.filePaths[0]}`);
						ipcRenderer.send('config.Set', {
							key: 'customSongsFolder',
							value: result.filePaths[0],
						});
					}
				})
				.catch(e => Notifications.error(e));
		}
	}

	const handleDelete = i => {
		let newTags = tags.filter((tag, index) => index !== i);
		SetConfigField(
			ipcRenderer,
			'sources',
			newTags.map(_tag => _tag['text'])
		);

		setTags(newTags);
	};

	const handleAddition = tag => {
		let newTags = [...tags, tag];
		SetConfigField(
			ipcRenderer,
			'sources',
			newTags.map(_tag => _tag['text'])
		);

		setTags(newTags);
	};

	const handleLanguageChange = lang => {
		Notifications.success(`Set language to ${lang.label}`);
		ipcRenderer.send('config.Set', { key: 'language', value: lang.label });
		ipcRenderer.send('translator.ReloadTranslations');
		router.reload();
	};

	return (
		<div className="p-4 text-white">
			<h1 className="mb-2 ml-2 text-3xl font-bold">
				<Translator translation="settings.title" />
			</h1>
			<hr />
			<div className="m-2 mt-4 text-lg">
				{/* Language */}
				<div className="my-2 grid grid-cols-4 gap-2">
					<label className="col-span-1 py-1">
						<Translator translation="settings.language.label" />
					</label>
					<Dropdown
						className="relative col-span-3"
						controlClassName="absolute rounded-lg bg-gray-700 hover:bg-gray-800 px-2 py-1 cursor-pointer w-full text-center"
						menuClassName="absolute top-10 rounded-lg bg-gray-800 cursor-pointer w-full text-center"
						options={availableLanguages}
						onChange={handleLanguageChange}
						value={language}
					/>
				</div>

				{/* Custom song folder */}
				<div className="my-2 grid grid-cols-4 gap-2">
					<label className="col-span-1 py-1">
						<Translator translation="settings.customSongsFolder.label" />
					</label>
					<input
						type="button"
						value={Translator('settings.customSongsFolder.button')}
						onClick={() => SetCustomSongsFolder()}
						className="col-span-3 cursor-pointer rounded-lg bg-gray-700 px-2 py-1 hover:bg-gray-800"
					/>
				</div>

				{/* Clear download cache */}
				<div className="my-2 grid grid-cols-4 gap-2">
					<label className="col-span-1 py-1">
						<Translator translation="settings.clearDownloadCache.label" />
					</label>
					<input
						type="button"
						value={Translator('settings.clearDownloadCache.button')}
						onClick={() => {
							ClearTempFolder(ipcRenderer);
							alert('Cleared cache!');
						}}
						className="col-span-3 cursor-pointer rounded-lg bg-gray-700 px-2 py-1 hover:bg-gray-800"
					/>
				</div>

				{/* APIs */}
				<div className="my-2 grid grid-cols-4 gap-2">
					<label className="col-span-1 py-1">
						<Translator translation="settings.packDownloadApis.label" />
					</label>
					<div className="col-span-3">
						<ReactTags
							tags={tags}
							delimiters={delimiters}
							handleDelete={handleDelete}
							handleAddition={handleAddition}
							allowDragDrop={false}
							inputFieldPosition="top"
							placeholder={Translator('settings.packDownloadApis.placeholder')}
							classNames={{
								tagInputField:
									'rounded-lg bg-gray-700 hover:bg-gray-800 px-2 py-1 cursor-pointer text-white mb-4 w-full max-w-3/4',
								tag: 'bg-gray-700 text-white rounded-lg px-2 py-1 mr-2 mt-4 align-middle hover:bg-red-400 hover:bg-opacity-20 bg-opacity-100',
								remove: 'ml-1 text-red-600 text-2xl hover:scale-110 transition-all ease-in-out duration-100',
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

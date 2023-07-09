import { ipcRenderer } from 'electron';
import { JSX, useState } from 'react';
import { vsprintf } from 'sprintf-js';

interface Props {
	translation: string;
	vars?: any[];
}

export default Translator;

function Translator(props: Props): JSX.Element;
function Translator(props: any): string;

function Translator(props: unknown): unknown {
	const [translatedString, setTranslatedString] = useState<string>('');

	if (typeof props === 'string') {
		if (ipcRenderer) {
			if (translatedString == '')
				ipcRenderer.invoke('translator.GetTranslation', props).then(_ => setTranslatedString(_));
		}

		return translatedString;
	} else {
		if (ipcRenderer) {
			if (translatedString == '')
				ipcRenderer.invoke('translator.GetTranslation', props['translation']).then(_ => setTranslatedString(_));
		}

		const vars = props['vars'] || [];

		return <>{vsprintf(translatedString, vars)}</>;
	}
}

import Translator from '@tools/translator';

export default function Editor() {
	return (
		<div className="no-scrollbar relative mx-16 mb-24 mt-16 text-white">
			<h1 className="mb-2 ml-2 text-3xl font-bold">
				<Translator translation="editor.title" />
			</h1>
			<p></p>
		</div>
	);
}

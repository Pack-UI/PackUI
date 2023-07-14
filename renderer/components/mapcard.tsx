import { IoIosSpeedometer } from 'react-icons/io';
import { TbRectangle } from 'react-icons/tb';
import { BsFire } from 'react-icons/bs';
import Song from '@classes/song';
import Translator from '@tools/translator';
import path from 'path';

interface Props {
	song: Song;
}

export default function MapCard(props: Props) {
	const song = props.song;

	return (
		<div className="flex h-32 w-full cursor-pointer rounded-2xl bg-white bg-opacity-5 p-2 align-middle hover:bg-opacity-20">
			<div className="float-left h-full w-32 pt-2">
				<div className="h-24 w-24 rounded-lg shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)]">
					<img
						src={
							song.coverFileName
								? `http://localhost:24658/${path.join(song.songPath, song.coverFileName)}`
								: '/logo.png'
						}
						alt={`${song.title} Cover`}
						width="96"
						height="96"
						className="h-24 w-24 rounded-lg object-cover"
						onError={e => {
							e.currentTarget.src = 'https://cdn.packui.net/images/logo.png';
						}}
					/>
				</div>
			</div>

			<div className="relative float-right w-full">
				<h1 className="font-bold">{song.title?.replace(/<\/?[^>]+(>|$)/g, '')}</h1>
				<p className="text-sm italic opacity-70">{song.author}</p>
				<div className="absolute bottom-0 grid w-full cursor-default grid-flow-col grid-cols-3 opacity-75">
					<div className="group relative">
						<BsFire className="mx-auto h-6 w-6" aria-hidden="true" />
						<p>{song.difficulty}</p>
						<div className="absolute -bottom-6 w-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:delay-300">
							<p className="mx-auto w-fit rounded-lg bg-[#070707] px-2">
								<Translator translation="info.difficulty" />
							</p>
						</div>
					</div>
					<div className="group relative">
						<TbRectangle className="mx-auto h-6 w-6" aria-hidden="true" />
						<p>{song.tiles}</p>
						<div className="absolute -bottom-6 w-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:delay-300">
							<p className="mx-auto w-fit rounded-lg bg-[#070707] px-2">
								<Translator translation="info.tiles" />
							</p>
						</div>
					</div>
					<div className="group relative">
						<IoIosSpeedometer className="mx-auto h-6 w-6" aria-hidden="true" />
						<p>{song.bpm}</p>
						<div className="absolute -bottom-6 w-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:delay-300">
							<p className="mx-auto w-fit rounded-lg bg-[#070707] px-2">
								<Translator translation="info.bpm" />
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

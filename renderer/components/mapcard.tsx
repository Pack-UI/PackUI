import Image from 'next/image';
import {IoIosSpeedometer} from 'react-icons/io';
import {TbRectangle} from 'react-icons/tb';
import {BsFire} from 'react-icons/bs';
import Song from '../../main/classes/song';

interface Props {
	song: Song;
}

export default function MapCard(props: Props) {
	const song = props.song;

	return <div className="w-full h-32 align-middle flex bg-white bg-opacity-5 p-2 rounded-2xl hover:bg-opacity-20">
		<div className="h-full w-32 float-left">
			<Image
				src={
					song.coverFileName
						? `http://localhost:8888/api/GetImageFromDisk?file=${song.coverFileName}`
						: '/logo.png'
				}
				alt={`${song.title} Cover`}
				width="96"
				height="96"
				className="mt-[10%] ml-[10%] object-cover h-24 w-24 shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] rounded-lg"
				onError={e => {
					e.currentTarget.src = 'https://cdn.packui.net/images/logo.png';
				}}
				placeholder='blur'
				blurDataURL="/shimmer.svg"
			/>
		</div>

		<div className="w-full float-right relative">
			<h1 className="font-bold">{song.title.replace(/<\/?[^>]+(>|$)/g, '')}</h1>
			<div className="absolute bottom-0 w-full grid grid-cols-3 grid-flow-col opacity-75 cursor-default">
				<div className="group relative">
					<BsFire className="h-6 w-6 mx-auto" aria-hidden="true"/>
					<p>{song.difficulty}</p>
					<div
						className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
						<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">Difficulty</p>
					</div>
				</div>
				<div className="group relative">
					<TbRectangle className="h-6 w-6 mx-auto" aria-hidden="true"/>
					<p>{song.tiles}</p>
					<div
						className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
						<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">Tiles</p>
					</div>
				</div>
				<div className="group relative">
					<IoIosSpeedometer className="h-6 w-6 mx-auto" aria-hidden="true"/>
					<p>{song.bpm}</p>
					<div
						className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
						<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">BPM</p>
					</div>
				</div>
			</div>
		</div>
	</div>;
}

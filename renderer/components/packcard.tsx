import Image from 'next/image';
import { BsFire, BsHash } from 'react-icons/bs';
import Pack from '@classes/pack';
import Translator from '@tools/translator';

interface Props {
	pack: Pack;
}

export default function PackCard(props: Props) {
	const pack = props.pack;

	pack.title = pack.title.replace(/<\/?[^>]+(>|$)/g, '');

	return (
		<div className="flex h-32 w-full rounded-2xl bg-white bg-opacity-5 p-2 align-middle hover:bg-opacity-20">
			<div className="float-left h-full w-32 pt-2">
				<div className="h-24 w-24 rounded-lg shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)]">
					<Image
						src={
							pack.coverImagePath
								? `http://localhost:8888/api/GetImageFromDisk?file=${pack.coverImagePath}`
								: '/logo.png'
						}
						alt={`${pack.title} Cover`}
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
				<h1 className="font-bold">{pack.title}</h1>
				<div className="absolute bottom-0 grid w-full cursor-default grid-flow-col grid-cols-2 opacity-75">
					<div className="group relative">
						<BsFire className="mx-auto h-6 w-6" aria-hidden="true" />
						<p>{pack.difficulty}</p>
						<div className="absolute -bottom-6 w-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:delay-300">
							<p className="mx-auto w-fit rounded-lg bg-[#070707] px-2">
								<Translator translation="info.difficulty" />
							</p>
						</div>
					</div>
					<div className="group relative">
						<BsHash className="mx-auto h-6 w-6" aria-hidden="true" />
						<p>{pack.songs.length}</p>
						<div className="absolute -bottom-6 w-full opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:delay-300">
							<p className="mx-auto w-fit rounded-lg bg-[#070707] px-2">
								<Translator translation="info.songs" />
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

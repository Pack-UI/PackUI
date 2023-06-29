import Image from "next/image";
import {BsFire, BsHash} from "react-icons/bs";
import Pack from "@classes/pack";

interface Props {
	pack: Pack;
}

export default function PackCard(props: Props) {
	const pack = props.pack;

	pack.title = pack.title.replace(/<\/?[^>]+(>|$)/g, "");
	
	return <div className="w-full h-32 align-middle flex bg-white bg-opacity-5 p-2 rounded-2xl hover:bg-opacity-20">
		<div className="h-full w-32 float-left pt-2">
			<div className="shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] rounded-lg h-24 w-24">
				<Image
					src={
						pack.coverImagePath
							? `http://localhost:8888/api/GetImageFromDisk?file=${pack.coverImagePath}`
							: '/logo.png'
					}
					alt={`${pack.title} Cover`}
					width="96"
					height="96"
					className="object-cover h-24 w-24 rounded-lg"
					onError={e => {
						e.currentTarget.src = 'https://cdn.packui.net/images/logo.png';
					}}
				/>
			</div>
		</div>

		<div className="w-full float-right relative">
			<h1 className="font-bold">{pack.title}</h1>
			<div className="absolute bottom-0 w-full grid grid-cols-2 grid-flow-col opacity-75 cursor-default">
				<div className="group relative">
					<BsFire className="h-6 w-6 mx-auto" aria-hidden="true"/>
					<p>{pack.difficulty}</p>
					<div
						className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
						<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">
							Difficulty
						</p>
					</div>
				</div>
				<div className="group relative">
					<BsHash className="h-6 w-6 mx-auto" aria-hidden="true"/>
					<p>{pack.songs.length}</p>
					<div
						className="absolute opacity-0 group-hover:opacity-100 -bottom-6 w-full transition-all duration-300 ease-in-out group-hover:delay-300">
						<p className="bg-[#070707] rounded-lg mx-auto w-fit px-2">
							Songs
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>;
}

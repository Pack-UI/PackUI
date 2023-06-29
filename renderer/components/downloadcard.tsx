import Image from "next/image";
import {BsDownload, BsFire, BsHash} from "react-icons/bs";
import Pack from "@classes/pack";

interface Props {
	pack: Pack;
	index: number;
}

export default function DownloadCard(props: Props) {
	const pack = props.pack;
	const date = new Date(Number(pack.creationDate) * 1000);

	return <a href={`/download/info?id=${props.index}`}>
		<div className="w-full h-64 align-middle flex bg-white bg-opacity-5 p-2 rounded-2xl hover:bg-opacity-20 mb-2">
			<div className="h-full w-52 float-left pt-2">
				<div className="shadow-[6px_6px_0px_0px_rgba(100,100,100,0.15)] rounded-lg h-52 w-52">
					<Image
						src={
							pack.coverImagePath
								? `http://localhost:8888/api/GetImageFromDisk?file=${pack.coverImagePath}`
								: '/logo.png'
						}
						alt={`${pack.title} Cover`}
						width="208"
						height="208"
						className="object-cover h-52 w-52 rounded-lg"
						onError={e => {
							e.currentTarget.src = 'https://cdn.packui.net/images/logo.png';
						}}
					/>
				</div>
			</div>

			<div className="w-full float-right relative">
				<div className="flex items-center mt-3">
					<h1 className="font-bold text-lg h-8 pl-16">{pack.title}</h1>
					<p className="italic font-thin text-sm ml-2 tracking-widest">
						({date.getDate()}/{date.getMonth()}/{date.getFullYear()})
					</p>
				</div>
				<p className="pl-16 mt-1">{pack.description}</p>
				<div
					className="absolute bottom-0 w-full grid grid-cols-2 grid-flow-col opacity-75 cursor-default text-center">
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

			<div className="float-right">
				<BsDownload
					className="h-8 w-8 m-4 cursor-pointer opacity-50 hover:opacity-100 transition-all duration-100 ease-in-out"/>
			</div>
		</div>
	</a>;
}
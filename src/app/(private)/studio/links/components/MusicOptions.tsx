"use client";

import Image from "next/image";

interface MusicOptionsProps {
	onOptionSelect: (option: "spotify" | "deezer" | "apple" | "soundcloud") => void;
}

const MusicOptions = ({ onOptionSelect }: MusicOptionsProps) => {
	return (
		<div>
			<div className="grid grid-cols-3 gap-4">
				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("spotify")}
					type="button"
				>
					<div
						className="relative flex w-20 items-center justify-center overflow-hidden rounded-2xl border bg-[#1ED760]"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Image
							alt="Spotify"
							className="object-cover"
							height={40}
							src="/icons/spotify.svg"
							width={40}
						/>
					</div>
					<span className="font-medium text-sm">Spotify</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("deezer")}
					type="button"
				>
					<div
						className="relative flex w-20 items-center justify-center overflow-hidden rounded-2xl border bg-white"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Image
							alt="Deezer"
							className="object-cover"
							height={40}
							src="/icons/deezer.png"
							width={40}
						/>
					</div>
					<span className="font-medium text-sm">Deezer</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("apple")}
					type="button"
				>
					<div
						className="relative flex w-20 items-center justify-center overflow-hidden rounded-2xl border bg-[#FA243C]"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Image
							alt="Apple Music"
							className="object-cover brightness-0 invert"
							height={40}
							src="/icons/applemusic.svg"
							width={40}
						/>
					</div>
					<span className="font-medium text-sm">Apple Music</span>
				</button>

				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("soundcloud")}
					type="button"
				>
					<div
						className="relative flex w-20 items-center justify-center overflow-hidden rounded-2xl border bg-[#ff5500]"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Image
							alt="SoundCloud"
							className="object-cover brightness-0 invert"
							height={40}
							src="/icons/soundcloud.svg"
							width={40}
						/>
					</div>
					<span className="font-medium text-sm">SoundCloud</span>
				</button>
			</div>
		</div>
	);
};

export default MusicOptions;

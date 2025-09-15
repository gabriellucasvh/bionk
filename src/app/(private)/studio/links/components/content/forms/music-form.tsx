"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
	ContentFormData,
	MusicPlatform,
} from "../../../types/content.types";

interface MusicFormProps {
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
}

const MusicForm = ({ formData, setFormData }: MusicFormProps) => {
	const platforms: {
		platform: MusicPlatform;
		label: string;
		color: string;
		icon: string;
	}[] = [
		{
			platform: "spotify",
			label: "Spotify",
			color: "bg-green-500",
			icon: "/icons/spotify.svg",
		},
		{
			platform: "apple-music",
			label: "Apple Music",
			color: "bg-gray-900",
			icon: "/icons/applemusic.svg",
		},
		{
			platform: "soundcloud",
			label: "SoundCloud",
			color: "bg-orange-500",
			icon: "/icons/soundcloud.svg",
		},
		{
			platform: "youtube-music",
			label: "YouTube Music",
			color: "bg-red-500",
			icon: "/icons/youtubemusic.svg",
		},
		{
			platform: "deezer",
			label: "Deezer",
			color: "bg-purple-500",
			icon: "/icons/deezer.svg",
		},
		{
			platform: "bandcamp",
			label: "Bandcamp",
			color: "bg-blue-500",
			icon: "/icons/bandcamp.svg",
		},
	];

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="grid gap-2">
					<Label htmlFor="musicTitle">Título da Música/Álbum</Label>
					<Input
						autoFocus
						id="musicTitle"
						onChange={(e) =>
							setFormData({ ...formData, musicTitle: e.target.value })
						}
						placeholder="Ex: Minha Nova Música"
						value={formData.musicTitle || ""}
					/>
				</div>

				<div className="space-y-3">
					<Label>Plataforma</Label>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{platforms.map(({ platform, label, color, icon }) => (
							<button
								className={cn(
									"rounded-lg border-2 p-3 text-center transition-all",
									formData.musicPlatform === platform
										? "border-green-500 bg-green-50 dark:bg-green-950/20"
										: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
								)}
								key={platform}
								onClick={() =>
									setFormData({ ...formData, musicPlatform: platform })
								}
								type="button"
							>
								<div
									className={cn(
										"mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full",
										color
									)}
								>
									<Image
										alt={label}
										className="h-5 w-5 brightness-0 invert filter"
										height={20}
										src={icon}
										width={20}
									/>
								</div>
								<div className="font-medium text-sm">{label}</div>
							</button>
						))}
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="musicUrl">URL da Música</Label>
					<Input
						id="musicUrl"
						onChange={(e) =>
							setFormData({ ...formData, musicUrl: e.target.value })
						}
						placeholder="https://open.spotify.com/track/..."
						type="url"
						value={formData.musicUrl || ""}
					/>
				</div>
			</div>
		</div>
	);
};

export default MusicForm;

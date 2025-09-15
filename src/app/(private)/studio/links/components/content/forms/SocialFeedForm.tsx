"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type {
	ContentFormData,
	SocialFeedPlatform,
} from "../../../types/content.types";

interface SocialFeedFormProps {
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
}

const SocialFeedForm = ({ formData, setFormData }: SocialFeedFormProps) => {
	const platforms: {
		platform: SocialFeedPlatform;
		label: string;
		icon: string;
		color: string;
	}[] = [
		{
			platform: "instagram",
			label: "Instagram",
			icon: "/icons/instagram.svg",
			color: "bg-gradient-to-r from-purple-500 to-pink-500",
		},
		{
			platform: "twitter",
			label: "Twitter/X",
			icon: "/icons/x.svg",
			color: "bg-black",
		},
		{ platform: "tiktok", label: "TikTok", icon: "/icons/tiktok.svg", color: "bg-black" },
	];

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="space-y-3">
					<Label>Plataforma</Label>
					<div className="grid grid-cols-3 gap-3">
						{platforms.map(({ platform, label, icon, color }) => (
						<button
							className={cn(
								"rounded-lg border-2 p-4 text-center transition-all",
								formData.socialPlatform === platform
									? "border-green-500 bg-green-50 dark:bg-green-950/20"
									: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
							)}
							key={platform}
							onClick={() =>
								setFormData({ ...formData, socialPlatform: platform })
							}
							type="button"
						>
							<div
								className={cn(
									"mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg",
									color
								)}
							>
								<Image
									alt={label}
									className="h-5 w-5"
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
					<Label htmlFor="socialUsername">Nome de Usuário</Label>
					<Input
						autoFocus
						id="socialUsername"
						onChange={(e) =>
							setFormData({ ...formData, socialUsername: e.target.value })
						}
						placeholder="@seuusuario"
						value={formData.socialUsername || ""}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="feedLimit">Número de Posts</Label>
					<Input
						id="feedLimit"
						max={20}
						min={1}
						onChange={(e) =>
							setFormData({ ...formData, feedLimit: Number(e.target.value) })
						}
						placeholder="6"
						type="number"
						value={formData.feedLimit || ""}
					/>
					<p className="text-muted-foreground text-xs">
						Quantos posts exibir (máximo 20)
					</p>
				</div>
			</div>

			<div className="rounded-lg border border-gray-300 border-dashed p-6 text-center dark:border-gray-600">
				<div className="text-muted-foreground text-sm">
					<p className="mb-2">
						📱 <strong>Feed de Rede Social:</strong>
					</p>
					<p>
						Exiba automaticamente seus posts mais recentes diretamente no seu
						perfil.
					</p>
				</div>
			</div>
		</div>
	);
};

export default SocialFeedForm;

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ContentFormData } from "../../../types/content.types";

interface VideoFormProps {
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
}

const VideoForm = ({ formData, setFormData }: VideoFormProps) => {
	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="grid gap-2">
					<Label htmlFor="videoTitle">Título do Vídeo</Label>
					<Input
						autoFocus
						id="videoTitle"
						onChange={(e) =>
							setFormData({ ...formData, videoTitle: e.target.value })
						}
						placeholder="Ex: Meu Último Vídeo"
						value={formData.videoTitle || ""}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="videoUrl">URL do Vídeo</Label>
					<Input
						id="videoUrl"
						onChange={(e) =>
							setFormData({ ...formData, videoUrl: e.target.value })
						}
						placeholder="https://youtube.com/watch?v=..."
						type="url"
						value={formData.videoUrl || ""}
					/>
					<p className="text-muted-foreground text-xs">
						Suporta YouTube, Vimeo, TikTok e outros
					</p>
				</div>
			</div>

			<div className="rounded-lg border border-gray-300 border-dashed p-6 text-center dark:border-gray-600">
				<div className="text-muted-foreground text-sm">
					<p className="mb-2">
						📹 <strong>Plataformas Suportadas:</strong>
					</p>
					<p>YouTube • Vimeo • TikTok • Instagram • Twitter</p>
				</div>
			</div>
		</div>
	);
};

export default VideoForm;

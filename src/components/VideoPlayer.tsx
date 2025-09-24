interface VideoPlayerProps {
	type: string;
	url: string;
	title?: string;
	className?: string;
	customButtonCorners?: string;
}

export default function VideoPlayer({
	type,
	url,
	title,
	className = "",
	customButtonCorners,
}: VideoPlayerProps) {
	const getBorderRadius = () => {
		if (customButtonCorners && customButtonCorners !== "") {
			return `${customButtonCorners}px`;
		}
		return;
	};

	const borderRadius = getBorderRadius();
	const baseClasses = `w-full aspect-video ${borderRadius ? "" : "rounded-xl"} ${className}`;
	const inlineStyle = borderRadius ? { borderRadius } : undefined;

	if (type === "direct") {
		return (
			<video
				className={baseClasses}
				controls
				preload="metadata"
				src={url}
				style={inlineStyle}
				title={title}
			>
				<track
					default
					kind="captions"
					label="Português"
					src="/captions/sample.vtt"
					srcLang="pt"
				/>
				Seu navegador não suporta o elemento de vídeo.
			</video>
		);
	}

	if (type === "youtube") {
		return (
			<iframe
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
				className={baseClasses}
				src={url}
				style={inlineStyle}
				title={title || "Vídeo do YouTube"}
			/>
		);
	}

	if (type === "vimeo") {
		return (
			<iframe
				allow="autoplay; fullscreen; picture-in-picture"
				allowFullScreen
				className={baseClasses}
				src={url}
				style={inlineStyle}
				title={title || "Vídeo do Vimeo"}
			/>
		);
	}

	if (type === "tiktok") {
		return (
			<iframe
				allow="encrypted-media"
				allowFullScreen
				className={baseClasses}
				src={url}
				style={inlineStyle}
				title={title || "Vídeo do TikTok"}
			/>
		);
	}

	if (type === "twitch") {
		return (
			<iframe
				allow="autoplay; fullscreen"
				allowFullScreen
				className={baseClasses}
				src={url}
				style={inlineStyle}
				title={title || "Vídeo do Twitch"}
			/>
		);
	}

	return (
		<div
			className={`${baseClasses} flex items-center justify-center bg-gray-100`}
			style={inlineStyle}
		>
			<p className="text-gray-500">Tipo de vídeo não suportado</p>
		</div>
	);
}

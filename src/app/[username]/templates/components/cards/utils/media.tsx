import Image from "next/image";
import { getAspectRatioStyle } from "./style";

export function CardImage({
	alt,
	src,
	ratio,
	onError,
}: {
	alt: string;
	src: string;
	ratio?: string;
	onError?: () => void;
}) {
	return (
		<div
			className="relative w-full overflow-hidden"
			style={{ ...getAspectRatioStyle(ratio) }}
		>
			{typeof src === "string" && src.toLowerCase().endsWith(".gif") ? (
				// biome-ignore lint/performance/noImgElement: <necessary to render gif>
				// biome-ignore lint/nursery/noNoninteractiveElementInteractions: <gif is interactive>
				<img
					alt={alt}
					className="h-full w-full object-cover"
					onError={onError}
					src={src}
				/>
			) : (
				<Image
					alt={alt}
					className="object-cover"
					fill
					onError={onError}
					sizes="(max-width: 640px) 100vw, 575px"
					src={src}
				/>
			)}
		</div>
	);
}

export function shouldShowImage(
	link: { customImageUrl?: string | null },
	customImageError: boolean
) {
	return !!link.customImageUrl && !customImageError;
}

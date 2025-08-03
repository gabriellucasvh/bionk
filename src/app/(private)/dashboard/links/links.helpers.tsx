import Image from "next/image";
import type { JSX } from "react";
import { ICON_MAP } from "./links.constants";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const getIconForUrl = (url: string): JSX.Element => {
	try {
		const { hostname } = new URL(url);
		const mapping = ICON_MAP.find(({ keyword }) => hostname.includes(keyword));
		if (mapping) {
			return (
				<Image
					src={mapping.src}
					alt={mapping.alt}
					className="h-3 w-3"
					width={10}
					height={10}
				/>
			);
		}
	} catch (err) {
		console.error("URL inválida:", url, err);
	}
	return (
		<Image
			src="https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/globe"
			alt="Default"
			className="h-3 w-3"
			width={10}
			height={10}
		/>
	);
};

export const isValidUrl = (url: string) =>
	/^(https?:\/\/)?([^\s.]+\.[^\s]{2,})$/.test(url);

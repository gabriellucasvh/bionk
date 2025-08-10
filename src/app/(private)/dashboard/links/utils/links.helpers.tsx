import Image from "next/image";
import type { JSX } from "react";
import { ICON_MAP } from "../data/links.constants";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const getIconForUrl = (url: string): JSX.Element => {
	const { hostname } = new URL(url);
	const mapping = ICON_MAP.find(({ keyword }) => hostname.includes(keyword));
	if (mapping) {
		return (
			<Image
				alt={mapping.alt}
				className="h-3 w-3"
				height={10}
				src={mapping.src}
				width={10}
			/>
		);
	}

	return (
		<Image
			alt="Default"
			className="h-3 w-3"
			height={10}
			src="https://res.cloudinary.com/dlfpjuk2r/image/upload/f_auto,q_auto/v1/bionk/icons/globe"
			width={10}
		/>
	);
};

const urlRegex = /^(https?:\/\/)?([^\s.]+\.[^\s]{2,})$/;

export const isValidUrl = (url: string) => urlRegex.test(url);

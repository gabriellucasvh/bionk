"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const HeaderBack = () => {
	const [isClicked, setIsClicked] = useState(false);

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (isClicked) {
			e.preventDefault();
		} else {
			setIsClicked(true);
		}
	};

	return (
		<div className="absolute top-0 left-0 z-50 flex h-20 w-full items-center justify-center">
			<Link className="block" href="/" onClick={handleClick}>
				<Image
					alt="Logo Bionk"
					className="w-16 transition-transform hover:scale-105 md:w-20"
					height={90}
					src="/images/bionk-name-logo.svg"
					width={160}
				/>
			</Link>
		</div>
	);
};

export default React.memo(HeaderBack);

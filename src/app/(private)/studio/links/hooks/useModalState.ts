"use client";

import { useEffect, useState } from "react";

export const useModalState = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<
		"content" | "video" | "image" | "music" | "event" | null
	>("content");
	const [selectedOption, setSelectedOption] = useState<
		| "link"
		| "section"
		| "text"
		| "video"
		| "youtube"
		| "vimeo"
		| "tiktok"
		| "twitch"
		| "spotify"
		| "deezer"
		| "apple"
		| "soundcloud"
		| "audiomack"
		| "image_single"
		| "image_column"
		| "image_carousel"
		| "event_tickets"
		| null
	>(null);
	const [isMobile, setIsMobile] = useState(false);

	const [linkData, setLinkData] = useState({
		url: "",
		title: "",
		badge: "",
	});

	const [sectionData, setSectionData] = useState({
		title: "",
	});

	const [textData, setTextData] = useState({
		title: "",
		description: "",
		position: "center" as "left" | "center" | "right",
		hasBackground: true,
	});

	const [videoData, setVideoData] = useState({
		title: "",
		description: "",
		url: "",
		type: "direct" as "direct" | "youtube" | "vimeo" | "tiktok" | "twitch",
		position: "center" as "left" | "center" | "right",
		hasBackground: true,
	});

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => {
			window.removeEventListener("resize", checkMobile);
		};
	}, []);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	const handleOpen = () => {
		setIsOpen(true);
		setTimeout(() => {
			setIsAnimating(true);
		}, 10);
	};

	const handleClose = () => {
		setIsAnimating(false);
		setTimeout(() => {
			setIsOpen(false);
			setSelectedCategory("content");
			setSelectedOption(null);
		}, 300);
	};

	const handleCancel = () => {
		setSelectedCategory(null);
		setSelectedOption(null);
	};

	const handleCategorySelect = (
		category: "content" | "video" | "image" | "music" | "event"
	) => {
		setSelectedCategory(category);
		setSelectedOption(null);
	};

	const handleOptionSelect = (
		option:
			| "link"
			| "section"
			| "text"
			| "video"
			| "youtube"
			| "vimeo"
			| "tiktok"
			| "twitch"
			| "spotify"
			| "deezer"
			| "apple"
			| "soundcloud"
			| "audiomack"
	) => {
		setSelectedOption(option);
	};

	return {
		isOpen,
		isAnimating,
		selectedCategory,
		selectedOption,
		isMobile,
		linkData,
		sectionData,
		textData,
		videoData,
		setLinkData,
		setSectionData,
		setTextData,
		setVideoData,
		setIsAnimating,
		setSelectedOption,
		handleOpen,
		handleClose,
		handleCancel,
		handleCategorySelect,
		handleOptionSelect,
	};
};

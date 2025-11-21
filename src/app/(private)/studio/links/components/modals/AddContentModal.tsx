"use client";

import { Plus, ChevronLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import CategorySelector from "@/app/(private)/studio/links/components/shared/CategorySelector";
import ContentOptions from "@/app/(private)/studio/links/components/shared/ContentOptions";
import EventOptions from "@/app/(private)/studio/links/components/shared/EventOptions";
import ImageOptions from "@/app/(private)/studio/links/components/shared/ImageOptions";
import MobileBottomSheet from "@/app/(private)/studio/links/components/shared/MobileBottomSheet";
import MusicOptions from "@/app/(private)/studio/links/components/shared/MusicOptions";
import VideoOptions from "@/app/(private)/studio/links/components/shared/VideoOptions";
import { BaseButton } from "@/components/buttons/BaseButton";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDragGesture } from "../../hooks/useDragGesture";
import type {
	ImageFormData,
	LinkFormData,
	MusicFormData,
	SectionFormData,
	TextFormData,
	VideoFormData,
} from "../../hooks/useLinksManager";
import { useModalState } from "../../hooks/useModalState";
import type { SectionItem } from "../../types/links.types";

interface AddContentModalProps {
	isOpen: boolean;
	onClose: () => void;
	onOpen: () => void;
	isAdding: boolean;
	isAddingSection: boolean;
	isAddingText: boolean;
	isAddingVideo: boolean;
	isAddingImage: boolean;
	isAddingMusic: boolean;
	formData: LinkFormData;
	sectionFormData: SectionFormData;
	textFormData: TextFormData;
	videoFormData: VideoFormData;
	imageFormData: ImageFormData;
	musicFormData: MusicFormData;
	existingSections: SectionItem[];
	setIsAdding: (value: boolean) => void;
	setIsAddingSection: (value: boolean) => void;
	setIsAddingText: (value: boolean) => void;
	setIsAddingVideo: (value: boolean) => void;
	setIsAddingImage: (value: boolean) => void;
	setIsAddingMusic: (value: boolean) => void;
    setIsAddingEvent: (value: boolean) => void;
    setIsAddingEventCountdown: (value: boolean) => void;
	setFormData: (data: LinkFormData) => void;
	setSectionFormData: (data: SectionFormData) => void;
	setTextFormData: (data: TextFormData) => void;
	setVideoFormData: (data: VideoFormData) => void;
	setImageFormData: (data: ImageFormData) => void;
	setMusicFormData: (data: MusicFormData) => void;
	handleAddNewLink: () => Promise<void>;
	handleAddNewSection: () => Promise<void>;
	handleAddNewText: () => Promise<void>;
	handleAddNewVideo: () => Promise<void>;
	handleAddNewImage: (override?: Partial<ImageFormData>) => Promise<void>;
	handleAddNewMusic: () => Promise<void>;
}

const AddContentModal = ({
	isOpen,
	onClose,
	onOpen,
	videoFormData,
	setIsAddingSection,
	setIsAddingImage,
    setIsAddingEvent,
    setIsAddingEventCountdown,
	setVideoFormData,
	handleAddNewLink,
	handleAddNewText,
	handleAddNewVideo,
	handleAddNewImage,
	handleAddNewMusic,
}: AddContentModalProps) => {
	const {
		isAnimating,
		selectedCategory,
		isMobile,
		handleCategorySelect,
		setIsAnimating,
		setSelectedOption,
	} = useModalState();

	useEffect(() => {
		if (!isOpen) {
			setSelectedOption(null);
		}
	}, [isOpen, setSelectedOption]);

	const {
		isDragging,
		dragY,
		isClosing,
		handleMouseDown,
		handleTouchStart,
		handleMouseMove,
		handleTouchMove,
		handleMouseUp,
		handleTouchEnd,
	} = useDragGesture(onClose);

	useEffect(() => {
		if (isOpen && isMobile) {
			handleCategorySelect("content");
			setIsAnimating(true);
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.addEventListener("touchmove", handleTouchMove);
			document.addEventListener("touchend", handleTouchEnd);
		} else if (!isOpen) {
			setIsAnimating(false);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("touchend", handleTouchEnd);
		};
	}, [
		isOpen,
		isMobile,
		handleMouseMove,
		handleMouseUp,
		handleTouchMove,
		handleTouchEnd,
		setIsAnimating,
	]);

	const handleOptionSelectWithState = (option: string) => {
    const validOptions = [
			"link",
			"section",
			"text",
			"video",
			"youtube",
			"vimeo",
			"tiktok",
			"twitch",
			"spotify",
			"deezer",
			"apple",
			"soundcloud",
			"audiomack",
        "event_tickets",
        "event_countdown",
        ] as const;

		if (!validOptions.includes(option as any)) {
			return;
		}

		const validOption = option as (typeof validOptions)[number];

        if (validOption !== "event_tickets") {
            setIsAddingEvent(false);
        }
        if (validOption !== "event_countdown") {
            setIsAddingEventCountdown(false);
        }
		if (validOption === "section") {
			onClose();
			setTimeout(() => {
				setIsAddingSection(true);
			}, 0);
			return;
		}

		// Para demais opções, fechar o modal antes de criar o rascunho inline
		// e garantir que o formulário de seção seja fechado
		setIsAddingSection(false);

		if (validOption === "link") {
			onClose();
			setTimeout(() => {
				handleAddNewLink();
			}, 0);
			return;
		}

		if (validOption === "text") {
			onClose();
			setTimeout(() => {
				handleAddNewText();
			}, 0);
			return;
		}

		if (
			["video", "youtube", "vimeo", "tiktok", "twitch"].includes(validOption)
		) {
			const videoType: "direct" | "youtube" | "vimeo" | "tiktok" | "twitch" =
				validOption === "video"
					? "direct"
					: (validOption as "youtube" | "vimeo" | "tiktok" | "twitch");
			setVideoFormData({
				...videoFormData,
				type: videoType,
			});
			onClose();
			setTimeout(() => {
				handleAddNewVideo();
			}, 0);
			return;
		}

		if (
			validOption === "spotify" ||
			validOption === "deezer" ||
			validOption === "apple" ||
			validOption === "soundcloud" ||
			validOption === "audiomack"
		) {
			onClose();
			setTimeout(() => {
				handleAddNewMusic();
			}, 0);
			return;
		}
        if (validOption === "event_tickets") {
            onClose();
            setTimeout(() => {
                setIsAddingEvent(true);
            }, 0);
            return;
        }
        if (validOption === "event_countdown") {
            onClose();
            setTimeout(() => {
                setIsAddingEventCountdown(true);
            }, 0);
            return;
        }
	};

	const handleImageOptionSelect = (
		option: "image_single" | "image_column" | "image_carousel"
	) => {
		// Criar rascunho e abrir edição fora do modal
		// Garantir que formulários fora do contexto atual estejam fechados
		setIsAddingSection(false);
		setIsAddingEvent(false);
		const layoutMap = {
			image_single: "single",
			image_column: "column",
			image_carousel: "carousel",
		} as const;
		const layout = layoutMap[option];
		// Não depender do setState assíncrono: passar o layout diretamente
		setSelectedOption(null);
		Promise.resolve(
			handleAddNewImage({ layout, images: [], title: "" })
		).finally(() => {
			setIsAddingImage(false);
			onClose();
		});
	};

	if (isMobile) {
		return (
			<>
				<BaseButton className="w-full" onClick={onOpen}>
					<Plus className="mr-2 h-4 w-4" />
					Adicionar Conteúdo
				</BaseButton>

                <MobileBottomSheet
                    dragY={dragY}
                    isAnimating={isAnimating}
                    isClosing={isClosing}
                    isDragging={isDragging}
                    isOpen={isOpen}
                    onClose={onClose}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    {selectedCategory && selectedCategory !== "content" ? (
                        <div className="flex flex-col space-y-4">
                            <div className="relative flex items-center justify-center mt-2">
                                <button
                                    className="absolute left-0 flex items-center gap-2 rounded-3xl px-3 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    onClick={() => handleCategorySelect("content")}
                                    type="button"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                    <span className="font-medium">Voltar</span>
                                </button>
                                <span className="font-semibold text-lg">
                                    {selectedCategory === "video"
                                        ? "Vídeo"
                                        : selectedCategory === "music"
                                        ? "Música"
                                        : selectedCategory === "image"
                                        ? "Imagem"
                                        : "Eventos"}
                                </span>
                            </div>
                            {selectedCategory === "video" && (
                                <VideoOptions onOptionSelect={handleOptionSelectWithState} />
                            )}
                            {selectedCategory === "music" && (
                                <MusicOptions onOptionSelect={handleOptionSelectWithState} />
                            )}
                            {selectedCategory === "image" && (
                                <ImageOptions onOptionSelect={handleImageOptionSelect} />
                            )}
                            {selectedCategory === "event" && (
                                <EventOptions
                                    onOptionSelect={handleOptionSelectWithState as any}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-4">
                            <h2 className="text-center font-semibold text-xl">Adicionar Conteúdo</h2>
                            <ContentOptions onOptionSelect={handleOptionSelectWithState} />
                            <CategorySelector
                                onCategorySelect={handleCategorySelect}
                                selectedCategory={selectedCategory}
                            />
                            <div className="space-y-2">
                                <div className="px-2 text-sm font-medium text-muted-foreground">Sugestões</div>
                                <div className="flex w-full max-w-full flex-col gap-2 divide-y divide-zinc-200 dark:divide-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => handleOptionSelectWithState("spotify")}
                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#1ED760]">
                                                <Image alt="Spotify" src="/icons/spotify.svg" fill className="object-contain p-2" />
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                <span className="font-medium text-left">Spotify</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Adicione uma faixa ou álbum do Spotify.</span>
                                            </div>
                                        </div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleOptionSelectWithState("youtube")}
                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-red-500">
                                                <Image alt="YouTube" src="/icons/youtube.svg" fill className="object-contain p-2 invert" />
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                <span className="font-medium text-left">YouTube</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Mostre vídeos do YouTube direto no seu Link.</span>
                                            </div>
                                        </div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleImageOptionSelect("image_single")}
                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-teal-400">
                                                <ImageIcon className="h-6 w-6 text-black" />
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                <span className="font-medium text-left">Imagem única</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Uma única imagem destacada.</span>
                                            </div>
                                        </div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleOptionSelectWithState("tiktok")}
                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-black">
                                                <Image alt="TikTok" src="/icons/tiktok.svg" fill className="object-contain p-2 invert" />
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                <span className="font-medium text-left">TikTok</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Destaque um TikTok ou incorpore vídeos do TikTok.</span>
                                            </div>
                                        </div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleOptionSelectWithState("apple")}
                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#FA243C]">
                                                <Image alt="Apple Music" src="/icons/applemusic.svg" fill className="object-contain p-2 invert" />
                                            </div>
                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                <span className="font-medium text-left">Apple Music</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Exiba conteúdo do Apple Music.</span>
                                            </div>
                                        </div>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                    </button>
                                </div>
                                <div className="py-5 text-center text-xs">
                                    Tem alguma sugestão? <Link href="/contato" className="underline">Sugira para nós</Link>
                                </div>
                            </div>
                        </div>
                    )}
                </MobileBottomSheet>
			</>
		);
	}

	return (
		<>
			<BaseButton className="w-full" onClick={onOpen}>
				<Plus className="mr-2 h-4 w-4" />
				Adicionar Conteúdo
			</BaseButton>

            <Dialog onOpenChange={onClose} open={isOpen}>
                <DialogContent className="h-[80vh] max-h-[600px] min-w-3xl max-w-3xl p-1 dark:bg-zinc-900 overflow-hidden">
					<div className="flex h-full flex-col">
						<DialogHeader className="border-b px-6 py-4">
							<DialogTitle>Adicionar Conteúdo</DialogTitle>
						</DialogHeader>

                    <div className="flex-1 overflow-y-hidden overflow-x-hidden min-h-0">
                            <div className="flex h-full min-h-0">
                                <div className="w-48 border-r p-2">
									<CategorySelector
										onCategorySelect={handleCategorySelect}
										selectedCategory={selectedCategory}
									/>
								</div>

                                <div className="flex-1 p-4 overflow-x-hidden overflow-y-auto min-h-0">
                                    {selectedCategory === "content" && (
                                        <>
                                            <ContentOptions
                                                onOptionSelect={handleOptionSelectWithState}
                                            />
                                            <div className="mt-6 space-y-2">
                                                <div className="px-2 text-sm font-medium text-muted-foreground">Sugestões</div>
                                                <div className="relative">
                                                <div className="max-h-[340px] overflow-y-auto pr-2">
                                                <div className="flex w-full max-w-full flex-col gap-2 divide-y divide-zinc-200 dark:divide-zinc-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOptionSelectWithState("spotify")}
                                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#1ED760]">
                                                                <Image alt="Spotify" src="/icons/spotify.svg" fill className="object-contain p-2" />
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                                <span className="font-medium text-left">Spotify</span>
                                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Adicione uma faixa ou álbum do Spotify.</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOptionSelectWithState("youtube")}
                                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-red-500">
                                                                <Image alt="YouTube" src="/icons/youtube.svg" fill className="object-contain p-2 invert" />
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                                <span className="font-medium text-left">YouTube</span>
                                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Mostre vídeos do YouTube direto no seu Link.</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleImageOptionSelect("image_single")}
                                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-teal-400">
                                                                <ImageIcon className="h-6 w-6 text-black" />
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                                <span className="font-medium text-left">Imagem única</span>
                                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Uma única imagem destacada.</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOptionSelectWithState("tiktok")}
                                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-black">
                                                                <Image alt="TikTok" src="/icons/tiktok.svg" fill className="object-contain p-2 invert" />
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                                <span className="font-medium text-left">TikTok</span>
                                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Destaque um TikTok ou incorpore vídeos do TikTok.</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOptionSelectWithState("apple")}
                                                        className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 overflow-hidden"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#FA243C]">
                                                                <Image alt="Apple Music" src="/icons/applemusic.svg" fill className="object-contain p-2 invert" />
                                                            </div>
                                                            <div className="flex min-w-0 flex-1 flex-col max-w-md">
                                                                <span className="font-medium text-left">Apple Music</span>
                                                                <span className="text-sm text-gray-500 dark:text-gray-300 truncate break-words max-w-md font-normal text-left">Exiba conteúdo do Apple Music.</span>
                                                            </div>
                                                        </div>
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background  dark:from-transparent dark:via-zinc-900 dark:to-zinc-900">
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black dark:text-white"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </button>
                                                </div>
                                                <div className="pt-1 text-center text-xs">
                                                    Tem alguma sugestão? <Link href="/contato" className="underline">Sugira para nós</Link>
                                                </div>
                                                </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
									{selectedCategory === "video" && (
										<VideoOptions
											onOptionSelect={handleOptionSelectWithState}
										/>
									)}
									{selectedCategory === "music" && (
										<MusicOptions
											onOptionSelect={handleOptionSelectWithState}
										/>
									)}
									{selectedCategory === "image" && (
										<ImageOptions onOptionSelect={handleImageOptionSelect} />
									)}
									{selectedCategory === "event" && (
										<EventOptions
											onOptionSelect={handleOptionSelectWithState as any}
										/>
									)}
									{!selectedCategory && (
										<div className="flex items-start justify-center pt-8 text-muted-foreground">
											Selecione uma categoria para ver as opções
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AddContentModal;

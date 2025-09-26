"use client";

import { Plus, Type } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { BaseButton } from "@/components/buttons/BaseButton";
import FontSelectionModal from "@/components/modals/FontSelectionModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";
import type { SocialLinkItem } from "@/types/social";
import { RenderLabel } from "./design.RenderLabel";

interface UserData {
	name: string;
	username: string;
	bio?: string;
	image?: string;
	socialLinks: SocialLinkItem[];
}

// Função auxiliar para renderizar social links
const renderSocialLinks = (
	activeSocialLinks: SocialLinkItem[],
	maxLinks: number,
	iconSize: string,
	additionalClasses = "",
	showBorder = false
) => {
	if (activeSocialLinks.length === 0) {
		return null;
	}

	return (
		<div className={`flex gap-1.5 ${additionalClasses}`}>
			{activeSocialLinks.slice(0, maxLinks).map((link) => {
				const platform = SOCIAL_PLATFORMS.find((p) => p.key === link.platform);
				if (!platform) {
					return null;
				}
				return (
					<div
						className={`${iconSize} rounded-full shadow-sm ${
							showBorder ? "border border-white/20" : ""
						}`}
						key={link.id}
						style={{ backgroundColor: platform.color }}
						title={platform.name}
					/>
				);
			})}
			{activeSocialLinks.length > maxLinks && (
				<div className="flex items-center text-gray-500 text-xs">
					+{activeSocialLinks.length - maxLinks}
				</div>
			)}
		</div>
	);
};

// Função para renderizar estilo default
const renderDefaultStyle = (userProfileData: UserData) => {
	const { name, username, bio, image, socialLinks } = userProfileData;
	const activeSocialLinks = socialLinks.filter((link) => link.active);

	return (
		<div className="h-full w-full overflow-hidden rounded-t-xl bg-gray-50 dark:bg-gray-900">
			<div className="flex h-full flex-col items-center justify-center p-4 text-center">
				<div className="relative mx-auto mb-3 h-16 w-16">
					{image ? (
						// biome-ignore lint/performance/noImgElement: <necessário para GIFS>
						<img
							alt={name || username}
							className="h-full w-full rounded-full border-2 border-white object-cover shadow-sm"
							src={image}
						/>
					) : (
						<div className="h-full w-full rounded-full border-2 border-white bg-gray-300 shadow-sm dark:bg-gray-600" />
					)}
				</div>
				<div className="mb-1 font-semibold text-gray-900 text-sm dark:text-gray-100">
					{name || username || "Nome do usuário"}
				</div>
				{bio && (
					<div className="mb-3 line-clamp-2 text-gray-600 text-xs dark:text-gray-400">
						{bio}
					</div>
				)}
				{renderSocialLinks(
					activeSocialLinks,
					3,
					"h-4 w-4",
					"justify-center gap-2"
				)}
			</div>
		</div>
	);
};

// Função para renderizar estilo horizontal
const renderHorizontalStyle = (userProfileData: UserData) => {
	const { name, username, bio, image, socialLinks } = userProfileData;
	const activeSocialLinks = socialLinks.filter((link) => link.active);

	return (
		<div className="h-full w-full overflow-hidden rounded-t-xl bg-gray-50 dark:bg-gray-900">
			<div className="flex h-full items-center gap-4 p-4">
				<div className="relative h-14 w-14 flex-shrink-0">
					{image ? (
						// biome-ignore lint/performance/noImgElement: <necessário para GIFS>
						<img
							alt={name || username}
							className="h-full w-full rounded-lg border-2 border-white object-cover shadow-sm"
							src={image}
						/>
					) : (
						<div className="h-full w-full rounded-lg border-2 border-white bg-gray-300 shadow-sm dark:bg-gray-600" />
					)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="mb-1 truncate font-semibold text-gray-900 text-sm dark:text-gray-100">
						{name || username || "Nome do usuário"}
					</div>
					{bio && (
						<div className="mb-2 line-clamp-2 text-gray-600 text-xs dark:text-gray-400">
							{bio}
						</div>
					)}
					{renderSocialLinks(activeSocialLinks, 4, "h-3 w-3")}
				</div>
			</div>
		</div>
	);
};

// Função para renderizar estilo hero
const renderHeroStyle = (userProfileData: UserData) => {
	const { name, username, bio, image, socialLinks } = userProfileData;
	const activeSocialLinks = socialLinks.filter((link) => link.active);

	return (
		<div
			className="relative h-full w-full overflow-hidden rounded-t-xl"
			style={{
				backgroundImage: image
					? `url(${image})`
					: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
			<div className="relative z-10 flex h-full flex-col justify-end p-4 text-white">
				<div className="mb-1 font-semibold text-sm drop-shadow-sm">
					{name || username || "Nome do usuário"}
				</div>
				{bio && (
					<div className="mb-3 line-clamp-2 text-xs opacity-90 drop-shadow-sm">
						{bio}
					</div>
				)}
				{renderSocialLinks(activeSocialLinks, 4, "h-3 w-3", "", true)}
			</div>
		</div>
	);
};

// Componente para preview do header com dados reais
const HeaderStylePreview = ({
	style,
	userProfileData,
}: {
	style: string;
	userProfileData?: UserData;
}) => {
	if (!userProfileData) {
		return (
			<div className="flex h-full w-full items-center justify-center rounded-t-xl bg-gray-50 dark:bg-gray-900">
				<div className="text-center text-gray-500 text-xs">
					Carregando dados...
				</div>
			</div>
		);
	}

	if (style === "default") {
		return renderDefaultStyle(userProfileData);
	}

	if (style === "horizontal") {
		return renderHorizontalStyle(userProfileData);
	}

	if (style === "hero") {
		return renderHeroStyle(userProfileData);
	}

	return null;
};

// Interface atualizada
interface DesignPanelProps {
	userCustomizations: {
		customBackgroundColor: string;
		customBackgroundGradient: string;
		customTextColor: string;
		customFont: string;
		customButtonColor: string;
		customButtonTextColor: string;
		customButtonStyle: string;
		customButtonFill: string;
		customButtonCorners: string;
		headerStyle: string;
	};
	userData?: UserData;
	onSave: (
		partialCustomizations: Partial<{
			customBackgroundColor: string;
			customBackgroundGradient: string;
			customTextColor: string;
			customFont: string;
			customButtonColor: string;
			customButtonTextColor: string;
			customButtonStyle: string;
			customButtonFill: string;
			customButtonCorners: string;
			headerStyle: string;
		}>
	) => void;
}

const SOLID_COLORS = [
	"#FFFFFF",
	"#000000",
	"#3B82F6",
	"#10B981",
	"#F59E0B",
	"#EF4444",
];
const GRADIENTS = [
	// Gradientes Claros Profissionais
	"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
	"linear-gradient(135deg, #ffecd2 0%, #fcb69f 25%, #ff8a80 75%, #ff5722 100%)",
	"linear-gradient(135deg, #a8edea 0%, #fed6e3 25%, #d299c2 75%, #fef9d7 100%)",
	"linear-gradient(135deg, #d9a7c7 0%, #fffcdc 25%, #c2e9fb 50%, #a1c4fd 100%)",
	// Gradientes Escuros Sofisticados
	"linear-gradient(135deg, #0c0c0c 0%, #2c3e50 25%, #34495e 75%, #1a252f 100%)",
	"linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 100%)",
	"linear-gradient(135deg, #8360c3 0%, #2ebf91 25%, #8360c3 50%, #2ebf91 100%)",
	"linear-gradient(135deg, #0f0c29 0%, #302b63 25%, #24243e 50%, #0f0c29 100%)",
];
const FONT_OPTIONS = [
	{ value: "font-sans", label: "Satoshi", fontFamily: "var(--font-sans)" },
	{ value: "font-inter", label: "Inter", fontFamily: "var(--font-inter)" },
	{
		value: "font-montserrat",
		label: "Montserrat",
		fontFamily: "var(--font-montserrat)",
	},
	{
		value: "font-poppins",
		label: "Poppins",
		fontFamily: "var(--font-poppins)",
	},
	{ value: "font-nunito", label: "Nunito", fontFamily: "var(--font-nunito)" },
	{
		value: "font-playfair-display",
		label: "Playfair Display",
		fontFamily: "var(--font-playfair-display)",
	},
	{
		value: "font-merriweather",
		label: "Merriweather",
		fontFamily: "var(--font-merriweather)",
	},
	{
		value: "font-dancing-script",
		label: "Dancing Script",
		fontFamily: "var(--font-dancing-script)",
	},
	{
		value: "font-dm-serif-display",
		label: "DM Serif Display",
		fontFamily: "var(--font-dm-serif-display)",
	},
	{
		value: "font-orbitron",
		label: "Orbitron",
		fontFamily: "var(--font-orbitron)",
	},
	{
		value: "font-plus-jakarta-sans",
		label: "Plus Jakarta Sans",
		fontFamily: "var(--font-plus-jakarta-sans)",
	},
	{ value: "font-outfit", label: "Outfit", fontFamily: "var(--font-outfit)" },
	{
		value: "font-space-grotesk",
		label: "Space Grotesk",
		fontFamily: "var(--font-space-grotesk)",
	},
	{
		value: "font-libre-baskerville",
		label: "Libre Baskerville",
		fontFamily: "var(--font-libre-baskerville)",
	},
	{
		value: "font-alegreya",
		label: "Alegreya",
		fontFamily: "var(--font-alegreya)",
	},
	{
		value: "font-spectral",
		label: "Spectral",
		fontFamily: "var(--font-spectral)",
	},
	{
		value: "font-urbanist",
		label: "Urbanist",
		fontFamily: "var(--font-urbanist)",
	},
	{ value: "font-karla", label: "Karla", fontFamily: "var(--font-karla)" },
	{
		value: "font-public-sans",
		label: "Public Sans",
		fontFamily: "var(--font-public-sans)",
	},
	{
		value: "font-atkinson-hyperlegible",
		label: "Atkinson Hyperlegible",
		fontFamily: "var(--font-atkinson-hyperlegible)",
	},
	{
		value: "font-fira-sans",
		label: "Fira Sans",
		fontFamily: "var(--font-fira-sans)",
	},
	{ value: "font-mulish", label: "Mulish", fontFamily: "var(--font-mulish)" },
];
const BUTTON_STYLES = [
	{
		value: "solid",
		label: "Sólido",
		preview: "bg-gray-500 text-white border-none",
	},
	{
		value: "outline",
		label: "Contorno",
		preview:
			"bg-transparent text-gray-700 dark:text-white border-gray-500 border-2",
	},
	{
		value: "soft",
		label: "Suave",
		preview: "bg-gray-100 text-gray-700 border-gray-200",
	},
	{
		value: "shadow",
		label: "Sombra",
		preview:
			"bg-gray-100 text-gray-700 border-gray-300 shadow-lg dark:shadow-white/20",
	},
	{
		value: "neon",
		label: "Neon",
		preview:
			"bg-transparent text-gray-700 dark:text-white border-gray-500 border-2 shadow-[0_0_8px_rgba(0,0,0,0.3)]",
	},
	{
		value: "dashed",
		label: "Tracejado",
		preview:
			"bg-transparent text-gray-700 dark:text-white border-gray-500 border-2 border-dashed",
	},
	{
		value: "double",
		label: "Dupla",
		preview:
			"bg-transparent text-gray-700 dark:text-white border-gray-600 border-4 border-double",
	},
	{
		value: "raised",
		label: "Elevado",
		preview:
			"bg-gray-200 text-gray-700 border-gray-400 border-t-2 border-l-2 border-r border-b shadow-inner",
	},
	{
		value: "inset",
		label: "Interno",
		preview:
			"bg-gray-200 text-gray-700 border-gray-400 border-b-2 border-r-2 border-t border-l shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]",
	},
];

const HEADER_STYLES = [
	{
		value: "default",
		label: "Padrão",
	},
	{
		value: "horizontal",
		label: "Horizontal",
	},
	{
		value: "hero",
		label: "Hero",
	},
];

const FIELD_TO_PICKER: Record<
	string,
	"background" | "text" | "button" | "buttonText"
> = {
	customBackgroundColor: "background",
	customTextColor: "text",
	customButtonColor: "button",
	customButtonTextColor: "buttonText",
};

// Funções auxiliares para reduzir complexidade
const updateCustomizations = (
	field: string,
	value: string,
	setCustomizations: React.Dispatch<React.SetStateAction<any>>
) => {
	const newCustomizations: any = { [field]: value };

	if (field === "customBackgroundColor" && value) {
		newCustomizations.customBackgroundGradient = "";
	}

	if (field === "customBackgroundGradient" && value) {
		newCustomizations.customBackgroundColor = "";
	}

	setCustomizations((prev: any) => ({
		...prev,
		...newCustomizations,
	}));

	return newCustomizations;
};

const updatePendingChanges = (
	field: string,
	value: string,
	userCustomizations: any,
	setPendingChanges: React.Dispatch<React.SetStateAction<any>>
) => {
	const newPendingChanges: any = { [field]: value };

	if (field === "customBackgroundColor" && value) {
		newPendingChanges.customBackgroundGradient = "";
	}

	if (field === "customBackgroundGradient" && value) {
		newPendingChanges.customBackgroundColor = "";
	}

	setPendingChanges((prev: any) => {
		const updated = { ...prev, ...newPendingChanges };

		for (const key of Object.keys(newPendingChanges)) {
			if (updated[key] === userCustomizations[key]) {
				delete updated[key];
			}
		}

		return updated;
	});
};

const checkPendingChange = (
	field: string,
	pendingChanges: any,
	customizations: any,
	userCustomizations: any
) => {
	const isPending = pendingChanges[field] !== undefined;
	const hasChanged = customizations[field] !== userCustomizations[field];

	if (
		field === "customBackgroundColor" &&
		!customizations.customBackgroundColor &&
		pendingChanges.customBackgroundGradient !== undefined
	) {
		return false;
	}

	return isPending && hasChanged;
};

const getCornerLabel = (value: number) => {
	switch (value) {
		case 0:
			return "Reto";
		case 12:
			return "Suave";
		case 24:
			return "Médio";
		case 36:
			return "Arredondado";
		default:
			return `${value}px`;
	}
};

// Hook de debounce agora usa useCallback para estabilidade
const useDebouncedCallback = (
	callback: (...args: any[]) => void,
	delay: number
) => {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Limpa o timeout quando o componente é desmontado
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return useCallback(
		(...args: any[]) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				callback(...args);
			}, delay);
		},
		[callback, delay]
	);
};

export default function DesignPanel({
	userCustomizations,
	userData,
	onSave,
}: DesignPanelProps) {
	const [customizations, setCustomizations] = useState(userCustomizations);
	const [activeColorPicker, setActiveColorPicker] = useState<
		"background" | "text" | "button" | "buttonText" | null
	>(null);
	const [isFontModalOpen, setIsFontModalOpen] = useState(false);
	const [pendingChanges, setPendingChanges] = useState<
		Partial<typeof customizations>
	>({});
	const [isSaving, setIsSaving] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setCustomizations(userCustomizations);
		setPendingChanges({});
	}, [userCustomizations]);

	const handleChange = (field: keyof typeof customizations, value: string) => {
		updateCustomizations(field, value, setCustomizations);
		updatePendingChanges(field, value, userCustomizations, setPendingChanges);
	};

	const debouncedHandleChange = useDebouncedCallback(handleChange, 300);

	const handleSavePending = async () => {
		if (!Object.keys(pendingChanges).length) {
			return;
		}
		setIsSaving(true);
		try {
			await onSave(pendingChanges);
			setPendingChanges({});
		} finally {
			setIsSaving(false);
		}
	};

	// Nova função para cancelar as alterações
	const handleCancel = () => {
		setCustomizations(userCustomizations);
		setPendingChanges({});
	};

	// Função auxiliar para verificar se um campo tem alterações pendentes
	const hasPendingChange = (field: keyof typeof customizations) => {
		return checkPendingChange(
			field,
			pendingChanges,
			customizations,
			userCustomizations
		);
	};

	// Hook para fechar o seletor de cores ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(event.target as Node)
			) {
				setActiveColorPicker(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []); // Array de dependências vazio para executar apenas uma vez

	const renderColorOption = (
		color: string,
		field:
			| "customBackgroundColor"
			| "customTextColor"
			| "customButtonFill"
			| "customButtonColor"
			| "customButtonTextColor",
		isSelected: boolean,
		isGradient = false
	) => (
		<button
			className={`h-10 w-10 rounded-full border-2 transition-all duration-300 ${
				isSelected
					? "border-2 border-lime-700"
					: "border-2 border-gray-200 hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400"
			}`}
			key={color}
			onClick={() => handleChange(field, color)}
			style={{
				background: isGradient ? color : color,
			}}
			type="button"
		/>
	);

	const renderColorSelector = (
		field:
			| "customBackgroundColor"
			| "customTextColor"
			| "customButtonColor"
			| "customButtonTextColor",
		label: string
	) => {
		const customColor = customizations[field];
		const isSolidColor = SOLID_COLORS.includes(customColor);

		return (
			<div className="mb-8">
				<RenderLabel hasPending={hasPendingChange(field)} text={label} />
				<div className="mt-2 mb-3 flex flex-wrap gap-1">
					<button
						className="flex h-10 w-10 items-center justify-center rounded-full"
						onClick={() =>
							setActiveColorPicker(
								activeColorPicker === FIELD_TO_PICKER[field]
									? null
									: FIELD_TO_PICKER[field]
							)
						}
						style={{
							background:
								"conic-gradient(from 0deg, red, orange, yellow, green, cyan, blue, violet, red)",
						}}
						type="button"
					>
						<span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
							<Plus className="h-4 w-4" />
						</span>
					</button>
					{!isSolidColor && customColor && (
						<button
							className="h-10 w-10 rounded-full border-2 border-lime-700"
							style={{ backgroundColor: customColor }}
							type="button"
						/>
					)}
					{SOLID_COLORS.map((color) =>
						renderColorOption(color, field, customColor === color)
					)}
				</div>

				{activeColorPicker === FIELD_TO_PICKER[field] && (
					<div className="mt-3 w-min" ref={pickerRef}>
						<HexColorPicker
							color={customColor}
							onChange={(color) => debouncedHandleChange(field, color)}
						/>
						<HexColorInput
							className="mt-2 w-full rounded border border-gray-300 p-2 text-center dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
							color={customColor}
							onChange={(color) => handleChange(field, color)}
							placeholder="#000000"
						/>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="mt-8 space-y-6">
			{/* Seção Header */}
			<Card>
				<CardHeader>
					<CardTitle>Header</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<RenderLabel
							hasPending={hasPendingChange("headerStyle")}
							text="Estilo do Header"
						/>
						<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
							{HEADER_STYLES.map((style) => (
								<button
									className={`group relative overflow-hidden rounded-xl ${
										customizations.headerStyle === style.value
											? "border-green-500"
											: "border"
									}`}
									key={style.value}
									onClick={() => handleChange("headerStyle", style.value)}
									type="button"
								>
									{/* Preview Area */}
									<div className="aspect-[4/3] w-full">
										<HeaderStylePreview
											style={style.value}
											userProfileData={userData}
										/>
									</div>

									{/* Info Section */}
									<div className="border-gray-100 border-t bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
										<div className="flex items-center justify-between">
											analisar
										</div>
									</div>

									{/* Selected Overlay */}
									{customizations.headerStyle === style.value && (
										<div className="pointer-events-none absolute inset-0 rounded-xl border border-green-500" />
									)}
								</button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Seção Background */}
			<Card>
				<CardHeader>
					<CardTitle>Background</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{renderColorSelector("customBackgroundColor", "Cor de Fundo")}

					<div>
						<RenderLabel
							hasPending={hasPendingChange("customBackgroundGradient")}
							text="Gradiente de Fundo"
						/>
						<div className="mt-2 flex flex-wrap gap-1">
							{GRADIENTS.map((gradient) =>
								renderColorOption(
									gradient,
									"customBackgroundGradient" as any,
									customizations.customBackgroundGradient === gradient,
									true
								)
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Seção Texto */}
			<Card>
				<CardHeader>
					<CardTitle>Texto</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{renderColorSelector("customTextColor", "Cor do Texto e Ícones")}

					<div>
						<RenderLabel text="Fonte" />
						<div className="mt-2 block sm:hidden">
							<Button
								className="h-12 w-full justify-between px-4 py-2 text-left"
								onClick={() => setIsFontModalOpen(true)}
								variant="outline"
							>
								<span className="truncate">
									{FONT_OPTIONS.find(
										(f) => f.value === customizations.customFont
									)?.label || "Satoshi"}
								</span>
								<Type className="h-4 w-4" />
							</Button>
						</div>
						<div className="mt-2 hidden grid-cols-3 gap-2 sm:grid sm:grid-cols-4 lg:grid-cols-5">
							{FONT_OPTIONS.map((font) => (
								<button
									className={`flex h-16 w-full items-center justify-center rounded border px-2 py-1 text-center text-xs leading-tight transition-colors ${
										customizations.customFont === font.value
											? "border-gray-300 bg-neutral-200 dark:border-gray-600 dark:bg-neutral-700"
											: "border-gray-200 hover:bg-neutral-200 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
									}`}
									key={font.value}
									onClick={() => handleChange("customFont", font.value)}
									style={{ fontFamily: font.fontFamily || "inherit" }}
									type="button"
								>
									<span className="break-words">{font.label}</span>
								</button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Seção Botões */}
			<Card>
				<CardHeader>
					<CardTitle>Botões</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{renderColorSelector("customButtonColor", "Cor do Botão")}
					{renderColorSelector(
						"customButtonTextColor",
						"Cor do Texto do Botão"
					)}

					<div>
						<RenderLabel
							hasPending={hasPendingChange("customButtonStyle")}
							text="Estilo do Botão"
						/>
						<div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-3">
							{BUTTON_STYLES.map((style) => (
								<button
									className={`flex h-12 w-full items-center justify-center rounded px-2 py-1 text-center text-sm transition-all duration-200 ${
										style.preview
									} ${
										customizations.customButtonStyle === style.value
											? "ring-1 ring-green-500 ring-offset-2"
											: ""
									}`}
									key={style.value}
									onClick={() => handleChange("customButtonStyle", style.value)}
									type="button"
								>
									{style.label}
								</button>
							))}
						</div>
					</div>

					<div>
						<RenderLabel
							hasPending={hasPendingChange("customButtonCorners")}
							text="Cantos do Botão"
						/>
						<div className="mt-2 flex items-center gap-4">
							<Slider
								className="w-full"
								max={36}
								min={0}
								onValueChange={(value) =>
									handleChange("customButtonCorners", value[0].toString())
								}
								step={12}
								value={[
									Number.parseInt(
										customizations.customButtonCorners || "12",
										10
									),
								]}
							/>
							<span className="w-20 text-center font-semibold text-gray-700 dark:text-gray-300">
								{getCornerLabel(
									Number.parseInt(
										customizations.customButtonCorners || "12",
										10
									)
								)}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Seção Cores */}
			<Card>
				<CardHeader>
					<CardTitle>Cores Selecionadas</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-1">
						{/* Cor de Fundo */}
						{customizations.customBackgroundColor && (
							<div className="flex items-center gap-3 rounded-lg p-2">
								<button
									className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-gray-200 transition-colors hover:border-blue-500 dark:border-gray-600"
									onClick={() =>
										setActiveColorPicker(
											activeColorPicker === "background" ? null : "background"
										)
									}
									style={{
										backgroundColor: customizations.customBackgroundColor,
									}}
									type="button"
								/>
								<div className="flex-1">
									<p className="font-medium text-sm">Cor de Fundo</p>
									<p className="text-gray-600 text-xs dark:text-gray-400">
										{customizations.customBackgroundColor}
									</p>
								</div>
								{activeColorPicker === "background" && (
									<div className="absolute z-10 mt-2" ref={pickerRef}>
										<HexColorPicker
											color={customizations.customBackgroundColor}
											onChange={(color) =>
												debouncedHandleChange("customBackgroundColor", color)
											}
										/>
										<HexColorInput
											className="mt-2 w-full rounded border border-gray-300 p-2 text-center dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
											color={customizations.customBackgroundColor}
											onChange={(color) =>
												handleChange("customBackgroundColor", color)
											}
											placeholder="#000000"
										/>
									</div>
								)}
							</div>
						)}

						{/* Gradiente de Fundo */}
						{customizations.customBackgroundGradient && (
							<div className="flex items-center gap-3 rounded-lg p-2">
								<div
									className="h-8 w-8 flex-shrink-0 rounded-full border-2 border-gray-200 dark:border-gray-600"
									style={{
										background: customizations.customBackgroundGradient,
									}}
								/>
								<div className="flex-1">
									<p className="font-medium text-sm">Gradiente de Fundo</p>
									<p className="text-gray-600 text-xs dark:text-gray-400">
										Gradiente personalizado
									</p>
								</div>
							</div>
						)}

						{/* Cor do Texto */}
						{customizations.customTextColor && (
							<div className="flex items-center gap-3 rounded-lg p-2">
								<button
									className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-gray-200 transition-colors hover:border-blue-500 dark:border-gray-600"
									onClick={() =>
										setActiveColorPicker(
											activeColorPicker === "text" ? null : "text"
										)
									}
									style={{ backgroundColor: customizations.customTextColor }}
									type="button"
								/>
								<div className="flex-1">
									<p className="font-medium text-sm">Cor do Texto e Ícones</p>
									<p className="text-gray-600 text-xs dark:text-gray-400">
										{customizations.customTextColor}
									</p>
								</div>
								{activeColorPicker === "text" && (
									<div className="absolute z-10 mt-2" ref={pickerRef}>
										<HexColorPicker
											color={customizations.customTextColor}
											onChange={(color) =>
												debouncedHandleChange("customTextColor", color)
											}
										/>
										<HexColorInput
											className="mt-2 w-full rounded border border-gray-300 p-2 text-center dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
											color={customizations.customTextColor}
											onChange={(color) =>
												handleChange("customTextColor", color)
											}
											placeholder="#000000"
										/>
									</div>
								)}
							</div>
						)}

						{/* Cor do Botão */}
						{customizations.customButtonColor && (
							<div className="flex items-center gap-3 rounded-lg p-2">
								<button
									className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-gray-200 transition-colors hover:border-blue-500 dark:border-gray-600"
									onClick={() =>
										setActiveColorPicker(
											activeColorPicker === "button" ? null : "button"
										)
									}
									style={{ backgroundColor: customizations.customButtonColor }}
									type="button"
								/>
								<div className="flex-1">
									<p className="font-medium text-sm">Cor do Botão</p>
									<p className="text-gray-600 text-xs dark:text-gray-400">
										{customizations.customButtonColor}
									</p>
								</div>
								{activeColorPicker === "button" && (
									<div className="absolute z-10 mt-2" ref={pickerRef}>
										<HexColorPicker
											color={customizations.customButtonColor}
											onChange={(color) =>
												debouncedHandleChange("customButtonColor", color)
											}
										/>
										<HexColorInput
											className="mt-2 w-full rounded border border-gray-300 p-2 text-center dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
											color={customizations.customButtonColor}
											onChange={(color) =>
												handleChange("customButtonColor", color)
											}
											placeholder="#000000"
										/>
									</div>
								)}
							</div>
						)}

						{/* Cor do Texto do Botão */}
						{customizations.customButtonTextColor && (
							<div className="flex items-center gap-3 rounded-lg p-2">
								<button
									className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-gray-200 transition-colors hover:border-blue-500 dark:border-gray-600"
									onClick={() =>
										setActiveColorPicker(
											activeColorPicker === "buttonText" ? null : "buttonText"
										)
									}
									style={{
										backgroundColor: customizations.customButtonTextColor,
									}}
									type="button"
								/>
								<div className="flex-1">
									<p className="font-medium text-sm">Cor do Texto do Botão</p>
									<p className="text-gray-600 text-xs dark:text-gray-400">
										{customizations.customButtonTextColor}
									</p>
								</div>
								{activeColorPicker === "buttonText" && (
									<div className="absolute z-10 mt-2" ref={pickerRef}>
										<HexColorPicker
											color={customizations.customButtonTextColor}
											onChange={(color) =>
												debouncedHandleChange("customButtonTextColor", color)
											}
										/>
										<HexColorInput
											className="mt-2 w-full rounded border border-gray-300 p-2 text-center dark:border-gray-600 dark:bg-neutral-700 dark:text-white"
											color={customizations.customButtonTextColor}
											onChange={(color) =>
												handleChange("customButtonTextColor", color)
											}
											placeholder="#000000"
										/>
									</div>
								)}
							</div>
						)}

						{/* Mensagem quando não há cores selecionadas */}
						{!(
							customizations.customBackgroundColor ||
							customizations.customBackgroundGradient ||
							customizations.customTextColor ||
							customizations.customButtonColor ||
							customizations.customButtonTextColor
						) && (
							<div className="py-8 text-center text-gray-500 dark:text-gray-400">
								<p className="text-sm">Nenhuma cor personalizada selecionada</p>
								<p className="mt-1 text-xs">
									Configure suas cores nas seções acima para vê-las aqui
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Salvar e Cancelar pendências */}
			{Object.keys(pendingChanges).length > 0 && (
				<div className="-translate-x-1/2 fixed bottom-16 left-1/2 z-50 mx-auto flex w-max items-center gap-2 rounded-full border bg-white/90 p-2 px-4 shadow-lg backdrop-blur-sm md:bottom-6 dark:bg-neutral-800/90">
					<span className="hidden font-medium text-gray-600 text-sm sm:inline-block dark:text-gray-400">
						Deseja salvar as alterações pendentes?
					</span>
					<BaseButton
						loading={isSaving}
						onClick={handleCancel}
						size="sm"
						variant="white"
					>
						Cancelar
					</BaseButton>
					<BaseButton
						className="px-6"
						loading={isSaving}
						onClick={handleSavePending}
						size="sm"
					>
						Salvar
					</BaseButton>
				</div>
			)}

			<FontSelectionModal
				fontOptions={FONT_OPTIONS.map((font) => ({
					label: font.label,
					value: font.value,
					fontFamily: font.fontFamily,
				}))}
				isOpen={isFontModalOpen}
				onClose={() => setIsFontModalOpen(false)}
				onFontSelect={(fontValue) => handleChange("customFont", fontValue)}
				selectedFont={customizations.customFont}
			/>
		</div>
	);
}

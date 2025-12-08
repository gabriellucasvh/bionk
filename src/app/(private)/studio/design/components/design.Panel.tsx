"use client";

import { Image as ImageIcon, Play, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { BaseButton } from "@/components/buttons/BaseButton";
import LoadingSpinner from "@/components/buttons/LoadingSpinner";
import { ProButton } from "@/components/buttons/ProButton";
import BackgroundMediaModal from "@/components/modals/BackgroundMediaModal";
import FontSelectionModal from "@/components/modals/FontSelectionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSubscription } from "@/providers/subscriptionProvider";
import { useDesignStore } from "@/stores/designStore";
import {
	FONT_OPTIONS,
	GRADIENTS,
	SOLID_COLORS,
} from "../constants/design.constants";
import { ColorPreviews } from "./ColorPreviews";
import { ColorOption, ColorSelector } from "./ColorSelectors";
import { RenderLabel } from "./design.RenderLabel";
import {
	ButtonCornersSelector,
	ButtonStyleSelector,
	FontSelector,
} from "./FontButtonSelectors";
import { HeaderStyleButtons } from "./HeaderStylePreview";

const GRADIENT_HEX_RE = /#([0-9a-fA-F]{3,8})/g;

function clamp(n: number, min: number, max: number): number {
	if (n < min) {
		return min;
	}
	if (n > max) {
		return max;
	}
	return n;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
	let h = hex.replace(/[^0-9a-fA-F]/g, "");
	if (h.length === 3) {
		const r = h[0];
		const g = h[1];
		const b = h[2];
		h = `${r}${r}${g}${g}${b}${b}`;
	}
	const r = Number.parseInt(h.slice(0, 2), 16);
	const g = Number.parseInt(h.slice(2, 4), 16);
	const b = Number.parseInt(h.slice(4, 6), 16);
	return { r, g, b };
}

function rgbToHsl(
	r: number,
	g: number,
	b: number
): { h: number; s: number; l: number } {
	const rr = r / 255;
	const gg = g / 255;
	const bb = b / 255;
	const max = Math.max(rr, gg, bb);
	const min = Math.min(rr, gg, bb);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;
	if (max === min) {
		h = 0;
		s = 0;
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case rr: {
				h = (gg - bb) / d + (gg < bb ? 6 : 0);
				break;
			}
			case gg: {
				h = (bb - rr) / d + 2;
				break;
			}
			default: {
				h = (rr - gg) / d + 4;
				break;
			}
		}
		h /= 6;
	}
	return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(
	h: number,
	s: number,
	l: number
): { r: number; g: number; b: number } {
	const hh = h / 360;
	const ss = s / 100;
	const ll = l / 100;
	if (ss === 0) {
		const v = Math.round(ll * 255);
		return { r: v, g: v, b: v };
	}
	const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
	const p = 2 * ll - q;
	function hue2rgb(t: number): number {
		let tt = t;
		if (tt < 0) {
			tt += 1;
		} else if (tt > 1) {
			tt -= 1;
		}
		if (tt < 1 / 6) {
			return p + (q - p) * 6 * tt;
		}
		if (tt < 1 / 2) {
			return q;
		}
		if (tt < 2 / 3) {
			return p + (q - p) * (2 / 3 - tt) * 6;
		}
		return p;
	}
	const r = Math.round(hue2rgb(hh + 1 / 3) * 255);
	const g = Math.round(hue2rgb(hh) * 255);
	const b = Math.round(hue2rgb(hh - 1 / 3) * 255);
	return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
	const toHex = (v: number) => v.toString(16).padStart(2, "0");
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function computeOverlayColor(baseHex: string): string {
	const { r, g, b } = hexToRgb(baseHex);
	const { h, s, l } = rgbToHsl(r, g, b);
	let overlayR = 0;
	let overlayG = 0;
	let overlayB = 0;
	if (l <= 10) {
		overlayR = 74;
		overlayG = 74;
		overlayB = 74;
	} else if (l >= 90) {
		overlayR = 229;
		overlayG = 229;
		overlayB = 229;
	} else {
		const nh = (h + 22) % 360;
		const ns = clamp(s + 20, 55, 90);
		const nl = clamp(l + 15, 40, 80);
		const rgb2 = hslToRgb(nh, ns, nl);
		overlayR = rgb2.r;
		overlayG = rgb2.g;
		overlayB = rgb2.b;
	}
	return rgbToHex(overlayR, overlayG, overlayB);
}

function buildGradient(baseHex: string): string {
	const overlay = computeOverlayColor(baseHex);
	return `linear-gradient(to top, ${overlay} 0%, ${baseHex} 100%)`;
}

function extractBaseColorFromGradient(gradient: string): string {
	const matches = gradient.match(GRADIENT_HEX_RE);
	if (matches && matches.length > 0) {
		const last = matches.at(-1) as string;
		return last;
	}
	return "#f2f2f2";
}

const convertCustomizationsToRecord = (
	customizations: any
): Record<string, string> => ({
	customBackgroundColor: customizations.customBackgroundColor,
	customBackgroundGradient: customizations.customBackgroundGradient,
	customTextColor: customizations.customTextColor,
	customFont: customizations.customFont,
	customButtonColor: customizations.customButtonColor,
	customButtonTextColor: customizations.customButtonTextColor,
	customButtonStyle: customizations.customButtonStyle,
	customButtonCorners: customizations.customButtonCorners,
});

export function DesignPanel() {
	const {
		userData,
		customizations,
		updateCustomization,
		hasUnsavedChanges,
		saveChanges,
		discardChanges,
		// UI store
		isBackgroundModalOpen,
		backgroundModalType,
		isFontModalOpen,
		setIsBackgroundModalOpen,
		setBackgroundModalType,
		setIsFontModalOpen,
	} = useDesignStore();

	const [activeColorPicker, setActiveColorPicker] = useState<string | null>(
		null
	);
	const defaultBaseColor = (() => {
		const s = customizations.customBackgroundGradient || "";
		const m = s.match(GRADIENT_HEX_RE);
		if (m && m.length > 0) {
			return m.at(-1) as string;
		}
		if (customizations.customBackgroundColor) {
			return customizations.customBackgroundColor;
		}
		return "#8b36af";
	})();
	const [gradientBaseColor, setGradientBaseColor] =
		useState<string>(defaultBaseColor);
	// Estado de UI agora vem do store para persistência
	const [isSavingPending, setIsSavingPending] = useState(false);

	const { subscriptionPlan } = useSubscription();
	const canUseBackgroundMedia =
		subscriptionPlan === "pro" || subscriptionPlan === "ultra";

	// Tipo de fundo selecionado (apenas um por vez)
	const [backgroundType, setBackgroundType] = useState<
		"color" | "gradient" | "image" | "video"
	>(
		customizations.customBackgroundGradient
			? "gradient"
			: customizations.customBackgroundColor
				? "color"
				: "color"
	);

	// Não sincronizar automaticamente o tipo ao mudar valores,
	// para evitar que alternar a aba mude o preview sem seleção.

	const handleChange = (field: string, value: string | boolean) => {
		updateCustomization(field as any, value);
	};

	const debouncedHandleChange = handleChange;

	const handleBackgroundTypeChange = (
		type: "color" | "gradient" | "image" | "video"
	) => {
		setBackgroundType(type);
		if (type === "image" || type === "video") {
			setBackgroundModalType(type);
			setIsBackgroundModalOpen(true);
			return;
		}
		if (type === "gradient") {
			const base = customizations.customBackgroundColor
				? customizations.customBackgroundColor
				: customizations.customBackgroundGradient
					? extractBaseColorFromGradient(
							customizations.customBackgroundGradient
						)
					: "";
			if (base) {
				const gradient = buildGradient(base);
				updateCustomization("customBackgroundGradient", gradient);
				updateCustomization("customBackgroundColor", "");
				updateCustomization("customBackgroundMediaType", "");
				updateCustomization("customBackgroundImageUrl", "");
				updateCustomization("customBackgroundVideoUrl", "");
				setGradientBaseColor(base);
			}
			return;
		}
		if (type === "color") {
			let color = customizations.customBackgroundColor;
			if (
				(!color || color.length === 0) &&
				customizations.customBackgroundGradient
			) {
				color = extractBaseColorFromGradient(
					customizations.customBackgroundGradient
				);
			}
			if (color) {
				updateCustomization("customBackgroundColor", color);
				updateCustomization("customBackgroundGradient", "");
				updateCustomization("customBackgroundMediaType", "");
				updateCustomization("customBackgroundImageUrl", "");
				updateCustomization("customBackgroundVideoUrl", "");
			}
		}
	};

	const applyGradientFromColor = (color: string) => {
		const gradient = buildGradient(color);
		handleChange("customBackgroundGradient", gradient);
		handleChange("customBackgroundColor", "");
		handleChange("customBackgroundMediaType", "");
		handleChange("customBackgroundImageUrl", "");
		handleChange("customBackgroundVideoUrl", "");
		setGradientBaseColor(color);
	};

	const handleSavePending = async () => {
		try {
			setIsSavingPending(true);
			await saveChanges();
			setActiveColorPicker(null);
		} catch (error) {
			console.error("Erro ao salvar:", error);
		} finally {
			setIsSavingPending(false);
		}
	};

	const handleCancel = () => {
		discardChanges();
		setActiveColorPicker(null);
	};

	const hasPendingChange = (field: string) => {
		if (!hasUnsavedChanges) {
			return false;
		}

		const originalCustomizations =
			useDesignStore.getState().originalCustomizations;
		const currentCustomizations = useDesignStore.getState().customizations;

		if (field in currentCustomizations && field in originalCustomizations) {
			return (
				currentCustomizations[field as keyof typeof currentCustomizations] !==
				originalCustomizations[field as keyof typeof originalCustomizations]
			);
		}

		return hasUnsavedChanges;
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;

			const isColorPickerClick =
				target.closest("[data-color-picker]") ||
				target.closest(".react-colorful") ||
				target.closest("[data-color-button]");

			if (!isColorPickerClick && activeColorPicker) {
				setActiveColorPicker(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [activeColorPicker]);

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
						<div className="mt-4">
							<HeaderStyleButtons
								backgroundColor={customizations.customBackgroundColor}
								backgroundImage={customizations.customBackgroundGradient}
								bio={userData?.bio || "Bio do usuário"}
								buttonColor={customizations.customButtonColor}
								buttonStyle={customizations.customButtonStyle}
								buttonTextColor={customizations.customButtonTextColor}
								fontFamily={
									FONT_OPTIONS.find(
										(f) => f.value === customizations.customFont
									)?.fontFamily
								}
								image={userData?.image}
								name={userData?.name || "Nome do usuário"}
								onStyleChange={(style) => handleChange("headerStyle", style)}
								selectedStyle={customizations.headerStyle}
								textColor={customizations.customTextColor}
								username={userData?.username || "username"}
							/>
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
					{/* Tipo de Fundo */}
					<div>
						<RenderLabel
							hasPending={
								hasPendingChange("customBackgroundColor") ||
								hasPendingChange("customBackgroundGradient")
							}
							text="Tipo de Fundo"
						/>
						<div className="mt-2 flex flex-wrap gap-4">
							{(
								[
									{ key: "color", label: "Cor sólida" },
									{ key: "gradient", label: "Gradiente" },
									{ key: "image", label: "Imagem" },
									{ key: "video", label: "Vídeo" },
								] as const
							).map((opt) => {
								const isSelected = backgroundType === opt.key;
								const previewStyle: React.CSSProperties = (() => {
									switch (opt.key) {
										case "color":
											return {
												backgroundColor: customizations.customBackgroundColor
													? customizations.customBackgroundColor
													: customizations.customBackgroundGradient
														? extractBaseColorFromGradient(
																customizations.customBackgroundGradient
															)
														: "#f2f2f2",
											};
										case "gradient":
											return customizations.customBackgroundGradient
												? {
														backgroundImage:
															customizations.customBackgroundGradient,
													}
												: customizations.customBackgroundColor
													? {
															backgroundImage: buildGradient(
																customizations.customBackgroundColor
															),
														}
													: {
															backgroundImage:
																"linear-gradient(135deg, #f2f2f2 0%, #f2f2f2 100%)",
														};
										case "image":
											return customizations.customBackgroundImageUrl
												? {
														backgroundImage: `url("${customizations.customBackgroundImageUrl}")`,
														backgroundSize: "cover",
														backgroundPosition: "top",
														backgroundRepeat: "no-repeat",
													}
												: { backgroundColor: "#f2f2f2" };
										case "video":
											return { backgroundColor: "#f2f2f2" };
										default:
											return { backgroundColor: "#f2f2f2" };
									}
								})();

								const showIcon = opt.key === "image" || opt.key === "video";
								const Icon = opt.key === "image" ? ImageIcon : Play;

								return (
									<div
										className="relative flex w-24 flex-col items-center"
										key={opt.key}
									>
										<button
											className={`relative w-full overflow-hidden rounded-xl border transition-all ${
												isSelected ? " ring-1 ring-offset-2 dark:ring-1" : ""
											} ${
												(opt.key === "image" || opt.key === "video") &&
												!canUseBackgroundMedia
													? "opacity-60"
													: ""
											}`}
											onClick={() => {
												if (
													(opt.key === "image" || opt.key === "video") &&
													!canUseBackgroundMedia
												) {
													return;
												}
												handleBackgroundTypeChange(opt.key);
											}}
											style={{ aspectRatio: "6 / 7", ...previewStyle }}
											type="button"
										>
											{opt.key === "video" &&
											customizations.customBackgroundVideoUrl ? (
												<video
													autoPlay
													className="pointer-events-none absolute inset-0 h-full w-full object-cover"
													loop
													muted
													playsInline
													src={customizations.customBackgroundVideoUrl}
												/>
											) : null}
											<div className="absolute inset-0 flex items-center justify-center">
												{showIcon ? (
													<Icon
														className={`h-6 w-6 ${
															isSelected ? "text-black" : "text-black "
														}`}
													/>
												) : null}
											</div>
										</button>
										{(opt.key === "image" || opt.key === "video") &&
										!canUseBackgroundMedia ? (
											<div className="absolute top-1 right-1 z-10">
												<ProButton
													href="/planos"
													label="Pro"
													showOverlayTooltip={false}
													size="xs"
													tooltip="Disponível nos planos Pro e Ultra"
												/>
											</div>
										) : null}
										<span
											className={`mt-2 text-center text-sm ${
												isSelected
													? "text-black dark:text-white"
													: "text-zinc-700 dark:text-zinc-300"
											}`}
										>
											{opt.label}
										</span>
									</div>
								);
							})}
						</div>
						<p className="mt-2 text-muted-foreground text-xs">
							Apenas uma opção de fundo é usada por vez. Alternar o tipo não
							altera o fundo atual; a mudança ocorre ao selecionar uma opção.
						</p>
					</div>

					{/* Cor de Fundo */}
					{backgroundType === "color" && (
						<ColorSelector
							activeColorPicker={activeColorPicker}
							customizations={convertCustomizationsToRecord(customizations)}
							debouncedHandleChange={debouncedHandleChange}
							field="customBackgroundColor"
							handleChange={handleChange}
							hasPendingChange={hasPendingChange}
							label="Cor de Fundo"
							setActiveColorPicker={setActiveColorPicker}
						/>
					)}

					{/* Gradiente de Fundo */}
					{backgroundType === "gradient" && (
						<div>
							<RenderLabel
								hasPending={hasPendingChange("customBackgroundGradient")}
								text="Gradiente de Fundo"
							/>
							<div className="mt-2 flex flex-wrap gap-1">
								{GRADIENTS.map((gradient) => (
									<button
										className={`h-10 w-10 rounded-full border-2 transition-all duration-300 ${
											customizations.customBackgroundGradient === gradient
												? "ring-2 ring-black dark:ring-white"
												: ""
										}`}
										key={gradient}
										onClick={() => {
											// Selecionar gradiente e limpar opções conflitantes
											handleChange("customBackgroundGradient", gradient);
											handleChange("customBackgroundColor", "");
											handleChange("customBackgroundMediaType", "");
											handleChange("customBackgroundImageUrl", "");
											handleChange("customBackgroundVideoUrl", "");
										}}
										style={{ background: gradient }}
										type="button"
									/>
								))}
							</div>
							<div className="mt-4">
								<div className="mt-2 mb-3 flex flex-wrap gap-1">
									<button
										className="flex h-10 w-10 items-center justify-center rounded-full"
										data-color-button
										onClick={() =>
											setActiveColorPicker(
												activeColorPicker === "gradient" ? null : "gradient"
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
									{gradientBaseColor && (
										<button
											className="h-10 w-10 rounded-full border-2 border-lime-700"
											style={{ backgroundColor: gradientBaseColor }}
											type="button"
										/>
									)}
									{SOLID_COLORS.map((color) => (
										<ColorOption
											color={color}
											field="customBackgroundGradient"
											handleChange={(_, v) => applyGradientFromColor(v)}
											isSelected={false}
											key={color}
										/>
									))}
								</div>
								{activeColorPicker === "gradient" && (
									<div className="mt-3 w-min" data-color-picker>
										<HexColorPicker
											color={gradientBaseColor}
											onChange={(c) => applyGradientFromColor(c)}
										/>
										<HexColorInput
											className="mt-2 w-full rounded border border-zinc-300 p-2 text-center dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
											color={gradientBaseColor}
											onChange={(c) => applyGradientFromColor(c)}
											placeholder="#8b36af"
											prefixed
										/>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Imagem de Fundo */}
					{backgroundType === "image" && (
						<div className="space-y-3 rounded-md border p-3">
							<p className="text-muted-foreground text-sm">
								Selecione uma imagem vertical (9:16).
							</p>

							<div className="flex gap-2">
								<button
									className="rounded-md border px-4 py-2 text-sm"
									disabled={!canUseBackgroundMedia}
									onClick={() => {
										if (!canUseBackgroundMedia) {
											return;
										}
										setBackgroundModalType("image");
										setIsBackgroundModalOpen(true);
									}}
									type="button"
								>
									Selecionar imagem
								</button>

								{customizations.customBackgroundImageUrl && (
									<button
										className="rounded-md border px-4 py-2 text-sm"
										onClick={() => {
											handleChange("customBackgroundMediaType", "");
											handleChange("customBackgroundImageUrl", "");
										}}
										type="button"
									>
										Remover imagem
									</button>
								)}
							</div>
							{canUseBackgroundMedia ? null : (
								<div className="flex items-center gap-2">
									<ProButton
										href="/planos"
										label="Pro"
										showOverlayTooltip={false}
										size="xs"
										tooltip="Disponível nos planos Pro e Ultra"
									/>
								</div>
							)}
						</div>
					)}
					{/* Vídeo de Fundo */}
					{backgroundType === "video" && (
						<div className="space-y-3 rounded-md border p-3">
							<p className="text-muted-foreground text-sm">
								Upload de vídeo vertical (9:16). Será reproduzido em loop.
							</p>

							<div className="flex gap-2">
								<button
									className="rounded-md border px-4 py-2 text-sm"
									disabled={!canUseBackgroundMedia}
									onClick={() => {
										if (!canUseBackgroundMedia) {
											return;
										}
										setBackgroundModalType("video");
										setIsBackgroundModalOpen(true);
									}}
									type="button"
								>
									Selecionar vídeo
								</button>

								{customizations.customBackgroundVideoUrl && (
									<button
										className="rounded-md border px-4 py-2 text-sm"
										onClick={() => {
											handleChange("customBackgroundMediaType", "");
											handleChange("customBackgroundVideoUrl", "");
										}}
										type="button"
									>
										Remover vídeo
									</button>
								)}
							</div>
							{canUseBackgroundMedia ? null : (
								<div className="flex items-center gap-2">
									<ProButton
										href="/planos"
										label="Pro"
										showOverlayTooltip={false}
										size="xs"
										tooltip="Disponível nos planos Pro e Ultra"
									/>
								</div>
							)}
						</div>
					)}

					<div className="flex items-center justify-between">
						<div>
							<RenderLabel
								hasPending={hasPendingChange("customBlurredBackground")}
								text="Background Desfocado"
							/>
							<p className="text-muted-foreground text-sm">
								Usar imagem do perfil como fundo desfocado em telas maiores
							</p>
						</div>
						<Switch
							checked={customizations.customBlurredBackground ?? true}
							onCheckedChange={(checked) =>
								handleChange("customBlurredBackground", checked)
							}
						/>
					</div>
				</CardContent>
			</Card>

			<BackgroundMediaModal
				isOpen={isBackgroundModalOpen}
				onClose={() => setIsBackgroundModalOpen(false)}
				onUploaded={(url, t) => {
					if (t === "image") {
						updateCustomization("customBackgroundMediaType", "image");
						updateCustomization("customBackgroundImageUrl", url);
						updateCustomization("customBackgroundVideoUrl", "");
					} else {
						updateCustomization("customBackgroundMediaType", "video");
						updateCustomization("customBackgroundVideoUrl", url);
						updateCustomization("customBackgroundImageUrl", "");
					}

					// Garantir exclusividade: limpar cor e gradiente
					updateCustomization("customBackgroundColor", "");
					updateCustomization("customBackgroundGradient", "");
				}}
				type={backgroundModalType}
			/>

			{/* Seção Texto */}
			<Card>
				<CardHeader>
					<CardTitle>Texto</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<ColorSelector
						activeColorPicker={activeColorPicker}
						customizations={convertCustomizationsToRecord(customizations)}
						debouncedHandleChange={debouncedHandleChange}
						field="customTextColor"
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
						label="Cor do Texto e Ícones"
						setActiveColorPicker={setActiveColorPicker}
					/>

					<FontSelector
						customizations={convertCustomizationsToRecord(customizations)}
						handleChange={handleChange}
						setIsFontModalOpen={setIsFontModalOpen}
					/>
				</CardContent>
			</Card>

			{/* Seção Botões */}
			<Card>
				<CardHeader>
					<CardTitle>Botões</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<ColorSelector
						activeColorPicker={activeColorPicker}
						customizations={convertCustomizationsToRecord(customizations)}
						debouncedHandleChange={debouncedHandleChange}
						field="customButtonColor"
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
						label="Cor do Botão"
						setActiveColorPicker={setActiveColorPicker}
					/>

					<ColorSelector
						activeColorPicker={activeColorPicker}
						customizations={convertCustomizationsToRecord(customizations)}
						debouncedHandleChange={debouncedHandleChange}
						field="customButtonTextColor"
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
						label="Cor do Texto do Botão"
						setActiveColorPicker={setActiveColorPicker}
					/>

					<ButtonStyleSelector
						customizations={convertCustomizationsToRecord(customizations)}
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
					/>

					<ButtonCornersSelector
						customizations={convertCustomizationsToRecord(customizations)}
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
					/>
				</CardContent>
			</Card>

			{/* Seção Cores */}
			<Card>
				<CardHeader>
					<CardTitle>Cores Selecionadas</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<ColorPreviews
						activeColorPicker={activeColorPicker}
						customizations={convertCustomizationsToRecord(customizations)}
						debouncedHandleChange={debouncedHandleChange}
						handleChange={handleChange}
						setActiveColorPicker={setActiveColorPicker}
					/>
				</CardContent>
			</Card>

			{/* Salvar e Cancelar pendências */}
			{hasUnsavedChanges && (
				<div className="-translate-x-1/2 fixed bottom-16 left-1/2 z-50 mx-auto flex w-max transform items-center gap-2 rounded-full border bg-white/90 p-2 px-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out md:bottom-6 dark:bg-zinc-800/90">
					<span className="hidden font-medium text-sm text-zinc-600 sm:inline-block dark:text-zinc-400">
						Deseja salvar as alterações pendentes?
					</span>
					<BaseButton
						disabled={isSavingPending}
						onClick={handleCancel}
						size="sm"
						variant="white"
					>
						Cancelar
					</BaseButton>
					<BaseButton
						className="px-6"
						disabled={isSavingPending}
						onClick={handleSavePending}
						size="sm"
						variant="studio"
					>
						{isSavingPending ? (
							<span className="flex items-center gap-2">
								<LoadingSpinner />
								Salvando
							</span>
						) : (
							<span>Salvar</span>
						)}
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

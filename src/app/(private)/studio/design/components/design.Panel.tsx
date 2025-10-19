"use client";

import {
	Image as ImageIcon,
	Paintbrush,
	SwatchBook,
	Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import LoadingSpinner from "@/components/buttons/LoadingSpinner";
import BackgroundMediaModal from "@/components/modals/BackgroundMediaModal";
import FontSelectionModal from "@/components/modals/FontSelectionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useDesignStore } from "@/stores/designStore";
import { FONT_OPTIONS, GRADIENTS } from "../constants/design.constants";
import { ColorPreviews } from "./ColorPreviews";
import { ColorSelector } from "./ColorSelectors";
import { RenderLabel } from "./design.RenderLabel";
import {
	ButtonCornersSelector,
	ButtonStyleSelector,
	FontSelector,
} from "./FontButtonSelectors";
import { HeaderStyleButtons } from "./HeaderStylePreview";

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
	} = useDesignStore();

	const [activeColorPicker, setActiveColorPicker] = useState<string | null>(
		null
	);
	const [isFontModalOpen, setIsFontModalOpen] = useState(false);
	const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
	const [backgroundModalType, setBackgroundModalType] = useState<
		"image" | "video"
	>("image");
	const [isSavingPending, setIsSavingPending] = useState(false);

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
		// Alternar apenas a aba exibida; não limpar valores existentes.
		setBackgroundType(type);

		// Para imagem/vídeo, abrir modal de seleção sem alterar o preview atual.
		if (type === "image" || type === "video") {
			setBackgroundModalType(type);
			setIsBackgroundModalOpen(true);
		}
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
												backgroundColor:
													customizations.customBackgroundColor || "#e3e8e5",
											};
										case "gradient":
											return customizations.customBackgroundGradient
												? {
														backgroundImage:
															customizations.customBackgroundGradient,
													}
												: {
														backgroundImage:
															"linear-gradient(135deg, #e3e8e5 0%, #e3e8e5 100%)",
													};
										case "image":
											return customizations.customBackgroundImageUrl
												? {
														backgroundImage: `url("${customizations.customBackgroundImageUrl}")`,
														backgroundSize: "cover",
														backgroundPosition: "top",
														backgroundRepeat: "no-repeat",
													}
												: { backgroundColor: "#e3e8e5" };
										case "video":
											return { backgroundColor: "#e3e8e5" };
										default:
											return { backgroundColor: "#e3e8e5" };
									}
								})();

								const Icon =
									opt.key === "color"
										? Paintbrush
										: opt.key === "gradient"
											? SwatchBook
											: opt.key === "image"
												? ImageIcon
												: Video;

								return (
									<div
										className="flex w-24 flex-col items-center"
										key={opt.key}
									>
										<button
											className={`relative w-full overflow-hidden rounded-xl border transition-all ${
												isSelected
													? "border-lime-700 ring-2 ring-lime-700 dark:border-lime-600 dark:ring-lime-600"
													: "border-zinc-300 hover:border-green-500 dark:border-zinc-600 dark:hover:border-green-400"
											}`}
											onClick={() => handleBackgroundTypeChange(opt.key)}
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
												<Icon
													className={`h-6 w-6 ${
														isSelected
															? "text-lime-700 dark:text-lime-400"
															: "text-white drop-shadow-sm"
													}`}
												/>
											</div>
										</button>
										<span
											className={`mt-1 text-center text-xs ${
												isSelected
													? "text-lime-700 dark:text-lime-400"
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
												? "border-2 border-lime-700"
												: "border-2 border-zinc-200 hover:border-green-500 dark:border-zinc-600 dark:hover:border-green-400"
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
									onClick={() => {
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
									onClick={() => {
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

"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
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

	useEffect(() => {
		// Sincroniza o tipo com os valores atuais das customizações
		if (customizations.customBackgroundGradient) {
			setBackgroundType("gradient");
		} else if (customizations.customBackgroundColor) {
			setBackgroundType("color");
		}
	}, [
		customizations.customBackgroundGradient,
		customizations.customBackgroundColor,
	]);

	const handleChange = (field: string, value: string | boolean) => {
		updateCustomization(field as any, value);
	};

	const debouncedHandleChange = handleChange;

	const handleBackgroundTypeChange = (
		type: "color" | "gradient" | "image" | "video"
	) => {
		setBackgroundType(type);

		// Garantir exclusividade limpando campos conflitantes
		if (type === "color") {
			handleChange("customBackgroundGradient", "");
			handleChange("customBackgroundMediaType", "");
			handleChange("customBackgroundImageUrl", "");
			handleChange("customBackgroundVideoUrl", "");
		} else if (type === "gradient") {
			handleChange("customBackgroundColor", "");
			handleChange("customBackgroundMediaType", "");
			handleChange("customBackgroundImageUrl", "");
			handleChange("customBackgroundVideoUrl", "");
		} else {
			// imagem ou vídeo: limpa cor e gradiente
			handleChange("customBackgroundColor", "");
			handleChange("customBackgroundGradient", "");
			// Abre modal de seleção
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
						<div className="mt-2 flex flex-wrap gap-2">
							{(
								[
									{ key: "color", label: "Cor sólida" },
									{ key: "gradient", label: "Gradiente" },
									{ key: "image", label: "Imagem" },
									{ key: "video", label: "Vídeo" },
								] as const
							).map((opt) => (
								<button
									className={`rounded-xl border px-3 py-5 text-sm transition-all ${
										backgroundType === opt.key
											? "border-lime-700 text-lime-700 dark:border-lime-600 dark:text-lime-400"
											: "border-neutral-200 text-neutral-700 hover:border-green-500 hover:text-green-600 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-green-400 dark:hover:text-green-300"
									}`}
									key={opt.key}
									onClick={() => handleBackgroundTypeChange(opt.key)}
									type="button"
								>
									{opt.label}
								</button>
							))}
						</div>
						<p className="mt-2 text-muted-foreground text-xs">
							Apenas uma opção de fundo é usada por vez. Alternar o tipo limpa a
							seleção anterior.
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
												: "border-2 border-neutral-200 hover:border-green-500 dark:border-neutral-600 dark:hover:border-green-400"
										}`}
										key={gradient}
										onClick={() =>
											handleChange("customBackgroundGradient", gradient)
										}
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
								Selecione uma imagem vertical e faça o crop 9:16.
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
								Upload de vídeo vertical. Será reproduzido em loop e sem
								controles.
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
				<div className="-translate-x-1/2 fixed bottom-16 left-1/2 z-50 mx-auto flex w-max transform items-center gap-2 rounded-full border bg-white/90 p-2 px-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out md:bottom-6 dark:bg-neutral-800/90">
					<span className="hidden font-medium text-neutral-600 text-sm sm:inline-block dark:text-neutral-400">
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
						{isSavingPending && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
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

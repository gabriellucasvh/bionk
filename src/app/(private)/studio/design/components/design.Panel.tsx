"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import FontSelectionModal from "@/components/modals/FontSelectionModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SocialLinkItem } from "@/types/social";
import {
	FONT_OPTIONS,
	GRADIENTS,
} from "../constants/design.constants";
import { useDesignForm } from "../hooks/useDesignForm";
import { ColorPreviews } from "./ColorPreviews";
import { ColorSelector } from "./ColorSelectors";
import { RenderLabel } from "./design.RenderLabel";
import {
	ButtonCornersSelector,
	ButtonStyleSelector,
	FontSelector,
} from "./FontButtonSelectors";
import { HeaderStyleButtons } from "./HeaderStylePreview";

interface UserData {
	name: string;
	username: string;
	bio?: string;
	image?: string;
	socialLinks: SocialLinkItem[];
}



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
	onSave: (changes: Partial<Record<string, string>>) => Promise<void>;
}

export function DesignPanel({
	userCustomizations,
	userData,
	onSave,
}: DesignPanelProps) {
	const {
		customizations,
		activeColorPicker,
		isFontModalOpen,
		pendingChanges,
		isSaving,
		isExiting,
		handleChange,
		debouncedHandleChange,
		handleSavePending,
		handleCancel,
		hasPendingChange,
		setActiveColorPicker,
		setIsFontModalOpen,
	} = useDesignForm({
		userCustomizations,
		onSave,
	});

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
					<ColorSelector
						activeColorPicker={activeColorPicker}
						customizations={customizations}
						debouncedHandleChange={debouncedHandleChange}
						field="customBackgroundColor"
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
						label="Cor de Fundo"
						setActiveColorPicker={setActiveColorPicker}
					/>

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
											: "border-2 border-neutral-200 hover:border-blue-500 dark:border-neutral-600 dark:hover:border-blue-400"
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
				</CardContent>
			</Card>

			{/* Seção Texto */}
			<Card>
				<CardHeader>
					<CardTitle>Texto</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<ColorSelector
						activeColorPicker={activeColorPicker}
						customizations={customizations}
						debouncedHandleChange={debouncedHandleChange}
						field="customTextColor"
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
						label="Cor do Texto e Ícones"
						setActiveColorPicker={setActiveColorPicker}
					/>

					<FontSelector
						customizations={customizations}
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
						customizations={customizations}
						debouncedHandleChange={debouncedHandleChange}
						field="customButtonColor"
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
						label="Cor do Botão"
						setActiveColorPicker={setActiveColorPicker}
					/>

					<ColorSelector
						activeColorPicker={activeColorPicker}
						customizations={customizations}
						debouncedHandleChange={debouncedHandleChange}
						field="customButtonTextColor"
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
						label="Cor do Texto do Botão"
						setActiveColorPicker={setActiveColorPicker}
					/>

					<ButtonStyleSelector
						customizations={customizations}
						handleChange={handleChange}
						hasPendingChange={hasPendingChange}
					/>

					<ButtonCornersSelector
						customizations={customizations}
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
						customizations={customizations}
						debouncedHandleChange={debouncedHandleChange}
						handleChange={handleChange}
						setActiveColorPicker={setActiveColorPicker}
					/>
				</CardContent>
			</Card>

			{/* Salvar e Cancelar pendências */}
			{Object.keys(pendingChanges).length > 0 && (
				<div
					className={`-translate-x-1/2 fixed bottom-16 left-1/2 z-50 mx-auto flex w-max transform items-center gap-2 rounded-full border bg-white/90 p-2 px-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out md:bottom-6 dark:bg-neutral-800/90 ${
						isExiting
							? "translate-y-full opacity-0"
							: "translate-y-0 opacity-100"
					}`}
				>
					<span className="hidden font-medium text-neutral-600 text-sm sm:inline-block dark:text-neutral-400">
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

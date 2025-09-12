"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { BaseButton } from "./buttons/BaseButton";

interface SensitiveContentWarningProps {
	onContinue: () => void;
	onGoBack: () => void;
}

const SensitiveContentWarning: React.FC<SensitiveContentWarningProps> = ({
	onContinue,
	onGoBack,
}) => {
	const [isVisible, setIsVisible] = useState(true);

	if (!isVisible) {
		return null;
	}

	const handleContinue = () => {
		setIsVisible(false);
		onContinue();
	};

	// Classes fixas do tema dark
	const themeClasses = {
		container: "bg-black text-white",
		button: "bg-white text-black hover:bg-gray-200",
		secondaryButton: "text-white border border-white hover:bg-neutral-900",
	};

	return (
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center ${themeClasses.container}`}
		>
			<div className="mx-4 w-full max-w-md space-y-6 rounded-lg p-8 text-center shadow-2xl">
				<div className="flex justify-center">
					<AlertTriangle className="text-yellow-400" size={64} />
				</div>

				<div className="space-y-4">
					<h1 className="font-bold text-2xl">Conteúdo Sensível</h1>

					<p className="text-gray-300 text-lg">
						Esta página pode conter conteúdo sensível ou inadequado para menores
						de idade.
					</p>

					<p className="text-gray-400 text-sm">
						Ao continuar, você confirma que tem idade suficiente para visualizar
						este conteúdo.
					</p>
				</div>

				<div className="mx-auto flex max-w-11/12 flex-col items-center justify-center gap-3">
					<BaseButton
						className={`flex w-full items-center gap-2 ${themeClasses.button}`}
						onClick={handleContinue}
					>
						Continuar
					</BaseButton>
					<BaseButton
						className={`flex w-full items-center gap-2 ${themeClasses.secondaryButton} border-2`}
						onClick={onGoBack}
						variant="outline"
					>
						Voltar
					</BaseButton>
				</div>
			</div>
		</div>
	);
};

export default SensitiveContentWarning;

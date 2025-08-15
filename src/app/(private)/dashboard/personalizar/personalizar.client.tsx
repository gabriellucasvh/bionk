// src/app/(private)/dashboard/personalizar/personalizar.client.tsx
"use client";

import { useEffect, useState } from "react";
import CustomizationPanel from "./CustomizationPanel";
import CategoriasTemplates from "./components/personalizar.CategoriasTemplates";

// Definir o tipo das customizações
type UserCustomizations = {
	customBackgroundColor: string;
	customBackgroundGradient: string;
	customTextColor: string;
	customFont: string;
	customButton: string;
	customButtonFill: string;
	customButtonCorners: string;
};

const PersonalizarClient = () => {
	const [userCustomizations, setUserCustomizations] =
		useState<UserCustomizations>({
			customBackgroundColor: "",
			customBackgroundGradient: "",
			customTextColor: "",
			customFont: "",
			customButton: "",
			customButtonFill: "",
			customButtonCorners: "",
		});

	// Carregar personalizações existentes
	useEffect(() => {
		const fetchCustomizations = async () => {
			const response = await fetch("/api/user-customizations");
			const data = await response.json();
			if (data) {
				setUserCustomizations(data);
			}
		};
		fetchCustomizations();
	}, []);

	// Função para lidar com mudança de template (callback)
	const handleTemplateChange = () => {
		// Resetar as personalizações localmente quando o template mudar
		const resetCustomizations: UserCustomizations = {
			customBackgroundColor: "",
			customBackgroundGradient: "",
			customTextColor: "",
			customFont: "",
			customButton: "",
			customButtonFill: "",
			customButtonCorners: "",
		};

		setUserCustomizations(resetCustomizations);
	};

	// Função atualizada para aceitar personalizações parciais
	const handleSaveCustomizations = async (
		partialCustomizations: Partial<UserCustomizations>
	) => {
		const response = await fetch("/api/update-customizations", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(partialCustomizations), // Enviar apenas as mudanças
		});

		if (response.ok) {
			// Atualizar o estado local mesclando as mudanças
			setUserCustomizations((prev) => ({
				...prev,
				...partialCustomizations,
			}));
		}
	};

	return (
		<div className="min-h-screen w-full bg-white font-gsans text-black lg:w-7/12">
			<section className="flex min-h-screen flex-col gap-6 px-6 py-8">
				{/* Seção de Templates */}
				<section className="">
					<h2 className="mb-4 hidden font-bold text-lg md:text-2xl lg:block">
						Templates:
					</h2>
					{/* Adicionar aviso sobre reset */}
					<div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
						<p className="text-blue-700 text-sm">
							ℹ️ <strong>Importante:</strong> Ao selecionar um novo template,
							suas personalizações customizadas serão resetadas.
						</p>
					</div>
					<CategoriasTemplates onTemplateChange={handleTemplateChange} />
				</section>

				{/* Seção de Personalização */}
				<section className="mt-6 border-t pt-6">
					<h2 className="mb-4 hidden font-bold text-lg md:text-2xl lg:block">
						Personalização:
					</h2>
					<div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
						<p className="text-sm text-yellow-700">
							🎨 <strong>Dica:</strong> Cada mudança é salva automaticamente.
							Personalize cores, fontes e estilos do seu perfil.
						</p>
					</div>
					<CustomizationPanel
						onSave={handleSaveCustomizations}
						userCustomizations={userCustomizations}
					/>
				</section>
			</section>
		</div>
	);
};

export default PersonalizarClient;

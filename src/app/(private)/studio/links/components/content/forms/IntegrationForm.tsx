"use client";

import {
	BarChart3,
	Calendar,
	Code,
	Globe,
	ShoppingCart,
	Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
	ContentFormData,
	IntegrationType,
} from "../../../types/content.types";

interface IntegrationFormProps {
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
}

const IntegrationForm = ({ formData, setFormData }: IntegrationFormProps) => {
	const integrationTypes: {
		type: IntegrationType;
		label: string;
		icon: any;
		description: string;
	}[] = [
		{
			type: "zapier",
			label: "Zapier",
			icon: Zap,
			description: "Automações e workflows",
		},
		{
			type: "webhook",
			label: "Webhook",
			icon: Code,
			description: "Integração personalizada",
		},
		{
			type: "embed",
			label: "Embed",
			icon: Globe,
			description: "Código HTML/iframe",
		},
		{
			type: "ecommerce",
			label: "E-commerce",
			icon: ShoppingCart,
			description: "Loja online",
		},
		{
			type: "calendar",
			label: "Calendário",
			icon: Calendar,
			description: "Agendamentos",
		},
		{
			type: "analytics",
			label: "Analytics",
			icon: BarChart3,
			description: "Métricas e dados",
		},
	];

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="space-y-3">
					<Label>Tipo de Integração</Label>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						{integrationTypes.map(
							({ type, label, icon: Icon, description }) => (
								<button
									className={cn(
										"rounded-lg border-2 p-4 text-left transition-all",
										formData.integrationType === type
											? "border-green-500 bg-green-50 dark:bg-green-950/20"
											: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
									)}
									key={type}
									onClick={() =>
										setFormData({ ...formData, integrationType: type })
									}
									type="button"
								>
									<Icon className="mb-2 h-6 w-6 text-blue-600" />
									<div className="mb-1 font-medium text-sm">{label}</div>
									<div className="text-muted-foreground text-xs">
										{description}
									</div>
								</button>
							)
						)}
					</div>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="integrationTitle">Título</Label>
					<Input
						autoFocus
						id="integrationTitle"
						onChange={(e) =>
							setFormData({
								...formData,
								title: e.target.value,
								integrationConfig: {
									...formData.integrationConfig,
									integrationTitle: e.target.value,
								},
							})
						}
						placeholder="Nome da integração"
						value={formData.title || ""}
					/>
				</div>

				{formData.integrationType === "webhook" && (
					<div className="grid gap-2">
						<Label htmlFor="webhookUrl">URL do Webhook</Label>
						<Input
							id="webhookUrl"
							onChange={(e) =>
								setFormData({
									...formData,
									integrationConfig: {
										...formData.integrationConfig,
										webhookUrl: e.target.value,
									},
								})
							}
							placeholder="https://api.exemplo.com/webhook"
							type="url"
							value={formData.integrationConfig?.webhookUrl || ""}
						/>
					</div>
				)}

				{formData.integrationType === "embed" && (
					<div className="grid gap-2">
						<Label htmlFor="embedCode">Código HTML/Embed</Label>
						<Textarea
							id="embedCode"
							onChange={(e) =>
								setFormData({
									...formData,
									integrationConfig: {
										...formData.integrationConfig,
										embedCode: e.target.value,
									},
								})
							}
							placeholder="<iframe src='...' width='100%' height='400'></iframe>"
							rows={6}
							value={formData.integrationConfig?.embedCode || ""}
						/>
						<p className="text-muted-foreground text-xs">
							Cole o código HTML, iframe ou script fornecido pelo serviço
						</p>
					</div>
				)}

				{formData.integrationType === "zapier" && (
					<div className="grid gap-2">
						<Label htmlFor="zapierWebhook">Webhook do Zapier</Label>
						<Input
							id="zapierWebhook"
							onChange={(e) =>
								setFormData({
									...formData,
									integrationConfig: {
										...formData.integrationConfig,
										zapierWebhook: e.target.value,
									},
								})
							}
							placeholder="https://hooks.zapier.com/hooks/catch/..."
							value={formData.integrationConfig?.zapierWebhook || ""}
						/>
					</div>
				)}

				{(formData.integrationType === "ecommerce" ||
					formData.integrationType === "calendar" ||
					formData.integrationType === "analytics") && (
					<div className="grid gap-2">
						<Label htmlFor="integrationUrl">URL da Integração</Label>
						<Input
							id="integrationUrl"
							onChange={(e) =>
								setFormData({
									...formData,
									integrationConfig: {
										...formData.integrationConfig,
										integrationUrl: e.target.value,
									},
								})
							}
							placeholder="https://..."
							type="url"
							value={formData.integrationConfig?.integrationUrl || ""}
						/>
					</div>
				)}
			</div>

			<div className="rounded-lg border border-gray-300 border-dashed p-6 text-center dark:border-gray-600">
				<div className="text-muted-foreground text-sm">
					<p className="mb-2">
						🔗 <strong>Integrações:</strong>
					</p>
					<p>
						Conecte ferramentas externas e automatize processos no seu perfil.
					</p>
				</div>
			</div>
		</div>
	);
};

export default IntegrationForm;

"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Lock, Tags } from "lucide-react";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ContentFormData } from "../../../types/content.types";

interface LinkFormProps {
	formData: ContentFormData;
	setFormData: (data: ContentFormData) => void;
	existingSections: string[];
}

type ActiveOption = "schedule" | "protect" | "badge";

const LinkForm = ({
	formData,
	setFormData,
	existingSections,
}: LinkFormProps) => {
	const [activeOptions, setActiveOptions] = useState<ActiveOption[]>([]);

	const toggleOption = (option: ActiveOption) => {
		setActiveOptions((prev) =>
			prev.includes(option)
				? prev.filter((o) => o !== option)
				: [...prev, option]
		);
	};

	const isOptionActive = (option: ActiveOption) =>
		activeOptions.includes(option);

	return (
		<div className="space-y-6">
			{/* Basic Fields */}
			<div className="space-y-4">
				<div className="grid gap-2">
					<Label htmlFor="title">Título do Link</Label>
					<Input
						autoFocus
						id="title"
						onChange={(e) =>
							setFormData({ ...formData, title: e.target.value })
						}
						placeholder="Ex: Meu Portfolio, Loja Online"
						value={formData.title || ""}
					/>
				</div>

				<div className="grid gap-2">
					<Label htmlFor="url">URL</Label>
					<Input
						id="url"
						onChange={(e) => setFormData({ ...formData, url: e.target.value })}
						placeholder="https://exemplo.com"
						type="url"
						value={formData.url || ""}
					/>
				</div>

				{existingSections.length > 0 && (
					<div className="grid gap-2">
						<Label htmlFor="section">Seção (Opcional)</Label>
						<select
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							id="section"
							onChange={(e) =>
								setFormData({
									...formData,
									sectionId: e.target.value ? Number(e.target.value) : null,
								})
							}
							value={formData.sectionId || ""}
						>
							<option value="">Sem seção</option>
							{existingSections.map((section, index) => (
								<option key={index} value={index + 1}>
									{section}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			{/* Advanced Options */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">Opções Avançadas</h3>

				<div className="flex flex-wrap gap-2">
					<BaseButton
						className="flex items-center gap-2"
						onClick={() => toggleOption("schedule")}
						size="sm"
						variant={isOptionActive("schedule") ? "default" : "white"}
					>
						<Clock className="h-4 w-4" />
						Agendar
					</BaseButton>

					<BaseButton
						className="flex items-center gap-2"
						onClick={() => toggleOption("protect")}
						size="sm"
						variant={isOptionActive("protect") ? "default" : "white"}
					>
						<Lock className="h-4 w-4" />
						Proteger
					</BaseButton>

					<BaseButton
						className="flex items-center gap-2"
						onClick={() => toggleOption("badge")}
						size="sm"
						variant={isOptionActive("badge") ? "default" : "white"}
					>
						<Tags className="h-4 w-4" />
						Badge
					</BaseButton>
				</div>

				{/* Schedule Panel */}
				{isOptionActive("schedule") && (
					<div className="grid grid-cols-1 gap-4 rounded-md border bg-background/50 p-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label>Data de Lançamento</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										className={cn(
											"justify-start text-left font-normal",
											!formData.launchesAt && "text-muted-foreground"
										)}
										variant="outline"
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{formData.launchesAt
											? format(new Date(formData.launchesAt), "PPP")
											: "Selecionar data"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										initialFocus
										mode="single"
										onSelect={(date) =>
											setFormData({ ...formData, launchesAt: date })
										}
										selected={
											formData.launchesAt
												? new Date(formData.launchesAt)
												: undefined
										}
									/>
								</PopoverContent>
							</Popover>
						</div>

						<div className="grid gap-2">
							<Label>Data de Expiração</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										className={cn(
											"justify-start text-left font-normal",
											!formData.expiresAt && "text-muted-foreground"
										)}
										variant="outline"
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{formData.expiresAt
											? format(new Date(formData.expiresAt), "PPP")
											: "Selecionar data"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										initialFocus
										mode="single"
										onSelect={(date) =>
											setFormData({ ...formData, expiresAt: date })
										}
										selected={
											formData.expiresAt
												? new Date(formData.expiresAt)
												: undefined
										}
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				)}

				{/* Protect Panel */}
				{isOptionActive("protect") && (
					<div className="grid grid-cols-1 gap-4 rounded-md border bg-background/50 p-4 sm:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="deleteOnClicks">Excluir após X cliques</Label>
							<Input
								id="deleteOnClicks"
								min={1}
								onChange={(e) =>
									setFormData({
										...formData,
										deleteOnClicks:
											Number(e.target.value) >= 1
												? Number(e.target.value)
												: undefined,
									})
								}
								placeholder="Ex: 100"
								type="number"
								value={formData.deleteOnClicks || ""}
							/>
						</div>

						<div className="grid gap-2">
							<Label htmlFor="password">Senha de Acesso</Label>
							<Input
								id="password"
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
								placeholder="••••••••"
								type="password"
								value={formData.password || ""}
							/>
						</div>
					</div>
				)}

				{/* Badge Panel */}
				{isOptionActive("badge") && (
					<div className="grid gap-2 rounded-md border bg-background/50 p-4">
						<Label htmlFor="badge">Texto do Badge</Label>
						<Input
							id="badge"
							maxLength={12}
							onChange={(e) =>
								setFormData({ ...formData, badge: e.target.value })
							}
							placeholder="Ex: PROMO, NOVO"
							value={formData.badge || ""}
						/>
						<p className="text-muted-foreground text-xs">
							Máximo de 12 caracteres.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default LinkForm;

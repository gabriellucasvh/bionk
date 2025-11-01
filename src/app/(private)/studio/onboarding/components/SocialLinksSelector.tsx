"use client";

import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SOCIAL_PLATFORMS } from "@/config/social-platforms";

export default function SocialLinksSelector({
	value,
	onChange,
}: {
	value: { platform: string; username: string }[];
	onChange: (v: { platform: string; username: string }[]) => void;
}) {
	const [selectedPlatform, setSelectedPlatform] = useState<string>("");
	const [username, setUsername] = useState<string>("");
	const [editingPlatform, setEditingPlatform] = useState<string>("");
	const [editingUsername, setEditingUsername] = useState<string>("");

	const addLink = () => {
		if (!(selectedPlatform && username.trim())) {
			return;
		}
		const next = value.filter((v) => v.platform !== selectedPlatform);
		next.push({ platform: selectedPlatform, username: username.trim() });
		onChange(next);
		setUsername("");
		setSelectedPlatform("");
	};

	const saveEdit = () => {
		if (!(editingPlatform && editingUsername.trim())) {
			return;
		}
		const next = value.map((i) =>
			i.platform === editingPlatform
				? { platform: i.platform, username: editingUsername.trim() }
				: i
		);
		onChange(next);
		setEditingPlatform("");
		setEditingUsername("");
	};

	const platforms = SOCIAL_PLATFORMS;

	return (
		<div className="space-y-3">
			<div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
				{platforms.map((p) =>
					(() => {
						const isEditing = !!editingPlatform;
						const isAdded = value.some((v) => v.platform === p.key);
						const isDisabled =
							isEditing || (isAdded && selectedPlatform !== p.key);
						return (
							<button
								className={`flex h-20 w-full flex-col items-center justify-center rounded-xl border p-2 transition ${
									selectedPlatform === p.key
										? "border-lime-500"
										: "border-gray-200 hover:border-gray-300 dark:border-gray-700"
								} ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
								disabled={isDisabled}
								key={p.key}
								onClick={() => {
									if (isDisabled) {
										return;
									}
									setSelectedPlatform(p.key);
								}}
								title={p.name}
								type="button"
							>
								<div
									className="mb-1 h-7 w-7"
									style={{
										backgroundColor: p.color,
										maskImage: `url(${p.icon})`,
										maskSize: "contain",
										maskRepeat: "no-repeat",
										maskPosition: "center",
									}}
								/>
								<span className="truncate text-xs">{p.name}</span>
							</button>
						);
					})()
				)}
			</div>
			{selectedPlatform &&
				!value.some((v) => v.platform === selectedPlatform) && (
					<div className="space-y-2">
						<Label>Usuário</Label>
						<Input
							onChange={(e) => setUsername(e.target.value)}
							placeholder={
								platforms.find((p) => p.key === selectedPlatform)
									?.placeholder || "usuario"
							}
							value={username}
						/>
						<div className="flex items-center gap-2">
							<BaseButton
								onClick={() => {
									setSelectedPlatform("");
									setUsername("");
								}}
								variant="white"
							>
								Cancelar
							</BaseButton>
							<div className="flex justify-end">
								<BaseButton onClick={addLink}>Adicionar</BaseButton>
							</div>
						</div>
					</div>
				)}
			{value.length > 0 && (
				<div className="space-y-2">
					<Label>Redes adicionadas</Label>
					<ul className="space-y-2">
						{value.map((v) => {
							const cfg = platforms.find((p) => p.key === v.platform);
							return (
								<li
									className="flex items-center justify-between rounded-lg border p-2"
									key={v.platform}
								>
									<div className="flex w-full flex-col gap-2">
										{editingPlatform === v.platform ? (
											<>
												<div className="flex w-full items-center gap-3">
													<div
														className="h-6 w-6"
														style={{
															backgroundColor: cfg?.color,
															maskImage: cfg ? `url(${cfg.icon})` : undefined,
															maskSize: "contain",
															maskRepeat: "no-repeat",
															maskPosition: "center",
														}}
													/>
													<Input
														className="w-full min-w-0"
														onChange={(e) => setEditingUsername(e.target.value)}
														placeholder={
															platforms.find((p) => p.key === v.platform)
																?.placeholder || "usuario"
														}
														value={editingUsername}
													/>
												</div>
												<div className="flex items-center justify-end gap-2">
													<BaseButton onClick={saveEdit}>Salvar</BaseButton>
													<BaseButton
														onClick={() => {
															setEditingPlatform("");
															setEditingUsername("");
														}}
														variant="white"
													>
														Cancelar
													</BaseButton>
												</div>
											</>
										) : (
											<div className="flex items-center gap-3">
												<div
													className="h-6 w-6"
													style={{
														backgroundColor: cfg?.color,
														maskImage: cfg ? `url(${cfg.icon})` : undefined,
														maskSize: "contain",
														maskRepeat: "no-repeat",
														maskPosition: "center",
													}}
												/>
												<span className="text-sm">{v.username}</span>
											</div>
										)}
									</div>
									<div
										className={`flex items-center gap-2 ${editingPlatform === v.platform ? "hidden" : ""}`}
									>
										{editingPlatform === v.platform ? (
											<>
												<BaseButton onClick={saveEdit}>Salvar</BaseButton>
												<BaseButton
													onClick={() => {
														setEditingPlatform("");
														setEditingUsername("");
													}}
													variant="white"
												>
													Cancelar
												</BaseButton>
											</>
										) : (
											<>
												<button
													className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
													onClick={() => {
														setEditingPlatform(v.platform);
														setEditingUsername(v.username);
													}}
													title="Editar"
													type="button"
												>
													<Edit className="h-4 w-4" />
												</button>
												<button
													className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
													onClick={() =>
														onChange(
															value.filter((i) => i.platform !== v.platform)
														)
													}
													title="Remover"
													type="button"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</>
										)}
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			)}
		</div>
	);
}

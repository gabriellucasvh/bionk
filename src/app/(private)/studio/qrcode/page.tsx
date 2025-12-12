"use client";

import { Copy, Download, ExternalLink, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import ImageCropModal from "@/components/modals/ImageCropModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const URL_REGEX = /^https?:\/\/[\w.-]+(?::\d+)?(?:\/.*)?$/i;

type QrItem = {
	hash: string;
	url: string;
	createdAt: string | null;
	format: string | null;
	size: number;
	bytes: number;
	originalUrl: string | null;
};

export default function QrcodeStudioPage() {
	const { data: session } = useSession();
	const [items, setItems] = useState<QrItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [link, setLink] = useState("");
	const [logoUrl, setLogoUrl] = useState<string | null>(null);
	const [isUploadingLogo, setIsUploadingLogo] = useState(false);
	const [isLogoCropModalOpen, setIsLogoCropModalOpen] = useState(false);

	const count = items.length;

	useEffect(() => {
		const run = async () => {
			if (!session?.user?.id) {
				return;
			}
			setLoading(true);
			try {
				const res = await fetch("/api/qrcode/list", { cache: "no-store" });
				if (res.ok) {
					const data = await res.json();
					setItems(Array.isArray(data.items) ? data.items : []);
				} else {
					setItems([]);
				}
				const logoRes = await fetch("/api/qrcode/logo", { cache: "no-store" });
				if (logoRes.ok) {
					const js = await logoRes.json();
					setLogoUrl(js?.url || null);
				}
			} catch {
				setItems([]);
			} finally {
				setLoading(false);
			}
		};
		run();
	}, [session]);

	const submit = async (withLogo: boolean) => {
		const raw = link.trim();
		if (!(raw && URL_REGEX.test(raw))) {
			return;
		}
		setSubmitting(true);
		try {
			const res = await fetch("/api/qrcode", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(
					withLogo && logoUrl ? { url: raw, logoUrl } : { url: raw }
				),
			});
			if (!res.ok) {
				return;
			}
			const data = await res.json();
			const newItem: QrItem = {
				hash: String(data.hash || ""),
				url: String(data.url || ""),
				createdAt: new Date().toISOString(),
				format: String(data.format || "png"),
				size: Number(data.size || 512),
				bytes: 0,
				originalUrl: raw,
			};
			setItems((prev) => [newItem, ...prev]);
			setLink("");
		} catch {}
		setSubmitting(false);
	};

	const handleLogoFile = async (file: File) => {
		setIsUploadingLogo(true);
		try {
			const fd = new FormData();
			fd.append("file", file);
			const res = await fetch("/api/qrcode/logo", {
				method: "POST",
				body: fd,
			});
			const json = await res.json();
			if (!(res.ok && json.url)) {
				return;
			}
			const url = String(json.url);
			setLogoUrl(url);
		} catch {}
		setIsUploadingLogo(false);
	};

	const handleLogoSaveFromCrop = async (imageUrl: string) => {
		try {
			const blob = await fetch(imageUrl).then((r) => r.blob());
			const fileType = blob.type || "image/png";
			const file = new File([blob], "logo.png", { type: fileType });
			await handleLogoFile(file);
		} catch {}
	};

	const remove = async (hash: string) => {
		try {
			const res = await fetch(`/api/qrcode/delete/${hash}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				return;
			}
			setItems((prev) => prev.filter((x) => x.hash !== hash));
		} catch {}
	};

	const clearAll = async () => {
		try {
			const res = await fetch("/api/qrcode/clear", { method: "POST" });
			if (!res.ok) {
				return;
			}
			setItems([]);
		} catch {}
	};

	const downloadAll = async () => {
		try {
			const res = await fetch("/api/qrcode/download-all", { method: "GET" });
			if (!res.ok) {
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "qr-codes.zip";
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch {}
	};

	const createdLabel = (iso: string | null) => {
		if (!iso) {
			return "";
		}
		const d = new Date(iso);
		return d.toLocaleString();
	};

	return (
		<div className="container mx-auto h-full space-y-6 p-6 dark:bg-zinc-800">
			<Card className="border-none">
				<CardHeader>
					<CardTitle>QR Codes</CardTitle>
					<CardDescription>
						Gerar, visualizar e gerenciar seus QR codes
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center gap-2 md:flex-row">
						<Input
							onChange={(e) => setLink(e.target.value)}
							placeholder="https://exemplo.com"
							value={link}
						/>
						<div className="flex items-center gap-2">
							<BaseButton
								className="w-xs"
								disabled={
									submitting ||
									loading ||
									!(link.trim() && URL_REGEX.test(link.trim()))
								}
								onClick={() => submit(!!logoUrl)}
								variant="studio"
							>
								Gerar QR
							</BaseButton>
							<Button
								disabled={isUploadingLogo}
								onClick={() => {
									setIsLogoCropModalOpen(true);
								}}
								variant="outline"
							>
								<Upload className="mr-2 h-4 w-4" /> Selecionar logo
							</Button>
							{logoUrl && (
								<div className="flex items-center gap-2">
									<Image
										alt="Logo"
										className="size-8 rounded"
										height={32}
										src={logoUrl}
										width={32}
									/>
									<Button
										onClick={async () => {
											setLogoUrl(null);
											await fetch("/api/qrcode/logo", { method: "DELETE" });
										}}
										size="icon"
										variant="ghost"
									>
										X
									</Button>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="space-y-4">
				{count > 0 && (
					<div className="flex items-center justify-between">
						<Badge variant="secondary">{count} itens</Badge>
						<div className="flex gap-2">
							<BaseButton disabled={loading} onClick={downloadAll}>
								Baixar todos
							</BaseButton>
							<BaseButton
								disabled={loading}
								onClick={clearAll}
								variant="destructive"
							>
								Limpar
							</BaseButton>
						</div>
					</div>
				)}
				{items.map((it) => (
					<Card className="w-full" key={it.hash}>
						<CardContent>
							<div className="flex items-start gap-3">
								<Image
									alt={it.hash}
									className="size-24 rounded-md border lg:size-32"
									height={it.size}
									src={it.url}
									width={it.size}
								/>
								<div className="min-w-0 flex-1">
									<div className="max-w-full truncate text-muted-foreground text-sm">
										{it.originalUrl || it.url}
									</div>
									<div className="text-muted-foreground text-xs">
										{createdLabel(it.createdAt)}
									</div>
									<div className="mt-2 flex gap-2">
										<span className="group relative inline-flex">
											<Button
												onClick={() => {
													const target = it.originalUrl || it.url;
													if (!target) {
														return;
													}
													navigator.clipboard.writeText(target);
												}}
												size="sm"
												variant="outline"
											>
												<Copy />
											</Button>
											<span className="-translate-x-1/2 -top-8 sm:-top-10 pointer-events-none absolute left-1/2 z-50 whitespace-nowrap rounded-full bg-black/90 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
												Copiar
											</span>
										</span>
										<span className="group relative inline-flex">
											<Button
												onClick={() => {
													const target = it.originalUrl || it.url;
													if (!(target && URL_REGEX.test(target))) {
														return;
													}
													window.open(target, "_blank");
												}}
												size="sm"
												variant="outline"
											>
												<ExternalLink />
											</Button>
											<span className="-translate-x-1/2 -top-8 sm:-top-10 pointer-events-none absolute left-1/2 z-50 whitespace-nowrap rounded-full bg-black/90 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
												Abrir
											</span>
										</span>
										<span className="group relative inline-flex">
											<a className="inline-flex" download href={it.url}>
												<Button size="sm" variant="outline">
													<Download />
												</Button>
											</a>
											<span className="-translate-x-1/2 -top-8 sm:-top-10 pointer-events-none absolute left-1/2 z-50 whitespace-nowrap rounded-full bg-black/90 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
												Baixar
											</span>
										</span>
										<span className="group relative inline-flex">
											<Button
												onClick={() => remove(it.hash)}
												size="sm"
												variant="destructive"
											>
												<Trash2 />
											</Button>
											<span className="-translate-x-1/2 -top-8 sm:-top-10 pointer-events-none absolute left-1/2 z-50 whitespace-nowrap rounded-full bg-black/90 px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
												Excluir
											</span>
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<ImageCropModal
				currentImageUrl={logoUrl || undefined}
				isOpen={isLogoCropModalOpen}
				onClose={() => setIsLogoCropModalOpen(false)}
				onImageRemove={async () => {
					setLogoUrl(null);
					await fetch("/api/qrcode/logo", { method: "DELETE" });
				}}
				onImageSave={handleLogoSaveFromCrop}
			/>
		</div>
	);
}

// src/components/ShareListCompact.tsx

"use client";

import {
	Check,
	ChevronRight,
	Link as LinkIcon,
	MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SHARING_PLATFORMS } from "@/config/sharing-platforms";
import { cn } from "@/lib/utils";

interface ShareListCompactProps {
	url: string;
	title: string;
	className?: string;
	showHeader?: boolean; // opcional, para exibir um cabeçalho local
	showCopy?: boolean; // inclui item de copiar link
	showNativeShare?: boolean; // inclui item de compartilhamento nativo
}

const ShareListCompact = ({
	url,
	title,
	className,
	showHeader = false,
	showCopy = true,
	showNativeShare = true,
}: ShareListCompactProps) => {
	const [copied, setCopied] = useState(false);

	const handleCopyLink = () => {
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	const handleNativeShare = () => {
		if (navigator.share) {
			navigator.share({ title, url });
		} else {
			handleCopyLink();
		}
	};

	const handleSocialShare = (platformKey: string) => {
		const platform = SHARING_PLATFORMS.find((p) => p.key === platformKey);
		if (!platform) {
			return;
		}

		const encodedUrl = encodeURIComponent(url);
		const encodedTitle = encodeURIComponent(title);
		const shareUrl = platform.urlTemplate
			.replace("{url}", encodedUrl)
			.replace("{title}", encodedTitle);

		window.open(shareUrl, "_blank", "noopener,noreferrer");
	};

	return (
		<div className={cn("w-full", className)}>
			{showHeader && (
				<h3 className="mb-3 text-left font-medium text-sm text-zinc-700 dark:text-white">
					Compartilhar
				</h3>
			)}

			<ul className="flex w-full flex-col">
				{showCopy && (
					<li>
						<button
							aria-label={copied ? "Copiado!" : "Copiar link"}
							className={cn(
								"w-full rounded-xl bg-white px-3 py-2 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:hover:bg-zinc-800",
								copied && "border-green-200 bg-green-50 dark:border-green-900"
							)}
							onClick={handleCopyLink}
							title={copied ? "Copiado!" : "Copiar link"}
							type="button"
						>
							<div className="flex items-center justify-between">
								<div className="ml-1 flex items-center gap-3">
									{copied ? (
										<Check className="size-5 text-green-600" />
									) : (
										<LinkIcon className="size-5" />
									)}
									<span className="pl-1 text-sm">
										{copied ? "Copiado!" : "Copiar link"}
									</span>
								</div>
								<ChevronRight className="size-4 text-muted-foreground" />
							</div>
						</button>
					</li>
				)}

				{SHARING_PLATFORMS.map((platform) => (
					<li key={platform.key}>
						<button
							aria-label={`Compartilhar no ${platform.name}`}
							className="w-full rounded-xl bg-white px-3 py-2 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:hover:bg-zinc-800"
							onClick={() => handleSocialShare(platform.key)}
							title={`Compartilhar no ${platform.name}`}
							type="button"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									{(() => {
										const bgClass =
											platform.color
												.split(" ")
												.find((c) => c.startsWith("bg-")) || "bg-gray-500";
										return (
											<div
												className={cn(
													"flex size-7 items-center justify-center rounded-full text-white",
													bgClass
												)}
											>
												<Image
													alt={`${platform.name} icon`}
													className="invert"
													height={16}
													src={platform.icon}
													width={16}
												/>
											</div>
										);
									})()}
									<span className="text-sm">
										{platform.key === "email"
											? "Compartilhar via "
											: "Compartilhar no "}
										{platform.name}
									</span>
								</div>
								<ChevronRight className="size-4 text-muted-foreground" />
							</div>
						</button>
					</li>
				))}

				{showNativeShare && (
					<li>
						<button
							aria-label="Compartilhar via..."
							className="w-full rounded-xl bg-white px-3 py-2 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-transparent dark:hover:bg-zinc-800"
							onClick={handleNativeShare}
							title="Compartilhar via..."
							type="button"
						>
							<div className="flex items-center justify-between">
								<div className="ml-1 flex items-center gap-3">
									<MoreHorizontal className="size-5" />
									<span className="pl-1 text-sm">Compartilhar via...</span>
								</div>
								<ChevronRight className="size-4 text-muted-foreground" />
							</div>
						</button>
					</li>
				)}
			</ul>
		</div>
	);
};

export default ShareListCompact;

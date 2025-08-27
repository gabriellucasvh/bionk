// src/components/ShareSheet.tsx

"use client";

import { SHARING_PLATFORMS } from "@/config/sharing-platforms";
import { cn } from "@/lib/utils";
import { Check, Link, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ShareSheetProps {
	url: string;
	title: string;
}

const ShareSheet = ({ url, title }: ShareSheetProps) => {
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

	// Botões de ação definidos individualmente
	const copyButton = {
		key: "copy",
		name: copied ? "Copiado!" : "Copiar Link",
		icon: copied ? (
			<Check className="size-5 text-green-500" />
		) : (
			<Link className="size-5" />
		),
		action: handleCopyLink,
		color: copied ? "bg-green-100" : "bg-gray-100 hover:bg-gray-200",
	};

	const moreButton = {
		key: "more",
		name: "Compartilhar via...",
		icon: <MoreHorizontal className="size-5" />,
		action: handleNativeShare,
		color: "bg-gray-100 hover:bg-gray-200",
	};

	return (
		<div>
			<h3 className="mb-3 text-left font-medium text-gray-700 text-sm">
				Compartilhar
			</h3>
			<ul className="flex w-full items-center gap-3 overflow-x-auto px-1 pb-3">
				<li className="flex-shrink-0">
					<button
						aria-label={copyButton.name}
						className={cn(
							"flex size-14 items-center justify-center rounded-full transition-colors",
							copyButton.color
						)}
						onClick={copyButton.action}
						title={copyButton.name}
						type="button"
					>
						{copyButton.icon}
					</button>
				</li>

				{SHARING_PLATFORMS.map((platform) => (
					<li className="flex-shrink-0" key={platform.key}>
						<button
							aria-label={`Compartilhar no ${platform.name}`}
							className={cn(
								"flex size-14 items-center justify-center rounded-full text-white transition-colors",
								platform.color
							)}
							onClick={() => handleSocialShare(platform.key)}
							title={platform.name}
							type="button"
						>
							<Image
								alt={`${platform.name} icon`}
								className="invert filter"
								height={24}
								src={platform.icon}
								width={24}
							/>
						</button>
					</li>
				))}

				<li className="flex-shrink-0">
					<button
						aria-label={moreButton.name}
						className={cn(
							"flex size-14 items-center justify-center rounded-full transition-colors",
							moreButton.color
						)}
						onClick={moreButton.action}
						title={moreButton.name}
						type="button"
					>
						{moreButton.icon}
					</button>
				</li>
			</ul>
		</div>
	);
};

export default ShareSheet;

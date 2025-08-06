// src/components/templates/BaseTemplate.tsx
"use client"
import { Share2 } from "lucide-react";
import Image from "next/image";
// Adicione useState e o novo ShareModal
import { useState } from "react";
import InteractiveLink from "@/components/InteractiveLink";
import JoinBionkModal from "@/components/JoinBionkModal";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";
import type { TemplateComponentProps } from "@/types/user-profile";
import ShareModal from "./ShareModal"; // Importe o modal

interface BaseTemplateProps extends TemplateComponentProps {
	classNames?: {
		image?: string;
		name?: string;
		bio?: string;
		wrapper?: string;
		header?: string;
		footer?: string;
		cardLink?: string;
		link?: string;
		theme?: "light" | "dark";
	};
	children?: React.ReactNode;
}

export default function BaseTemplate({
	user,
	classNames,
	children,
}: BaseTemplateProps) {
	// Estado para controlar o modal de compartilhamento
	const [isShareModalOpen, setShareModalOpen] = useState(false);

	return (
		<>
			{" "}
			{/* Use um Fragment para envolver a página e o modal */}
			<div
				className={`min-h-screen py-8 px-4 flex flex-col items-center ${classNames?.wrapper ?? "bg-white"}`}
			>
				<ProfileViewTracker userId={user.id} />

				<main className="max-w-md w-full flex flex-col items-center flex-grow">
					{/* Botão de compartilhar */}
					<div className="w-full flex justify-end mb-4">
						<button
							onClick={() => setShareModalOpen(true)} // Abre o modal
							className="absolute flex items-center justify-center bg-white p-2 border rounded-full shadow hover:bg-gray-100 transition-colors"
							type="button"
							aria-label="Compartilhar perfil"
						>
							<Share2 className="size-6 text-gray-700" />
						</button>
					</div>

					<header
						className={`w-full text-center mb-8 ${classNames?.header ?? ""}`}
					>
						{user.image && (
							<div
								className={`mx-auto mb-4 relative w-24 h-24 overflow-hidden rounded-full border-2 ${classNames?.image ?? ""}`}
							>
								<Image
									src={user.image}
									alt={user.name || user.username}
									fill
									className="object-cover"
								/>
							</div>
						)}
						<h1 className={`text-2xl font-bold ${classNames?.name ?? ""}`}>
							{user.name || user.username}
						</h1>
						{user.bio && (
							<p className={`mt-2 text-sm ${classNames?.bio ?? ""}`}>
								{user.bio}
							</p>
						)}
						{Array.isArray(user.SocialLink) && user.SocialLink.length > 0 && (
							<div className="mt-4 flex justify-center items-center">
								<UserProfileSocialIcons
									socialLinks={user.SocialLink}
									iconSize={22}
									className="space-x-3 sm:space-x-4"
									theme={classNames?.theme}
								/>
							</div>
						)}
					</header>

					<section className="w-full">
						{children ?? (
							<ul className="space-y-3">
								{user.Link.map((link) => (
									<li key={link.id} className="w-full">
										<InteractiveLink
											href={link.url}
											linkId={link.id}
											sensitive={link.sensitive}
											className={
												classNames?.cardLink ??
												"hover:scale-105 transition-all duration-200"
											}
										>
											{link.title}
											<span
												className={`block text-xs ${classNames?.link ?? ""}`}
											>
												{link.url}
											</span>
										</InteractiveLink>
									</li>
								))}
							</ul>
						)}
					</section>
				</main>

				<footer
					className={`max-w-md w-full mt-10 text-sm font-bold text-center ${classNames?.footer ?? ""}`}
				>
					<JoinBionkModal>{user.username}</JoinBionkModal>
				</footer>
			</div>
			{/* Renderização condicional do Modal */}
			{isShareModalOpen && (
				<ShareModal user={user} onClose={() => setShareModalOpen(false)} />
			)}
		</>
	);
}

import Image from "next/image";
import InteractiveLink from "@/components/InteractiveLink";
import JoinBionkModal from "@/components/JoinBionkModal";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import UserProfileSocialIcons from "@/components/profile/UserProfileSocialIcons";
import type { TemplateComponentProps } from "@/types/user-profile";

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
	return (
		<div
			className={`min-h-screen py-8 px-4 flex flex-col ${classNames?.wrapper ?? "bg-white"}`}
		>
			<ProfileViewTracker userId={user.id} />

			<main className="max-w-md mx-auto flex flex-col items-center w-full flex-grow">
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
					<h1
						className={`text-2xl font-bold ${classNames?.name ?? ""}`}
					>
						{user.name || user.username}
					</h1>
					{user.bio && (
						<p
							className={`mt-2 text-sm ${classNames?.bio ?? ""}`}
						>
							{user.bio}
						</p>
					)}
					{user.SocialLink && user.SocialLink.length > 0 && (
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
									>{link.title}
										<span className={`block text-xs ${classNames?.link ?? ""}`}>
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
				className={`max-w-md mx-auto mt-10 text-sm font-bold text-center ${classNames?.footer ?? ""}`}
			>
				<JoinBionkModal>{user.username}</JoinBionkModal>
			</footer>
		</div>
	);
}

"use client";

import { BaseButton } from "@/components/buttons/BaseButton";
import { ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const VerPerfilMobile = () => {
	const { data: session } = useSession();
	const [profileUrl, setProfileUrl] = useState<string>("#");

	const username = session?.user?.username;

	useEffect(() => {
		const baseUrl =
			process.env.NODE_ENV === "production"
				? "https://www.bionk.me"
				: "http://localhost:3000";
		setProfileUrl(username ? `${baseUrl}/${username}` : "#");
	}, [username]);

	return (
		<div>
			<BaseButton
				className="fixed right-5 bottom-20 z-50 justify-center lg:hidden"
				disabled={!username}
				onClick={() => window.open(profileUrl, "_blank")}
				size="sm"
				variant="green"
			>
				<span className="flex items-center gap-2">
					<ExternalLink className="h-4 w-4" />
					Ver meu perfil
				</span>
			</BaseButton>
		</div>
	);
};

export default VerPerfilMobile;

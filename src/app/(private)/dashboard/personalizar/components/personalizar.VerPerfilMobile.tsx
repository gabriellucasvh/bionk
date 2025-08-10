"use client";

import { Button } from "@/components/ui/button";
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
			<Button
				className="fixed right-5 bottom-20 justify-center bg-green-500 px-10 py-3 text-white hover:bg-green-600 hover:text-white lg:hidden"
				disabled={!username}
				onClick={() => window.open(profileUrl, "_blank")}
				size="sm"
			>
				<ExternalLink className="h-4 w-4" />
				Ver meu perfil
			</Button>
		</div>
	);
};

export default VerPerfilMobile;

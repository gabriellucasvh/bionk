"use client";

import "@/app/globals.css";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function IframePreview() {
	const { data: session, status } = useSession();
	const [iframeUrl, setIframeUrl] = useState<string>("");
	const username = session?.user?.username;

	useEffect(() => {
		if (status === "authenticated" && username) {
			const baseUrl =
				process.env.NODE_ENV === "production"
					? "https://www.bionk.me"
					: "http://localhost:3000";

			setIframeUrl(`${baseUrl}/${username}`);
		} else if (status === "authenticated") {
			setIframeUrl("about:blank");
		}
	}, [username, status]);

	return (
		<section className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center p-4 lg:items-end lg:justify-end lg:p-8">
			<div className="pointer-events-auto aspect-[390/844] w-[min(100%,calc(100vh*0.3))] overflow-hidden rounded-4xl border-4 border-black bg-white shadow-lg sm:w-[min(100%,calc(100vh*0.5))] md:w-[min(100%,calc(100vh*0.45))] lg:w-[min(100%,calc(100vh*0.4))] xl:w-[min(100%,calc(100vh*0.43))]">
				<iframe
					className="h-full w-full border-none"
					src={iframeUrl || "about:blank"}
					title="Pré-visualização do perfil"
				/>
			</div>
		</section>
	);
}

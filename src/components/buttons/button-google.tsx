// components/googleBtn.tsx
"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { BaseButton } from "./BaseButton";

export function GoogleBtn() {
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			await signIn("google", {
				callbackUrl: "/studio/perfil",
			});
		} catch {
			setIsLoading(false);
		}
	};

	return (
		<BaseButton
			className="w-full hover:ring-1 hover:ring-black"
			loading={isLoading}
			onClick={handleLogin}
			type="button"
			variant="white"
		>
			<span className="flex items-center gap-2">
				<Image
					alt="Ícone Google"
					height={30}
					src={"/google-icon.png"}
					width={30}
				/>
				Entrar com o Google
			</span>
		</BaseButton>
	);
}

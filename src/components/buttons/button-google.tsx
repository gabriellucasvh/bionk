// components/googleBtn.tsx
"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { BaseButton } from "./BaseButton";

export function GoogleBtn() {
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			await signIn("google", {
				callbackUrl: "/dashboard/perfil",
			});
		} catch (error) {
			console.error("Login error:", error);
			setIsLoading(false);
		}
	};

	return (
		<BaseButton type="button" onClick={handleLogin} loading={isLoading} variant="white" className="w-full">
			<span className="flex items-center gap-2">
				<Image
					src={"/google-icon.png"}
					alt="Ícone Google"
					width={30}
					height={30}
				/>
				Entrar com o Google
			</span>
		</BaseButton>
	);
}

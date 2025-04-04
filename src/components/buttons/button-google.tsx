// components/googleBtn.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import LoadingSpinner from "@/components/buttons/LoadingSpinner";

export function GoogleBtn() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { 
                callbackUrl: "/dashboard/perfil"
            });
        } catch (error) {
            console.error("Login error:", error);
            setIsLoading(false);
        }
    };

    return (
        <button 
            type="button"
            onClick={handleLogin}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 w-full h-12 rounded-md cursor-pointer hover:bg-gray-200 border-2 transition-colors duration-300 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <Image 
                    src={"/google-icon.png"} 
                    alt="Ícone Google" 
                    width={30} 
                    height={30}
                />
            )}
            {isLoading ? "Processando..." : "Entrar com o Google"}
        </button>
    )
}
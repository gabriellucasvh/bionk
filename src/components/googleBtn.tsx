import { signIn } from "next-auth/react";
import Image from "next/image";

export function GoogleBtn() {
    return (
        <button onClick={() => signIn('google', { callbackUrl: "/dashboard/perfil" })} className="flex items-center justify-center gap-2  w-full h-12 rounded-md cursor-pointer hover:bg-gray-200 border-2 transition-colors duration-300">
            <Image src={"/google-icon.png"} alt="Icone google" width={30} height={30} />
            Entrar com o Google
        </button>
    )
}
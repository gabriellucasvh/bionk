import { signIn } from "next-auth/react";
import Image from "next/image";

export function GoogleBtn() {
    return (
        <button onClick={() => signIn('google', { callbackUrl: "/" })} className="flex items-center justify-center gap-2 bg-gray-200 w-full h-10 rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-300">
            <Image src={"/google-icon.png"} alt="Icone google" width={30} height={30} />
            Entrar com o Google
        </button>
    )
}
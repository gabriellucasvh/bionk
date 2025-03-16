"use client"
import NeoButton from "./neo-button";
import { useRouter } from "next/navigation";
export default function NotFoundButton() {
    const route = useRouter()
    return (
    <NeoButton onClick={() => {route.push("/")}}>Voltar para o Menu</NeoButton>
)
}
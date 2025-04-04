"use client"
import NeoButton from "./button-neubrutalism";
import { useRouter } from "next/navigation";
export default function ButtonBack() {
    const route = useRouter()
    return (
    <NeoButton onClick={() => {route.push("/")}}>Voltar para o Menu</NeoButton>
)
}
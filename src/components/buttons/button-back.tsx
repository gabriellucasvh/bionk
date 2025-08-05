"use client";
import { useRouter } from "next/navigation";
import { BaseButton } from "./BaseButton";
export default function ButtonBack() {
	const route = useRouter();
	return (
		<BaseButton
			onClick={() => {
				route.push("/");
			}}
		>
			Voltar para o Menu
		</BaseButton>
	);
}

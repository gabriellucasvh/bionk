import ButtonBack from "@/components/buttons/button-back";
import Image from "next/image";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-white">
			<div className="flex min-h-screen flex-col items-center justify-center space-y-5 px-2">
				<Image alt="error" height={90} src={"/warning.svg"} width={160} />
				<h2 className="font-bold text-5xl">Oops...</h2>
				<p className="text-center">
					Parece que temos algum problema aqui! A página foi movida ou não
					existe mais.
				</p>
				<ButtonBack />
			</div>
		</div>
	);
}

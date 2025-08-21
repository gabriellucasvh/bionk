// src/app/checkout/failure/page.tsx

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutFailurePage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
			<div className="mx-auto max-w-md space-y-6">
				<XCircle className="mx-auto h-16 w-16 text-red-500" />
				<h1 className="font-bold text-3xl">Pagamento não concluído</h1>
				<p className="text-gray-600">
					Houve um problema ao processar seu pagamento. Por favor, tente
					novamente.
				</p>
				<p className="text-gray-600">
					Se o problema persistir, entre em contato com nosso suporte.
				</p>
				<div className="flex flex-col gap-4">
					<Button
						asChild
						className="w-full bg-[#1A3A32] text-white hover:bg-[#2A4C44]"
					>
						<Link href="/planos">Voltar para Planos</Link>
					</Button>
					<Button asChild className="w-full" variant="outline">
						<Link href="/contato">Contatar Suporte</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

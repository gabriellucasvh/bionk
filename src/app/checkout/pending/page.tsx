// src/app/checkout/pending/page.tsx

import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Link from "next/link";

export default function CheckoutPendingPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
			<div className="mx-auto max-w-md space-y-6">
				<Clock className="mx-auto h-16 w-16 text-yellow-500" />
				<h1 className="font-bold text-3xl">Pagamento em Processamento</h1>
				<p className="text-gray-600">
					Seu pagamento está sendo processado. Assim que for confirmado, você
					receberá um email com os detalhes da sua assinatura.
				</p>
				<p className="text-gray-600">
					Este processo pode levar alguns minutos. Você pode fechar esta página
					e continuar navegando.
				</p>
				<div className="flex flex-col gap-4">
					<Button
						asChild
						className="w-full bg-[#1A3A32] text-white hover:bg-[#2A4C44]"
					>
						<Link href="/studio">Voltar para o Studio</Link>
					</Button>
					<Button asChild className="w-full" variant="outline">
						<Link href="/contato">Contatar Suporte</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}

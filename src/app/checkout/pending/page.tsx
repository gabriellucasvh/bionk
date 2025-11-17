// src/app/checkout/pending/page.tsx

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
					<Link
						className="mt-8 block w-full rounded-full bg-bunker-950 py-4 text-white hover:bg-bunker-900"
						href="/studio"
					>
						Ir para o Studio
					</Link>
					<Link
						className="block w-full rounded-full bg-bunker-400 py-4 text-white hover:bg-bunker-500"
						href="/contato"
					>
						Contatar Suporte
					</Link>
				</div>
			</div>
		</div>
	);
}

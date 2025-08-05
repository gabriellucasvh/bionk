import Image from "next/image";
import Link from "next/link";

const navigation = {
	resources: [
		{ name: "Ajuda", href: "/ajuda" },
		{ name: "Descubra", href: "/descubra" },
		{ name: "Templates", href: "/templates" },
		{ name: "Preços", href: "/planos" },
	],
	legal: [
		{ name: "Termos e Condições", href: "/termos" },
		{ name: "Política de Privacidade", href: "/privacidade" },
	],
};

const Footer = () => {
	return (
		<footer className="font-inter w-full mt-auto bg-green-950 px-10 md:px-40 py-10 text-white font-sans">
			<div className="container mx-auto px-6 md:px-12 lg:px-20 py-10 rounded-2xl bg-green-800">
				<h2 id="footer-heading" className="sr-only">
					Footer
				</h2>
				<div className="mx-auto max-w-7xl">
					<div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
						<div className="space-y-6 text-center lg:text-left">
							<div className="inline-block bg-white rounded-lg px-8 py-4">
								<Link href="/">
									<Image
										priority={true}
										unoptimized={true}
										width={100}
										height={40}
										src="/bionk-logo.svg"
										alt="logo"
										className="h-7 w-auto"
									/>
								</Link>
							</div>
							<p className="text-md max-w-xs mx-auto lg:mx-0 leading-6">
								O melhor gerenciador de links para o seu negócio.
							</p>
						</div>
						{/* Navigations */}
						<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-2 lg:gap-14">
							<div>
								<h3 className="text-sm font-semibold leading-6 font-gsans">
									Recursos
								</h3>
								<div className="mt-4 space-y-3">
									{navigation.resources.map((item) => (
										<div key={item.name}>
											<Link
												href={item.href}
												className="text-sm leading-6 hover:text-green-200 transition-colors duration-200"
											>
												{item.name}
											</Link>
										</div>
									))}
								</div>
							</div>
							<div>
								<h3 className="text-sm font-semibold leading-6 font-gsans">
									Legal
								</h3>
								<div className="mt-4 space-y-3">
									{navigation.legal.map((item) => (
										<div key={item.name}>
											<Link
												href={item.href}
												className="text-sm leading-6 hover:text-green-200 transition-colors duration-200"
											>
												{item.name}
											</Link>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
					<div className="mt-10 border-t border-gray-900/10 pt-6 text-center text-xs dark:border-gray-100/10">
						<p>&copy; 2024 Bionk. Todos os direitos reservados.</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;

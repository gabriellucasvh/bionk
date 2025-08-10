import CategoriasTemplates from "./components/personalizar.CategoriasTemplates";

const PersonalizarClient = () => {
	return (
		<div className="min-h-screen w-full bg-white font-gsans text-black lg:w-7/12">
			<section className="flex min-h-screen flex-col gap-10 px-6 py-16">
				<section>
					<h2 className="mb-4 hidden font-bold text-lg md:text-2xl lg:block">
						Templates:
					</h2>
					<CategoriasTemplates />
				</section>
			</section>
		</div>
	);
};

export default PersonalizarClient;

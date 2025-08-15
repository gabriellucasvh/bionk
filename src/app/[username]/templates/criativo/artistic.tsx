import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function ArtisticTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper:
					"min-h-screen bg-[#f5f0e8] py-8 px-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzAgMEMxMy40IDAgMCAxMy40IDAgMzBzMTMuNCAzMCAzMCAzMCA0My40LTEzLjQgNDMuNC0zMFM0Ni42IDAgMzAgMHptMCA1MmMtMTIuMiAwLTIyLTkuOC0yMi0yMnM5LjgtMjIgMjItMjIgMjIgOS44IDIyIDIyLTkuOCAyMi0yMiAyMnoiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')] flex flex-col",
				image:
					"relative w-28 h-28 overflow-hidden rounded-full border-4 border-[#f5f0e8] sepia-[0.2]",
				name: "text-2xl font-serif italic text-[#6d4c41]",
				bio: "mt-2 text-[#8d6e63] font-serif max-w-xs mx-auto leading-relaxed",
				cardLink:
					"relative block w-full p-4 bg-[#f5f0e8] rounded-lg border border-[#d7bea8] transform-gpu transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1",
				link: "block text-sm text-[#8d6e63] font-serif",
				footer:
					"max-w-md mx-auto mt-12 relative w-full text-center font-serif text-[#8d6e63] text-sm italic",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
			// children para as decorações e detalhes extras do header/footer podem ser implementados aqui se desejar.
		/>
	);
}

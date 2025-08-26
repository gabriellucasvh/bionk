import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function ArtisticTemplate({ user }: TemplateComponentProps) {
	return (
		<BaseTemplate
			classNames={{
				theme: "light",
				wrapper:
					"bg-[#f5f0e8] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzAgMEMxMy40IDAgMCAxMy40IDAgMzBzMTMuNCAzMCAzMCAzMCA0My40LTEzLjQgNDMuNC0zMFM0Ni42IDAgMzAgMHptMCA1MmMtMTIuMiAwLTIyLTkuOC0yMi0yMnM5LjgtMjIgMjItMjIgMjIgOS44IDIyIDIyLTkuOCAyMi0yMiAyMnoiIGZpbGw9IiMzMzMiLz48L3N2Zz4=')]",
				image:
					"border-4 border-[#f5f0e8]",
				name: "text-[#6d4c41]",
				bio: "text-[#8d6e63]",
				cardLink:
					"bg-[#f5f0e8] border border-[#d7bea8]",
				link: "text-[#8d6e63]",
				footer:
					"text-[#8d6e63]",
			}}
			customPresets={user.CustomPresets || undefined}
			user={user}
		/>
	);
}

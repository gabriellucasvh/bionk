export const SOLID_COLORS = [
	"#FFFFFF",
	"#000000",
	"#3B82F6",
	"#10B981",
	"#F59E0B",
	"#EF4444",
];

export const GRADIENTS = [
	// Gradientes Claros Profissionais
	"linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
	"linear-gradient(135deg, #ffecd2 0%, #fcb69f 25%, #ff8a80 75%, #ff5722 100%)",
	"linear-gradient(135deg, #a8edea 0%, #fed6e3 25%, #d299c2 75%, #fef9d7 100%)",
	"linear-gradient(135deg, #d9a7c7 0%, #fffcdc 25%, #c2e9fb 50%, #a1c4fd 100%)",
	// Gradientes Escuros Sofisticados
	"linear-gradient(135deg, #0c0c0c 0%, #2c3e50 25%, #34495e 75%, #1a252f 100%)",
	"linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 100%)",
	"linear-gradient(135deg, #8360c3 0%, #2ebf91 25%, #8360c3 50%, #2ebf91 100%)",
	"linear-gradient(135deg, #0f0c29 0%, #302b63 25%, #24243e 50%, #0f0c29 100%)",
];

export const FONT_OPTIONS = [
	{ value: "font-sans", label: "Satoshi", fontFamily: "var(--font-sans)" },
	{ value: "font-inter", label: "Inter", fontFamily: "var(--font-inter)" },
	{
		value: "font-montserrat",
		label: "Montserrat",
		fontFamily: "var(--font-montserrat)",
	},
	{
		value: "font-poppins",
		label: "Poppins",
		fontFamily: "var(--font-poppins)",
	},
	{ value: "font-nunito", label: "Nunito", fontFamily: "var(--font-nunito)" },
	{
		value: "font-playfair-display",
		label: "Playfair Display",
		fontFamily: "var(--font-playfair-display)",
	},
	{
		value: "font-merriweather",
		label: "Merriweather",
		fontFamily: "var(--font-merriweather)",
	},
	{
		value: "font-dancing-script",
		label: "Dancing Script",
		fontFamily: "var(--font-dancing-script)",
	},
	{
		value: "font-dm-serif-display",
		label: "DM Serif Display",
		fontFamily: "var(--font-dm-serif-display)",
	},
	{
		value: "font-orbitron",
		label: "Orbitron",
		fontFamily: "var(--font-orbitron)",
	},
	{
		value: "font-plus-jakarta-sans",
		label: "Plus Jakarta Sans",
		fontFamily: "var(--font-plus-jakarta-sans)",
	},
	{ value: "font-outfit", label: "Outfit", fontFamily: "var(--font-outfit)" },
	{
		value: "font-space-grotesk",
		label: "Space Grotesk",
		fontFamily: "var(--font-space-grotesk)",
	},
	{
		value: "font-libre-baskerville",
		label: "Libre Baskerville",
		fontFamily: "var(--font-libre-baskerville)",
	},
	{
		value: "font-alegreya",
		label: "Alegreya",
		fontFamily: "var(--font-alegreya)",
	},
	{
		value: "font-spectral",
		label: "Spectral",
		fontFamily: "var(--font-spectral)",
	},
	{
		value: "font-urbanist",
		label: "Urbanist",
		fontFamily: "var(--font-urbanist)",
	},
	{ value: "font-karla", label: "Karla", fontFamily: "var(--font-karla)" },
	{
		value: "font-public-sans",
		label: "Public Sans",
		fontFamily: "var(--font-public-sans)",
	},
	{
		value: "font-atkinson-hyperlegible",
		label: "Atkinson Hyperlegible",
		fontFamily: "var(--font-atkinson-hyperlegible)",
	},
	{
		value: "font-fira-sans",
		label: "Fira Sans",
		fontFamily: "var(--font-fira-sans)",
	},
	{ value: "font-mulish", label: "Mulish", fontFamily: "var(--font-mulish)" },
];

export const BUTTON_STYLES = [
	{
		value: "solid",
		label: "Sólido",
		preview: "bg-neutral-500 text-white border-none",
	},
	{
		value: "outline",
		label: "Contorno",
		preview:
			"bg-transparent text-neutral-700 dark:text-white border-neutral-500 border-2",
	},
	{
		value: "soft",
		label: "Suave",
		preview: "bg-neutral-100 text-neutral-700 border-neutral-200",
	},
	{
		value: "shadow",
		label: "Sombra",
		preview:
			"bg-neutral-100 text-neutral-700 border-neutral-300 shadow-lg dark:shadow-white/20",
	},
	{
		value: "neon",
		label: "Neon",
		preview:
			"bg-transparent text-neutral-700 dark:text-white border-neutral-500 border-2 shadow-[0_0_8px_rgba(0,0,0,0.3)]",
	},
	{
		value: "dashed",
		label: "Tracejado",
		preview:
			"bg-transparent text-neutral-700 dark:text-white border-neutral-500 border-2 border-dashed",
	},
	{
		value: "double",
		label: "Dupla",
		preview:
			"bg-transparent text-neutral-700 dark:text-white border-neutral-600 border-4 border-double",
	},
	{
		value: "raised",
		label: "Elevado",
		preview:
			"bg-neutral-200 text-neutral-700 border-neutral-400 border-t-2 border-l-2 border-r border-b shadow-inner",
	},
	{
		value: "inset",
		label: "Interno",
		preview:
			"bg-neutral-200 text-neutral-700 border-neutral-400 border-b-2 border-r-2 border-t border-l shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]",
	},
];

export const HEADER_STYLES = [
	{
		value: "default",
		label: "Padrão",
	},
	{
		value: "horizontal",
		label: "Horizontal",
	},
	{
		value: "hero",
		label: "Hero",
	},
];

export const FIELD_TO_PICKER: Record<
	string,
	"background" | "text" | "button" | "buttonText"
> = {
	customBackgroundColor: "background",
	customTextColor: "text",
	customButtonColor: "button",
	customButtonTextColor: "buttonText",
};
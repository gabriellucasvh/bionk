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
	{ value: "font-sans", label: "Onest", fontFamily: "var(--font-sans)" },
	{ value: "font-inter", label: "Inter", fontFamily: "'Inter', sans-serif" },
	{
		value: "font-montserrat",
		label: "Montserrat",
		fontFamily: "'Montserrat', sans-serif",
	},
	{
		value: "font-poppins",
		label: "Poppins",
		fontFamily: "'Poppins', sans-serif",
	},
	{ value: "font-nunito", label: "Nunito", fontFamily: "'Nunito', sans-serif" },
	{
		value: "font-playfair-display",
		label: "Playfair Display",
		fontFamily: "'Playfair Display', serif",
	},
	{
		value: "font-merriweather",
		label: "Merriweather",
		fontFamily: "'Merriweather', serif",
	},
	{
		value: "font-dancing-script",
		label: "Dancing Script",
		fontFamily: "'Dancing Script', cursive",
	},
	{
		value: "font-dm-serif-display",
		label: "DM Serif Display",
		fontFamily: "'DM Serif Display', serif",
	},
	{
		value: "font-orbitron",
		label: "Orbitron",
		fontFamily: "'Orbitron', sans-serif",
	},
	{
		value: "font-plus-jakarta-sans",
		label: "Plus Jakarta Sans",
		fontFamily: "'Plus Jakarta Sans', sans-serif",
	},
	{ value: "font-outfit", label: "Outfit", fontFamily: "'Outfit', sans-serif" },
	{
		value: "font-space-grotesk",
		label: "Space Grotesk",
		fontFamily: "'Space Grotesk', sans-serif",
	},
	{
		value: "font-libre-baskerville",
		label: "Libre Baskerville",
		fontFamily: "'Libre Baskerville', serif",
	},
	{
		value: "font-alegreya",
		label: "Alegreya",
		fontFamily: "'Alegreya', serif",
	},
	{
		value: "font-spectral",
		label: "Spectral",
		fontFamily: "'Spectral', serif",
	},
	{
		value: "font-urbanist",
		label: "Urbanist",
		fontFamily: "'Urbanist', sans-serif",
	},
	{ value: "font-karla", label: "Karla", fontFamily: "'Karla', sans-serif" },
	{
		value: "font-public-sans",
		label: "Public Sans",
		fontFamily: "'Public Sans', sans-serif",
	},
	{
		value: "font-atkinson-hyperlegible",
		label: "Atkinson Hyperlegible",
		fontFamily: "'Atkinson Hyperlegible', sans-serif",
	},
	{
		value: "font-fira-sans",
		label: "Fira Sans",
		fontFamily: "'Fira Sans', sans-serif",
	},
	{ value: "font-mulish", label: "Mulish", fontFamily: "'Mulish', sans-serif" },
];

export const BUTTON_STYLES = [
	{
		value: "solid",
		label: "Sólido",
		preview: "bg-zinc-500 text-white border-none",
	},
	{
		value: "outline",
		label: "Contorno",
		preview:
			"bg-transparent text-zinc-700 dark:text-white border-zinc-500 border-2",
	},
	{
		value: "soft",
		label: "Suave",
		preview: "bg-zinc-100 text-zinc-700 border-zinc-200",
	},
	{
		value: "shadow",
		label: "Sombra",
		preview:
			"bg-zinc-100 text-zinc-700 border-zinc-300 shadow-lg dark:shadow-white/20",
	},
	{
		value: "neon",
		label: "Neon",
		preview:
			"bg-transparent text-zinc-700 dark:text-white border-zinc-500 border-2 shadow-[0_0_8px_rgba(0,0,0,0.3)]",
	},
	{
		value: "dashed",
		label: "Tracejado",
		preview:
			"bg-transparent text-zinc-700 dark:text-white border-zinc-500 border-2 border-dashed",
	},
	{
		value: "double",
		label: "Dupla",
		preview:
			"bg-transparent text-zinc-700 dark:text-white border-zinc-600 border-4 border-double",
	},
	{
		value: "raised",
		label: "Elevado",
		preview:
			"bg-zinc-200 text-zinc-700 border-zinc-400 border-t-2 border-l-2 border-r border-b shadow-inner",
	},
	{
		value: "inset",
		label: "Interno",
		preview:
			"bg-zinc-200 text-zinc-700 border-zinc-400 border-b-2 border-r-2 border-t border-l shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]",
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

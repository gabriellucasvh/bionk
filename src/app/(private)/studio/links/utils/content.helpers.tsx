import {
	Calendar,
	FileText,
	GalleryHorizontal,
	GalleryVertical,
	Heart,
	ImageIcon,
	Layers2,
	Link,
	Mail,
	Music,
	Play,
	ShoppingCart,
	Type,
	Users,
	Video,
	Zap,
} from "lucide-react";
import Image from "next/image";
import type {
	ContentCategory,
	ContentFormData,
	ContentType,
	ImageContentType,
	IntegrationType,
	MusicPlatform,
	QuickAddItem,
	SocialFeedPlatform,
} from "../types/content.types";

// Icon components
const InstagramIcon = ({ className }: { className?: string }) => (
	<Image
		alt="Instagram"
		className={`brightness-0 invert filter ${className || ""}`}
		height={24}
		src="/icons/instagram.svg"
		width={24}
	/>
);

const TikTokIcon = ({ className }: { className?: string }) => (
	<Image
		alt="TikTok"
		className={`brightness-0 invert filter ${className || ""}`}
		height={24}
		src="/icons/tiktok.svg"
		width={24}
	/>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
	<Image
		alt="YouTube"
		className={`brightness-0 invert filter ${className || ""}`}
		height={24}
		src="/icons/youtube.svg"
		width={24}
	/>
);

const SpotifyIcon = ({ className }: { className?: string }) => (
	<Image
		alt="Spotify"
		className={`brightness-0 invert filter ${className || ""}`}
		height={24}
		src="/icons/spotify.svg"
		width={24}
	/>
);

const TwitterIcon = ({ className }: { className?: string }) => (
	<Image
		alt="X (Twitter)"
		className={`brightness-0 invert filter ${className || ""}`}
		height={24}
		src="/icons/x.svg"
		width={24}
	/>
);

export const getQuickAddItems = (): QuickAddItem[] => [
	{
		type: "link",
		name: "Links",
		icon: Link,
		color: "bg-green-500",
		description: "Adicione links para sites, páginas ou recursos",
	},
	{
		type: "section",
		name: "Seção",
		icon: Layers2,
		color: "bg-blue-500",
		description: "Organize seus links em seções",
	},
	{
		type: "video",
		name: "Vídeos",
		icon: Video,
		color: "bg-red-500",
		description: "Compartilhe vídeos do YouTube, Vimeo e mais",
	},
	{
		type: "image",
		name: "Imagens",
		icon: ImageIcon,
		color: "bg-purple-500",
		description: "Adicione fotos, galerias ou carrosséis",
	},
	{
		type: "contact-form",
		name: "Formulário",
		icon: Mail,
		color: "bg-yellow-500",
		description: "Crie formulários de contato personalizados",
	},
];

export const getContentCategories = (): ContentCategory[] => [
	{
		id: "suggested",
		name: "Sugerido",
		icon: Heart,
		description: "Opções recomendadas para você",
	},
	{
		id: "commerce",
		name: "Comércio",
		icon: ShoppingCart,
		description: "Vendas e produtos",
	},
	{
		id: "social",
		name: "Social",
		icon: Users,
		description: "Redes sociais e feeds",
	},
	{
		id: "media",
		name: "Mídia",
		icon: Play,
		description: "Vídeos, música e imagens",
	},
	{
		id: "contact",
		name: "Contato",
		icon: Mail,
		description: "Formulários e informações de contato",
	},
	{
		id: "events",
		name: "Eventos",
		icon: Calendar,
		description: "Calendários e eventos",
	},
	{
		id: "text",
		name: "Texto",
		icon: FileText,
		description: "Conteúdo textual e documentos",
	},
	{
		id: "integrations",
		name: "Integrações",
		icon: Zap,
		description: "Conecte com outras plataformas",
	},
];

export const getCategoryItems = (categoryId: string): QuickAddItem[] => {
	const itemsByCategory: Record<string, QuickAddItem[]> = {
		suggested: [
			{
				type: "social-feed",
				name: "Instagram",
				icon: InstagramIcon,
				color: "bg-gradient-to-r from-purple-500 to-pink-500 rounded-full",
				description: "Exiba seus posts e reels",
			},
			{
				type: "social-feed",
				name: "TikTok",
				icon: TikTokIcon,
				color: "bg-black rounded-full",
				description: "Compartilhe seus TikToks",
			},
			{
				type: "music",
				name: "YouTube",
				icon: YouTubeIcon,
				color: "bg-red-600 rounded-full",
				description: "Compartilhe vídeos do YouTube",
			},
			{
				type: "music",
				name: "Spotify",
				icon: SpotifyIcon,
				color: "bg-green-600 rounded-full",
				description: "Compartilhe suas músicas favoritas",
			},
		],
		commerce: [
			{
				type: "link",
				name: "Produto",
				icon: ShoppingCart,
				color: "bg-blue-600 rounded-full",
				description: "Link para produto ou loja",
			},
			{
				type: "integration",
				name: "Pagamento",
				icon: ShoppingCart,
				color: "bg-green-600 rounded-full",
				description: "Integração com sistemas de pagamento",
			},
		],
		social: [
			{
				type: "social-feed",
				name: "Instagram",
				icon: InstagramIcon,
				color: "bg-gradient-to-r from-purple-500 to-pink-500 rounded-full",
				description: "Exiba seus posts e reels",
			},
			{
				type: "social-feed",
				name: "Twitter",
				icon: TwitterIcon,
				color: "bg-blue-500 rounded-full",
				description: "Compartilhe seus tweets",
			},
			{
				type: "social-feed",
				name: "TikTok",
				icon: TikTokIcon,
				color: "bg-black rounded-full",
				description: "Compartilhe seus TikToks",
			},
		],
		media: [
			{
				type: "image",
				name: "Imagem Individual",
				icon: ImageIcon,
				color: "bg-purple-500 rounded-full",
				description: "Adicione uma única imagem",
			},
			{
				type: "image",
				name: "Carrossel",
				icon: GalleryHorizontal,
				color: "bg-purple-600 rounded-full",
				description: "Galeria de imagens em carrossel",
			},
			{
				type: "image",
				name: "Colunas",
				icon: GalleryVertical,
				color: "bg-purple-700 rounded-full",
				description: "Imagens organizadas em colunas",
			},
			{
				type: "video",
				name: "Vídeo",
				icon: Video,
				color: "bg-red-500 rounded-full",
				description: "Incorpore vídeos",
			},
			{
				type: "music",
				name: "Música",
				icon: Music,
				color: "bg-green-500 rounded-full",
				description: "Compartilhe músicas",
			},
		],
		contact: [
			{
				type: "contact-form",
				name: "Formulário",
				icon: Mail,
				color: "bg-yellow-500 rounded-full",
				description: "Formulário de contato",
			},
			{
				type: "link",
				name: "Email",
				icon: Mail,
				color: "bg-blue-500 rounded-full",
				description: "Link direto para email",
			},
		],
		events: [
			{
				type: "integration",
				name: "Calendário",
				icon: Calendar,
				color: "bg-indigo-500 rounded-full",
				description: "Integração com calendário",
			},
		],
		text: [
			{
				type: "text",
				name: "Texto",
				icon: Type,
				color: "bg-gray-600 rounded-full",
				description: "Bloco de texto",
			},
		],
		integrations: [
			{
				type: "integration",
				name: "Personalizada",
				icon: Zap,
				color: "bg-orange-500 rounded-full",
				description: "Integração personalizada",
			},
		],
	};

	return itemsByCategory[categoryId] || [];
};

export const isValidUrl = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

export const detectUrlFromText = (text: string): string | null => {
	const urlRegex = /(https?:\/\/[^\s]+)/g;
	const match = text.match(urlRegex);
	return match ? match[0] : null;
};

export const getDefaultFormData = (type?: ContentType): ContentFormData => {
	switch (type) {
		case "link":
			return {
				title: "",
				url: "",
			};
		case "section":
			return {
				title: "",
			};
		case "image":
			return {
				title: "",
				imageType: "individual" as ImageContentType,
				images: [],
				imageUrls: [],
			};
		case "video":
			return {
				videoTitle: "",
				videoUrl: "",
			};
		case "music":
			return {
				musicTitle: "",
				musicUrl: "",
				musicPlatform: "spotify" as MusicPlatform,
			};
		case "text":
			return {
				title: "",
				textContent: "",
				textFormatting: "plain" as const,
			};
		case "social-feed":
			return {
				title: "",
				socialPlatform: "instagram" as SocialFeedPlatform,
				socialUsername: "",
				feedLimit: 10,
			};
		case "contact-form":
			return {
				formTitle: "",
				formFields: [],
			};
		case "integration":
			return {
				title: "",
				integrationType: "custom" as IntegrationType,
				integrationConfig: {},
			};
		default:
			return {
				title: "",
			};
	}
};

export const validateFormData = (
	type: ContentType,
	data: ContentFormData
): boolean => {
	switch (type) {
		case "link":
			return !!(data.title && data.url);
		case "section":
			return !!data.title;
		case "image":
			return !!(data.images?.length || data.imageUrls?.length);
		case "video":
			return !!data.videoUrl;
		case "music":
			return !!(data.musicTitle && data.musicUrl);
		case "text":
			return !!(data.title || data.textContent);
		case "social-feed":
			return !!(data.socialPlatform && data.socialUsername);
		case "contact-form":
			return !!data.formTitle;
		case "integration":
			return !!data.integrationType;
		default:
			return false;
	}
};

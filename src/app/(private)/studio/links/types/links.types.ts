// src/app/(private)/studio/links/types/links.types.ts
export type LinkItem = {
	id: number;
	title: string;
	url: string | null;
	active: boolean;
	clicks: number;
	sensitive: boolean;
	order: number;
	isEditing?: boolean;
	isDraft?: boolean;
	archived?: boolean;
	sectionId?: number | null; // ID da seção à qual o link pertence
	badge?: string | null;
	password?: string | null;
	expiresAt?: string | null;
	deleteOnClicks?: number | null;
	launchesAt?: string | null;
	customImageUrl?: string | null;
	shareAllowed?: boolean; // Permitir compartilhamento quando expiração/cliques ativos
	// Novas propriedades para unificação com seções
	isSection?: boolean; // Indica se este item é uma seção
	isText?: boolean; // Indica se este item é um texto
	isVideo?: boolean; // Indica se este item é um vídeo
	children?: LinkItem[]; // Links filhos quando é uma seção
	dbId?: number; // ID do banco para seções
};

export type SectionItem = {
	id: string; // Ex: 'section-promocao'
	dbId: number; // O ID numérico real do banco de dados
	title: string;
	active: boolean;
	order: number;
	links: LinkItem[];
};

export type TextItem = {
	id: number;
	title: string;
	description: string;
	position: "left" | "center" | "right";
	hasBackground: boolean;
	isCompact: boolean;
	active: boolean;
	order: number;
	userId: number;
	isEditing?: boolean;
	isDraft?: boolean;
	archived?: boolean;
	sectionId?: number | null;
	// Propriedades para unificação
	isText?: boolean;
	isVideo?: boolean; // Adicionando para compatibilidade
	isSection?: boolean; // Adicionando para compatibilidade
	children?: never;
	dbId?: number;
};

export type VideoItem = {
	id: number;
	title: string | null;
	description: string | null;
	url: string;
	type: "direct" | "youtube" | "vimeo" | "tiktok" | "twitch";
	active: boolean;
	order: number;
	userId: number;
	isEditing?: boolean;
	isDraft?: boolean;
	archived?: boolean;
	sectionId?: number | null;
	// Propriedades para unificação
	isVideo?: boolean;
	isSection?: boolean;
	isText?: boolean;
	children?: never;
	dbId?: number;
};

export type ImageItem = {
	id: number;
	title: string | null;
	description: string | null;
	layout: "single" | "column" | "carousel";
	ratio: string; // ex.: "square", "16:9", etc
	sizePercent: number; // 50 - 120
	items: Array<{
		url: string;
		previewUrl?: string | null;
		provider?: string | null;
		authorName?: string | null;
		authorLink?: string | null;
		sourceLink?: string | null;
		linkUrl?: string | null; // link opcional por imagem
		clicks?: number; // contagem de cliques por imagem
	}>;
	active: boolean;
	order: number;
	userId: number;
	isEditing?: boolean;
	isDraft?: boolean;
	archived?: boolean;
	sectionId?: number | null;
	// Propriedades para unificação
	isImage?: boolean;
	isSection?: boolean;
	isText?: boolean;
	isVideo?: boolean;
	children?: never;
	dbId?: number;
};

export type MusicItem = {
	id: number;
	title: string;
	url: string;
	usePreview: boolean;
	active: boolean;
	order: number;
	userId: number;
	isEditing?: boolean;
	isDraft?: boolean;
	archived?: boolean;
	sectionId?: number | null;
	// Propriedades para unificação
	isMusic?: boolean;
	isSection?: boolean;
	isText?: boolean;
	isVideo?: boolean;
	children?: never;
	dbId?: number;
};

// Tipo unificado para drag and drop
export type EventItem = {
	id: number;
	title: string;
	location: string;
	eventDate: string;
	eventTime: string;
	descriptionShort?: string | null;
	externalLink: string;
	coverImageUrl?: string | null;
	active: boolean;
	order: number;
	userId?: number;
	type?: string;
	targetMonth?: number | null;
	targetDay?: number | null;
	countdownLinkUrl?: string | null;
	countdownLinkVisibility?: "after" | "during" | null;
	isEditing?: boolean;
	isDraft?: boolean;
	sectionId?: number | null;
	isEvent?: boolean;
	isSection?: boolean;
	isText?: boolean;
	isVideo?: boolean;
	isImage?: boolean;
	isMusic?: boolean;
	children?: never;
	dbId?: number;
};

export type UnifiedDragItem =
	| LinkItem
	| TextItem
	| VideoItem
	| ImageItem
	| MusicItem
	| EventItem;

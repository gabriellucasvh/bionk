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
	archived?: boolean;
	sectionId?: number | null; // ID da seção à qual o link pertence
	badge?: "promovido" | "15% off" | "expirando" | null;
	password?: string | null;
	expiresAt?: string | null;
	deleteOnClicks?: number | null;
	launchesAt?: string | null;
	customImageUrl?: string | null;
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
	active: boolean;
	order: number;
	userId: number;
	isEditing?: boolean;
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
	archived?: boolean;
	sectionId?: number | null;
	// Propriedades para unificação
	isVideo?: boolean;
	isSection?: boolean;
	isText?: boolean;
	children?: never;
	dbId?: number;
};

// Tipo unificado para drag and drop
export type UnifiedDragItem = LinkItem | TextItem | VideoItem;

export type LinkItem = {
	id: number;
	title: string;
	url: string;
	active: boolean;
	clicks: number;
	sensitive: boolean;
	order: number;
	isEditing?: boolean;
	archived?: boolean;
	sectionId?: number | null;
	sectionTitle?: string | null; // Permitir nulo para links gerais
	badge?: "promovido" | "15% off" | "expirando" | null;
	password?: string | null;
	expiresAt?: string | null;
	deleteOnClicks?: number | null;
	launchesAt?: string | null;
};

export type SectionItem = {
	id: string; // Ex: 'section-promocao'
	title: string;
	active: boolean;
	order: number;
	links: LinkItem[];
};

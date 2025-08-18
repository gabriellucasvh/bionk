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

	// Novas funcionalidades
	sectionTitle?: string;
	badge?: "promovido" | "15% off" | "expirando" | null;
	password?: string | null;
	expiresAt?: string | null; // Data e hora para expiração
	deleteOnClicks?: number | null;
	launchesAt?: string | null; // Data e hora para o lançamento

	// Link-shop
	isProduct?: boolean;
	price?: number | null;
	productImageUrl?: string | null;

};

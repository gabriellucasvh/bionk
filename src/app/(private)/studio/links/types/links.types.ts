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
	sectionTitle?: string;
	badge?: "promovido" | "15% off" | "expirando" | null;
	password?: string | null;
	expiresAt?: string | null;
	deleteOnClicks?: number | null;
	launchesAt?: string | null;
};

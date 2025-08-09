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
};

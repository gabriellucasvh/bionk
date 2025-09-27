import { create } from "zustand";
import type { SocialLinkItem } from "@/types/social";

export interface UserData {
	id: string;
	name: string;
	bio: string;
	username: string;
	image: string;
	links: SocialLinkItem[];
	texts: Array<{
		id: string;
		content: string;
		order: number;
	}>;
	videos: Array<{
		id: string;
		title: string;
		description: string;
		url: string;
		order: number;
	}>;
}

export interface Customizations {
	customBackgroundColor: string;
	customBackgroundGradient: string;
	customTextColor: string;
	customFont: string;
	customButtonColor: string;
	customButtonTextColor: string;
	customButtonStyle: string;
	customButtonFill: string;
	customButtonCorners: string;
	headerStyle: string;
}

interface DesignStore {
	// Estado atual (local)
	userData: UserData | null;
	customizations: Customizations;

	// Estado original (do banco)
	originalUserData: UserData | null;
	originalCustomizations: Customizations;

	// Estados de controle
	isLoading: boolean;
	isSaving: boolean;
	hasUnsavedChanges: boolean;

	// Ações para dados do usuário
	setUserData: (userData: UserData) => void;
	updateUserField: (field: keyof UserData, value: any) => void;

	// Ações para customizações
	setCustomizations: (customizations: Customizations) => void;
	updateCustomization: (field: keyof Customizations, value: string) => void;

	// Ações de controle
	setLoading: (loading: boolean) => void;
	setSaving: (saving: boolean) => void;

	// Ações de persistência
	loadInitialData: (userData: UserData, customizations: Customizations) => void;
	saveChanges: () => Promise<void>;
	discardChanges: () => void;

	// Verificadores
	checkUnsavedChanges: () => void;
}

const defaultCustomizations: Customizations = {
	customBackgroundColor: "",
	customBackgroundGradient: "",
	customTextColor: "",
	customFont: "",
	customButtonColor: "",
	customButtonTextColor: "",
	customButtonStyle: "",
	customButtonFill: "",
	customButtonCorners: "",
	headerStyle: "default",
};

export const useDesignStore = create<DesignStore>((set, get) => ({
	// Estado inicial
	userData: null,
	customizations: defaultCustomizations,
	originalUserData: null,
	originalCustomizations: defaultCustomizations,
	isLoading: false,
	isSaving: false,
	hasUnsavedChanges: false,

	// Ações para dados do usuário
	setUserData: (userData) => {
		set({ userData });
		get().checkUnsavedChanges();
	},

	updateUserField: (field, value) => {
		const { userData } = get();
		if (!userData) {
			return;
		}

		set({
			userData: {
				...userData,
				[field]: value,
			},
		});
		get().checkUnsavedChanges();
	},

	// Ações para customizações
	setCustomizations: (customizations) => {
		set({ customizations });
		get().checkUnsavedChanges();
	},

	updateCustomization: (field, value) => {
		const { customizations } = get();
		set({
			customizations: {
				...customizations,
				[field]: value,
			},
		});
		get().checkUnsavedChanges();
	},

	// Ações de controle
	setLoading: (loading) => {
		set({ isLoading: loading });
	},

	setSaving: (saving) => {
		set({ isSaving: saving });
	},

	// Carregamento inicial
	loadInitialData: (userData, customizations) => {
		set({
			userData,
			customizations: { ...defaultCustomizations, ...customizations },
			originalUserData: userData,
			originalCustomizations: { ...defaultCustomizations, ...customizations },
			hasUnsavedChanges: false,
		});
	},

	// Salvar mudanças
	saveChanges: async () => {
		const { userData, customizations } = get();
		if (!userData) {
			return;
		}

		set({ isSaving: true });

		try {
			// Salvar dados do usuário
			const userResponse = await fetch(`/api/profile/${userData.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: userData.name,
					bio: userData.bio,
					username: userData.username,
				}),
			});

			if (!userResponse.ok) {
				throw new Error("Erro ao salvar dados do usuário");
			}

			// Salvar customizações
			const customResponse = await fetch("/api/update-customizations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(customizations),
			});

			if (!customResponse.ok) {
				throw new Error("Erro ao salvar customizações");
			}

			// Atualizar estado original
			set({
				originalUserData: structuredClone(userData),
				originalCustomizations: structuredClone(customizations),
				hasUnsavedChanges: false,
				isSaving: false,
			});
		} catch (error) {
			console.error("Erro ao salvar:", error);
			set({ isSaving: false });
		}
	},

	// Descartar mudanças
	discardChanges: () => {
		const { originalUserData, originalCustomizations } = get();
		set({
			userData: originalUserData,
			customizations: originalCustomizations,
			hasUnsavedChanges: false,
		});
	},

	// Verificar mudanças não salvas
	checkUnsavedChanges: () => {
		const {
			userData,
			customizations,
			originalUserData,
			originalCustomizations,
		} = get();

		if (!(userData && originalUserData)) {
			set({ hasUnsavedChanges: false });
			return;
		}

		// Verificar mudanças nos dados do usuário
		const userDataChanged =
			userData.name !== originalUserData.name ||
			userData.username !== originalUserData.username ||
			userData.bio !== originalUserData.bio ||
			userData.image !== originalUserData.image;

		// Verificar mudanças nas customizações
		const customizationsChanged =
			JSON.stringify(customizations) !== JSON.stringify(originalCustomizations);

		set({ hasUnsavedChanges: userDataChanged || customizationsChanged });
	},
}));

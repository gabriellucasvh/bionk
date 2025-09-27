"use client";

import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface UseDesignFormProps {
	userCustomizations: Record<string, string>;
	onSave: (changes: Partial<Record<string, string>>) => Promise<void>;
}

export function useDesignForm({
	userCustomizations,
	onSave,
}: UseDesignFormProps) {
	const [customizations, setCustomizations] = useState(userCustomizations);
	const [activeColorPicker, setActiveColorPicker] = useState<
		"background" | "text" | "button" | "buttonText" | null
	>(null);
	const [isFontModalOpen, setIsFontModalOpen] = useState(false);
	const [pendingChanges, setPendingChanges] = useState<
		Partial<typeof customizations>
	>({});
	const [isSaving, setIsSaving] = useState(false);
	const [isExiting, setIsExiting] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setCustomizations(userCustomizations);
		setPendingChanges({});
	}, [userCustomizations]);

	const updateCustomizations = (
		field: keyof typeof customizations,
		value: string,
		setCustomizationsFn: React.Dispatch<
			React.SetStateAction<Record<string, string>>
		>
	) => {
		setCustomizationsFn((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const updatePendingChanges = (
		field: keyof typeof customizations,
		value: string,
		originalCustomizations: Record<string, string>,
		setPendingChangesFn: React.Dispatch<
			React.SetStateAction<Partial<Record<string, string>>>
		>
	) => {
		setPendingChangesFn((prev) => {
			const newChanges = { ...prev };
			if (originalCustomizations[field] !== value) {
				newChanges[field] = value;
			} else {
				delete newChanges[field];
			}
			return newChanges;
		});
	};

	const checkPendingChange = (
		field: keyof typeof customizations,
		currentPendingChanges: Partial<Record<string, string>>,
		currentCustomizations: Record<string, string>,
		originalCustomizations: Record<string, string>
	) => {
		return (
			field in currentPendingChanges ||
			currentCustomizations[field] !== originalCustomizations[field]
		);
	};

	const handleChange = (field: keyof typeof customizations, value: string) => {
		updateCustomizations(field, value, setCustomizations);
		updatePendingChanges(field, value, userCustomizations, setPendingChanges);
	};

	const debouncedHandleChange = useDebouncedCallback(handleChange, 300);

	const handleSavePending = async () => {
		if (!Object.keys(pendingChanges).length) {
			return;
		}
		setIsExiting(true);
		setIsSaving(true);
		try {
			await onSave(pendingChanges);
			setTimeout(() => {
				setPendingChanges({});
				setIsExiting(false);
			}, 300);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setIsExiting(true);
		setTimeout(() => {
			setCustomizations(userCustomizations);
			setPendingChanges({});
			setIsExiting(false);
		}, 300);
	};

	const hasPendingChange = (field: keyof typeof customizations) => {
		return checkPendingChange(
			field,
			pendingChanges,
			customizations,
			userCustomizations
		);
	};

	// Hook para fechar o seletor de cores ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(event.target as Node)
			) {
				setActiveColorPicker(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleSetActiveColorPicker = (picker: string | null) => {
		setActiveColorPicker(
			picker as "background" | "text" | "button" | "buttonText" | null
		);
	};

	return {
		customizations,
		activeColorPicker,
		setActiveColorPicker: handleSetActiveColorPicker,
		isFontModalOpen,
		setIsFontModalOpen,
		pendingChanges,
		isSaving,
		isExiting,
		pickerRef,
		handleChange,
		debouncedHandleChange,
		handleSavePending,
		handleCancel,
		hasPendingChange,
	};
}

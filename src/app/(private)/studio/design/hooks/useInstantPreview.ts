"use client";

import { useDesignStore } from "@/stores/designStore";
import { useEffect, useRef, useState } from "react";

export function useInstantPreview() {
	const [, forceUpdate] = useState({});
	const store = useDesignStore();
	const prevDataRef = useRef<string>("");
	
	useEffect(() => {
		// Subscribe diretamente ao store do Zustand
		const unsubscribe = useDesignStore.subscribe((state) => {
			const currentData = JSON.stringify({
				userData: state.userData,
				customizations: state.customizations
			});
			
			if (currentData !== prevDataRef.current) {
				prevDataRef.current = currentData;
				forceUpdate({});
				window.dispatchEvent(new CustomEvent('designStoreUpdate'));
			}
		});
		
		return unsubscribe;
	}, []);
	
	return store;
}
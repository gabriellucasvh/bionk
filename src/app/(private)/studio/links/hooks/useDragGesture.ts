"use client";

import { useCallback, useState } from "react";

export const useDragGesture = (onClose: () => void) => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragY, setDragY] = useState(0);
	const [startY, setStartY] = useState(0);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		setIsDragging(true);
		setStartY(e.clientY);
		setDragY(0);
	}, []);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		setIsDragging(true);
		setStartY(e.touches[0].clientY);
		setDragY(0);
	}, []);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) {
				return;
			}

			const currentY = e.clientY;
			const deltaY = Math.max(0, currentY - startY);
			setDragY(deltaY);

			if (deltaY > 150) {
				setIsDragging(false);
				onClose();
			}
		},
		[isDragging, startY, onClose]
	);

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (!isDragging) {
				return;
			}

			const currentY = e.touches[0].clientY;
			const deltaY = Math.max(0, currentY - startY);
			setDragY(deltaY);

			if (deltaY > 150) {
				setIsDragging(false);
				onClose();
			}
		},
		[isDragging, startY, onClose]
	);

	const handleMouseUp = useCallback(() => {
		if (!isDragging) {
			return;
		}

		if (dragY > 100) {
			onClose();
		} else {
			setDragY(0);
		}
		setIsDragging(false);
	}, [isDragging, dragY, onClose]);

	const handleTouchEnd = useCallback(() => {
		if (!isDragging) {
			return;
		}

		if (dragY > 100) {
			onClose();
		} else {
			setDragY(0);
		}
		setIsDragging(false);
	}, [isDragging, dragY, onClose]);

	return {
		isDragging,
		dragY,
		handleMouseDown,
		handleTouchStart,
		handleMouseMove,
		handleTouchMove,
		handleMouseUp,
		handleTouchEnd,
	};
};

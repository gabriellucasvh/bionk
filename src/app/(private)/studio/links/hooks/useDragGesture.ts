"use client";

import { useCallback, useRef, useState } from "react";

export const useDragGesture = (onClose: () => void) => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragY, setDragY] = useState(0);
	const [startY, setStartY] = useState(0);
	const [isClosing, setIsClosing] = useState(false);
	const lastMoveTime = useRef<number>(0);
	const lastMoveY = useRef<number>(0);
	const velocityHistory = useRef<number[]>([]);

	const calculateVelocity = useCallback(
		(currentY: number, currentTime: number) => {
			const timeDiff = currentTime - lastMoveTime.current;
			const yDiff = currentY - lastMoveY.current;

			if (timeDiff > 0) {
				const velocity = yDiff / timeDiff;
				velocityHistory.current.push(velocity);

				if (velocityHistory.current.length > 5) {
					velocityHistory.current.shift();
				}
			}

			lastMoveTime.current = currentTime;
			lastMoveY.current = currentY;
		},
		[]
	);

	const getAverageVelocity = useCallback(() => {
		if (velocityHistory.current.length === 0) {
			return 0;
		}

		const sum = velocityHistory.current.reduce((acc, vel) => acc + vel, 0);
		return sum / velocityHistory.current.length;
	}, []);

	const resetVelocityTracking = useCallback(() => {
		velocityHistory.current = [];
		lastMoveTime.current = 0;
		lastMoveY.current = 0;
	}, []);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			setIsDragging(true);
			setStartY(e.clientY);
			setDragY(0);
			resetVelocityTracking();
			lastMoveTime.current = Date.now();
			lastMoveY.current = e.clientY;
		},
		[resetVelocityTracking]
	);

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			setIsDragging(true);
			setStartY(e.touches[0].clientY);
			setDragY(0);
			resetVelocityTracking();
			lastMoveTime.current = Date.now();
			lastMoveY.current = e.touches[0].clientY;
		},
		[resetVelocityTracking]
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging) {
				return;
			}

			const currentY = e.clientY;
			const deltaY = Math.max(0, currentY - startY);
			setDragY(deltaY);

			calculateVelocity(currentY, Date.now());
		},
		[isDragging, startY, calculateVelocity]
	);

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (!isDragging) {
				return;
			}

			const currentY = e.touches[0].clientY;
			const deltaY = Math.max(0, currentY - startY);
			setDragY(deltaY);

			calculateVelocity(currentY, Date.now());
		},
		[isDragging, startY, calculateVelocity]
	);

	const resetClosingState = useCallback(() => {
		setIsClosing(false);
		setDragY(0);
	}, []);

	const startClosingAnimation = useCallback(() => {
		setIsClosing(true);
		setDragY(window.innerHeight);
		
		setTimeout(() => {
			onClose();
			resetClosingState();
		}, 400);
	}, [onClose, resetClosingState]);

	const handleMouseUp = useCallback(() => {
		if (!isDragging) {
			return;
		}

		const avgVelocity = getAverageVelocity();
		const isFlickGesture = avgVelocity > 0.8 && dragY > 50;

		if (isFlickGesture) {
			startClosingAnimation();
		} else {
			setDragY(0);
		}

		setIsDragging(false);
		resetVelocityTracking();
	}, [isDragging, dragY, startClosingAnimation, getAverageVelocity, resetVelocityTracking]);

	const handleTouchEnd = useCallback(() => {
		if (!isDragging) {
			return;
		}

		const avgVelocity = getAverageVelocity();
		const isFlickGesture = avgVelocity > 0.8 && dragY > 50;

		if (isFlickGesture) {
			startClosingAnimation();
		} else {
			setDragY(0);
		}

		setIsDragging(false);
		resetVelocityTracking();
	}, [isDragging, dragY, startClosingAnimation, getAverageVelocity, resetVelocityTracking]);

	return {
		isDragging,
		dragY,
		isClosing,
		handleMouseDown,
		handleTouchStart,
		handleMouseMove,
		handleTouchMove,
		handleMouseUp,
		handleTouchEnd,
	};
};

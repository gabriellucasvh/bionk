"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const useDragGesture = (onClose: () => void) => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragY, setDragY] = useState(0);
	const [startY, setStartY] = useState(0);
	const [isClosing, setIsClosing] = useState(false);
	const lastMoveTime = useRef<number>(0);
	const lastMoveY = useRef<number>(0);
	const velocityHistory = useRef<number[]>([]);
	const isDraggingRef = useRef(false);
	const startYRef = useRef(0);
	const dragYRef = useRef(0);
	const onCloseRef = useRef(onClose);

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

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
			isDraggingRef.current = true;
			startYRef.current = e.clientY;
			dragYRef.current = 0;
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
			isDraggingRef.current = true;
			startYRef.current = e.touches[0].clientY;
			dragYRef.current = 0;
			resetVelocityTracking();
			lastMoveTime.current = Date.now();
			lastMoveY.current = e.touches[0].clientY;
		},
		[resetVelocityTracking]
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDraggingRef.current) {
				return;
			}

			const currentY = e.clientY;
			const deltaY = Math.max(0, currentY - startYRef.current);
			dragYRef.current = deltaY;
			setDragY(deltaY);

			calculateVelocity(currentY, Date.now());
		},
		[calculateVelocity]
	);

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (!isDraggingRef.current) {
				return;
			}

			const currentY = e.touches[0].clientY;
			const deltaY = Math.max(0, currentY - startYRef.current);
			dragYRef.current = deltaY;
			setDragY(deltaY);

			calculateVelocity(currentY, Date.now());
		},
		[calculateVelocity]
	);

	const resetClosingState = useCallback(() => {
		setIsClosing(false);
		setDragY(0);
	}, []);

	const startClosingAnimation = useCallback(() => {
		setIsClosing(true);
		setDragY(window.innerHeight);
		
		setTimeout(() => {
			const fn = onCloseRef.current;
			if (fn) {
				fn();
			}
			resetClosingState();
		}, 400);
	}, [resetClosingState]);

	const handleMouseUp = useCallback(() => {
		if (!isDraggingRef.current) {
			return;
		}

		const avgVelocity = getAverageVelocity();
		const isFlickGesture = avgVelocity > 0.8 && dragYRef.current > 50;

		if (isFlickGesture) {
			startClosingAnimation();
		} else {
			setDragY(0);
		}

		setIsDragging(false);
		isDraggingRef.current = false;
		resetVelocityTracking();
	}, [startClosingAnimation, getAverageVelocity, resetVelocityTracking]);

	const handleTouchEnd = useCallback(() => {
		if (!isDraggingRef.current) {
			return;
		}

		const avgVelocity = getAverageVelocity();
		const isFlickGesture = avgVelocity > 0.8 && dragYRef.current > 50;

		if (isFlickGesture) {
			startClosingAnimation();
		} else {
			setDragY(0);
		}

		setIsDragging(false);
		isDraggingRef.current = false;
		resetVelocityTracking();
	}, [startClosingAnimation, getAverageVelocity, resetVelocityTracking]);

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

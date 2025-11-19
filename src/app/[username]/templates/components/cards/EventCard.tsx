"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { MotionSpan } from "@/components/ui/motion";
import { parseRgb, toForeground } from "./utils/style";
import Link from "next/link";

interface EventCardProps {
	event: any;
	customPresets?: any;
	buttonStyle?: React.CSSProperties;
}

const REJECTED_URLS = /^(https?:\/\/|mailto:|tel:|\/\/)/i;

function normalizeExternalUrl(url?: string | null): string | null {
	if (!url) {
		return null;
	}
	const trimmed = url.trim();
	if (!trimmed) {
		return null;
	}
	if (REJECTED_URLS.test(trimmed)) {
		return trimmed;
	}
	return `https://${trimmed}`;
}

const RollingValue = ({ v }: { v: number }) => (
	<div className="relative overflow-hidden" style={{ height: "1.9rem" }}>
		<AnimatePresence initial={false} mode="wait">
			<MotionSpan
				animate={{ y: 0, opacity: 1 }}
				className="absolute inset-0 flex w-full items-center justify-center"
				exit={{ y: -16, opacity: 0 }}
				initial={{ y: 16, opacity: 0 }}
				key={v}
				transition={{ duration: 0.22 }}
			>
				{String(v).padStart(2, "0")}
			</MotionSpan>
		</AnimatePresence>
	</div>
);

export default function EventCard({
	event,
	customPresets,
	buttonStyle,
}: EventCardProps) {
	const cornerValue = customPresets?.customButtonCorners || "12";
	const buttonColor = String(customPresets?.customButtonColor || "#ffffff");
	const textColor = String(customPresets?.customButtonTextColor || "#000000");
	const dimBg = useMemo(() => {
		const rgb = parseRgb(buttonColor);
		if (!rgb) {
			return "rgba(0,0,0,0.12)";
		}
		const f = 0.9;
		return `rgba(${Math.round(rgb.r * f)}, ${Math.round(rgb.g * f)}, ${Math.round(rgb.b * f)}, 0.85)`;
	}, [buttonColor]);
	const dimHeader = useMemo(() => {
		const rgb = parseRgb(buttonColor);
		if (!rgb) {
			return "rgba(0,0,0,0.16)";
		}
		const f = 0.8;
		return `rgba(${Math.round(rgb.r * f)}, ${Math.round(rgb.g * f)}, ${Math.round(rgb.b * f)}, 0.9)`;
	}, [buttonColor]);

	const href = normalizeExternalUrl(event?.externalLink);
	const mutedTextColor = toForeground(textColor, 0.7);

	const isCountdown = useMemo(() => {
		if (event?.type === "countdown") {
			return true;
		}
		const hasFallback =
			!(event?.externalLink || event?.location) &&
			String(event?.eventTime) === "00:00";
		return hasFallback;
	}, [event]);

	const targetDate = useMemo(() => {
		try {
			const d = new Date(event?.eventDate);
			const [hh, mm] = String(event?.eventTime || "00:00")
				.split(":")
				.map((p: string) => Number(p));
			d.setHours(
				Number.isFinite(hh) ? hh : 0,
				Number.isFinite(mm) ? mm : 0,
				0,
				0
			);
			return d;
		} catch {
			return null;
		}
	}, [event?.eventDate, event?.eventTime]);

	const [remaining, setRemaining] = useState<{
		values: [number, number, number];
		labels: [string, string, string];
	}>({ values: [0, 0, 0], labels: ["Dias", "Horas", "Minutos"] });

	useEffect(() => {
		if (!(isCountdown && targetDate)) {
			return;
		}
		const update = () => {
			const now = Date.now();
			const end = targetDate.getTime();
			const diff = Math.max(0, end - now);
			const msDay = 24 * 60 * 60 * 1000;
			const msHour = 60 * 60 * 1000;
			const msMin = 60 * 1000;
			const msMonth = 30 * msDay;
			if (diff >= msMonth) {
				const months = Math.floor(diff / msMonth);
				const remAfterMonths = diff - months * msMonth;
				const days = Math.floor(remAfterMonths / msDay);
				const remAfterDays = remAfterMonths - days * msDay;
				const hours = Math.floor(remAfterDays / msHour);
				setRemaining({
					values: [months, days, hours],
					labels: ["Meses", "Dias", "Horas"],
				});
				return;
			}
			if (diff >= msDay) {
				const days = Math.floor(diff / msDay);
				const remAfterDays = diff - days * msDay;
				const hours = Math.floor(remAfterDays / msHour);
				const remAfterHours = remAfterDays - hours * msHour;
				const minutes = Math.floor(remAfterHours / msMin);
				setRemaining({
					values: [days, hours, minutes],
					labels: ["Dias", "Horas", "Minutos"],
				});
				return;
			}
			const hours = Math.floor(diff / msHour);
			const remAfterHours = diff - hours * msHour;
			const minutes = Math.floor(remAfterHours / msMin);
			const remAfterMinutes = remAfterHours - minutes * msMin;
			const seconds = Math.floor(remAfterMinutes / 1000);
			setRemaining({
				values: [hours, minutes, seconds],
				labels: ["Horas", "Minutos", "Segundos"],
			});
		};
		update();
		const id = setInterval(update, 1000);
		return () => clearInterval(id);
	}, [isCountdown, targetDate]);

	const dateLabel = (() => {
		try {
			const d = new Date(event?.eventDate);
			return d.toLocaleDateString("pt-BR");
		} catch {
			return event?.eventDate;
		}
	})();

	if (isCountdown) {
		return (
			<div
				className="overflow-hidden border shadow"
				style={{ borderRadius: `${cornerValue}px`, ...(buttonStyle || {}) }}
			>
				<div
					className="text-center"
					style={{ background: dimHeader, color: textColor, padding: "12px 0" }}
				>
					<div className="font-semibold">{event?.title}</div>
				</div>
				<div className="mt-3 flex items-center justify-center gap-3 px-4 pb-4">
					<div className="flex flex-col items-center gap-2">
						<div
							className="min-w-16 rounded-lg px-3 py-2 text-center font-semibold text-2xl"
							style={{ background: dimBg, color: textColor }}
						>
							<RollingValue v={remaining.values[0]} />
						</div>
						<div className="text-sm" style={{ color: mutedTextColor }}>
							{remaining.labels[0]}
						</div>
					</div>
					<div className="flex flex-col items-center gap-2">
						<div
							className="min-w-16 rounded-lg px-3 py-2 text-center font-semibold text-2xl"
							style={{ background: dimBg, color: textColor }}
						>
							<RollingValue v={remaining.values[1]} />
						</div>
						<div className="text-sm" style={{ color: mutedTextColor }}>
							{remaining.labels[1]}
						</div>
					</div>
					<div className="flex flex-col items-center gap-2">
						<div
							className="min-w-16 rounded-lg px-3 py-2 text-center font-semibold text-2xl"
							style={{ background: dimBg, color: textColor }}
						>
							<RollingValue v={remaining.values[2]} />
						</div>
						<div className="text-sm" style={{ color: mutedTextColor }}>
							{remaining.labels[2]}
						</div>
					</div>
				</div>

				{(() => {
					const linkHref = normalizeExternalUrl(event?.countdownLinkUrl);
					const isFinished = targetDate
						? Date.now() >= targetDate.getTime()
						: false;
					const allowedDuring =
						event?.countdownLinkVisibility === "during" && !isFinished;
					const allowedAfter =
						event?.countdownLinkVisibility === "after" && isFinished;
					const showLink = Boolean(linkHref && (allowedDuring || allowedAfter));
					if (!showLink) {
						return null;
					}
					const radius = Math.max(8, Number(cornerValue || "12") - 4);
					return (
						<div className="-mt-1 flex justify-center pb-4">
							<Link
								className="inline-block px-3 py-1 font-bold text-sm transition-all duration-150 hover:brightness-90"
								href={linkHref as string}
								rel="noopener noreferrer"
								style={{
									background: dimBg,
									color: textColor,
									borderRadius: `${radius}px`,
								}}
								target="_blank"
							>
								Abrir
							</Link>
						</div>
					);
				})()}
			</div>
		);
	}

	if (href) {
		return (
			<a
				className="block border p-4 shadow"
				href={href}
				rel="noopener noreferrer"
				style={{ borderRadius: `${cornerValue}px`, ...(buttonStyle || {}) }}
				target="_blank"
			>
				<h3 className="font-bold text-lg">{event?.title}</h3>
				<div className="text-sm" style={{ color: mutedTextColor }}>
					{event?.location}
				</div>
				<div className="text-sm" style={{ color: mutedTextColor }}>
					{dateLabel} • {event?.eventTime}
				</div>
			</a>
		);
	}

	return (
		<div
			className="border p-4 shadow"
			style={{ borderRadius: `${cornerValue}px`, ...(buttonStyle || {}) }}
		>
			<h3 className="font-bold text-lg">{event?.title}</h3>
			<div className="text-sm" style={{ color: mutedTextColor }}>
				{event?.location}
			</div>
			<div className="text-sm" style={{ color: mutedTextColor }}>
				{dateLabel} • {event?.eventTime}
			</div>
		</div>
	);
}

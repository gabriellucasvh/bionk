"use client";

import Image from "next/image";
import { type CSSProperties, useMemo, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { UserContactForm } from "@/types/user-profile";
import { parseRgb } from "./utils/style";
import { detectTrafficSource } from "@/utils/traffic-source";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ContactFormCardProps {
	contactForm: UserContactForm;
	buttonStyle?: CSSProperties;
	customPresets?: any;
	textStyle?: CSSProperties;
}

export default function ContactFormCard({
	contactForm,
	buttonStyle,
	customPresets,
	textStyle,
}: ContactFormCardProps) {
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const [phone, setPhone] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (cardRef.current) {
			const previewMockup = cardRef.current.closest("#preview-phone-container");
			if (previewMockup) {
				setPortalContainer(previewMockup as HTMLElement);
			}
		}
	}, []);

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

	const combinedTextStyle = {
		color: textColor,
		fontFamily: textStyle?.fontFamily,
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setStatus("loading");
		setErrorMsg("");

		const formData = new FormData(e.currentTarget);
		const trafficSource = detectTrafficSource();
		const data = {
			contactFormId: contactForm.id,
			name: formData.get("name")?.toString() || "",
			email: formData.get("email")?.toString() || "",
			phone: phone,
			trafficSource,
		};

		try {
			const res = await fetch("/api/profile-contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Ocorreu um erro ao enviar.");
			}

			setStatus("success");
		} catch (error: any) {
			console.error("Form submit error:", error);
			setStatus("error");
			setErrorMsg(error.message || "Não foi possível enviar a mensagem.");
		}
	};

	const formContent = (
		<div className="flex flex-col items-center gap-4">
			{contactForm.imageUrl && (
				<div className="relative h-40 w-full overflow-hidden rounded-xl">
					<Image
						alt={contactForm.title || "Imagem de contato"}
						className="object-cover"
						fill
						src={contactForm.imageUrl}
					/>
				</div>
			)}

			<div className="w-full text-center">
				{contactForm.title && (
					<h3 className="mb-1 font-bold text-lg" style={combinedTextStyle}>
						{contactForm.title}
					</h3>
				)}
				{contactForm.description && (
					<p className="mb-4 text-sm opacity-90" style={combinedTextStyle}>
						{contactForm.description}
					</p>
				)}
			</div>

			<form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
				{contactForm.collectName && (
					<input
						className="w-full border border-white/20 bg-black/5 px-4 py-2 transition-all placeholder:text-current placeholder:opacity-50 focus:outline-none focus:ring-2 dark:bg-white/5"
						name="name"
						placeholder="Seu nome"
						required
						style={{ ...combinedTextStyle, borderRadius: `${cornerValue}px` }}
						type="text"
						maxLength={44}
					/>
				)}

				{contactForm.collectEmail && (
					<input
						className="w-full border border-white/20 bg-black/5 px-4 py-2 transition-all placeholder:text-current placeholder:opacity-50 focus:outline-none focus:ring-2 dark:bg-white/5"
						name="email"
						placeholder="Seu e-mail"
						required
						style={{ ...combinedTextStyle, borderRadius: `${cornerValue}px` }}
						type="email"
						maxLength={254}
					/>
				)}

				{contactForm.collectPhone && (
					<div className="flex flex-col gap-1.5 text-left relative">
						<div
							className="w-full flex"
							style={{
								"--react-international-phone-bg": dimBg,
								"--react-international-phone-text-color": textColor,
								"--react-international-phone-border-color": "rgba(255,255,255,0.1)",
								"--react-international-phone-dropdown-bg": "var(--background)",
								"--react-international-phone-dropdown-text-color": "var(--foreground)",
							} as React.CSSProperties}
						>
							<PhoneInput
								defaultCountry="br"
								value={phone}
								onChange={(phone) => setPhone(phone)}
								placeholder="Celular"
								required
								className="w-full"
								inputClassName={cn(
									"w-full px-4 py-2 text-sm sm:text-base bg-transparent transition-colors",
									"focus:outline-none focus:ring-1 focus:ring-white/20 placeholder:text-current placeholder:opacity-50"
								)}
								inputStyle={{
									backgroundColor: dimBg,
									color: textColor,
									borderColor: "rgba(255,255,255,0.1)",
									borderRadius: `0 ${cornerValue}px ${cornerValue}px 0`,
									width: "100%",
								}}
								countrySelectorStyleProps={{
									buttonStyle: {
										backgroundColor: dimBg,
										borderColor: "rgba(255,255,255,0.1)",
										borderRadius: `${cornerValue}px 0 0 ${cornerValue}px`,
										padding: "0 8px",
									},
								}}
							/>
						</div>
					</div>
				)}

				{status === "error" && (
					<p
						className="text-center text-red-500 text-sm"
						style={{ fontFamily: textStyle?.fontFamily }}
					>
						{errorMsg}
					</p>
				)}

				<button
					className="mt-2 flex w-full items-center justify-center py-3 font-bold transition-opacity hover:brightness-110 disabled:opacity-50"
					disabled={status === "loading"}
					style={{
						background: dimBg,
						color: textColor,
						borderRadius: `${cornerValue}px`,
					}}
					type="submit"
				>
					{status === "loading"
						? "Enviando..."
						: contactForm.buttonText || "Enviar"}
				</button>
			</form>
		</div>
	);

	if (contactForm.isCompact) {
		return (
			<div ref={cardRef} className="mb-3 w-full" key={contactForm.id}>
				<div className="w-full">
					<button
						className="flex min-h-[3.5rem] w-full items-center rounded-2xl border px-1 py-3 text-left shadow backdrop-blur-md transition-all duration-200 hover:brightness-110"
						onClick={() => setIsModalOpen(true)}
						style={buttonStyle}
						type="button"
					>
						<div className="w-10 flex-shrink-0" />
						<div className="flex flex-1 justify-center">
							<h3
								className="line-clamp-2 px-2 font-medium leading-tight"
								style={combinedTextStyle}
							>
								{contactForm.title || "Formulário de Contato"}
							</h3>
						</div>
						<div className="w-10 flex-shrink-0" />
					</button>
				</div>

				<Dialog onOpenChange={setIsModalOpen} open={isModalOpen}>
					<DialogContent container={portalContainer || undefined} className="max-h-[80vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto">
						<DialogHeader className="sr-only">
							<DialogTitle>{contactForm.title || "Contato"}</DialogTitle>
						</DialogHeader>
						{status === "success" ? (
							<div className="w-full p-4 text-center">
								<h3 className="mb-2 font-bold text-xl" style={combinedTextStyle}>
									Sucesso!
								</h3>
								<p style={combinedTextStyle}>
									{contactForm.successMessage || "Enviado"}
								</p>
							</div>
						) : (
							formContent
						)}
					</DialogContent>
				</Dialog>
			</div>
		);
	}

	if (status === "success") {
		return (
			<div
				className="w-full overflow-hidden rounded-2xl p-6 text-center shadow backdrop-blur-md"
				style={buttonStyle}
			>
				<h3 className="mb-2 font-bold text-xl" style={combinedTextStyle}>
					Sucesso!
				</h3>
				<p style={combinedTextStyle}>
					{contactForm.successMessage || "Enviado"}
				</p>
			</div>
		);
	}

	return (
		<div
			className="w-full overflow-hidden rounded-2xl p-6 shadow backdrop-blur-md"
			style={buttonStyle}
		>
			{formContent}
		</div>
	);
}

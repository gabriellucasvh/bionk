"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const REGEX_NUMBERS = /^[0-9]$/;

type OTPInputCustomProps = {
	value: string;
	onChange: (value: string) => void;
	length?: number;
	disabled?: boolean;
	autoFocus?: boolean;
	className?: string;
	name?: string;
	separatorIndex?: number; // posição do separador visual (ex.: 3)
	"aria-label"?: string;
};

export const OTPInputCustom = React.forwardRef<
	HTMLDivElement,
	OTPInputCustomProps
>(
	(
		{
			value,
			onChange,
			length = 6,
			disabled = false,
			autoFocus = false,
			className,
			name,
			separatorIndex = 3,
			...rest
		},
		ref
	) => {
		const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);
		const [activeIndex, setActiveIndex] = React.useState(0);

		// Normaliza o valor para o tamanho definido
		const digits = React.useMemo(() => {
			const filled = (value || "").slice(0, length);
			return filled.padEnd(length, "").split("");
		}, [value, length]);

		React.useEffect(() => {
			if (autoFocus && !disabled) {
				inputsRef.current[0]?.focus();
				setActiveIndex(0);
			}
		}, [autoFocus, disabled]);

		function setValueAt(index: number, chars: string) {
			const onlyDigits = chars.replace(/\D/g, "");
			if (!onlyDigits) {
				return;
			}

			const current = value.padEnd(length, "").split("");
			let i = index;
			for (const ch of onlyDigits) {
				if (i >= length) {
					break;
				}
				current[i] = ch;
				i++;
			}
			onChange(current.join("").slice(0, length).trimEnd());
			// Move foco para o próximo campo vazio ou o último preenchido
			const next = Math.min(i, length - 1);
			inputsRef.current[next]?.focus();
			setActiveIndex(next);
		}

		function handleKeyDown(
			e: React.KeyboardEvent<HTMLInputElement>,
			index: number
		) {
			if (disabled) {
				return;
			}
			const key = e.key;
			// Permitir atalhos com Ctrl/Cmd (A, C, V, X)
			if (e.ctrlKey || e.metaKey) {
				return;
			}
			if (key === "Backspace") {
				e.preventDefault();
				const current = value.padEnd(length, "").split("");
				if (current[index]) {
					current[index] = "";
					onChange(current.join("").trimEnd());
					setActiveIndex(index);
				} else {
					const prev = Math.max(0, index - 1);
					current[prev] = "";
					onChange(current.join("").trimEnd());
					inputsRef.current[prev]?.focus();
					setActiveIndex(prev);
				}
				return;
			}
			if (key === "Delete") {
				e.preventDefault();
				const current = value.padEnd(length, "").split("");
				current[index] = "";
				onChange(current.join("").trimEnd());
				setActiveIndex(index);
				return;
			}
			if (key === "ArrowLeft") {
				e.preventDefault();
				const prev = Math.max(0, index - 1);
				inputsRef.current[prev]?.focus();
				setActiveIndex(prev);
				return;
			}
			if (key === "ArrowRight") {
				e.preventDefault();
				const next = Math.min(length - 1, index + 1);
				inputsRef.current[next]?.focus();
				setActiveIndex(next);
				return;
			}
            // Bloqueia letras/símbolos (sem bloquear teclas de controle)
            if (!REGEX_NUMBERS.test(key) && key.length === 1) {
                e.preventDefault();
            }
		}

		function handleChange(
			e: React.ChangeEvent<HTMLInputElement>,
			index: number
		) {
			if (disabled) {
				return;
			}
			const v = e.target.value;
			// Suporta colagem de múltiplos dígitos num único input
			setValueAt(index, v);
		}

		function handlePaste(
			e: React.ClipboardEvent<HTMLInputElement>,
			index: number
		) {
			if (disabled) {
				return;
			}
			const text = e.clipboardData.getData("text");
			if (!text) {
				return;
			}
			e.preventDefault();
			setValueAt(index, text);
		}

		return (
			<div
				aria-disabled={disabled}
				className={cn("flex items-center gap-2", className)}
				ref={ref}
				{...rest}
			>
				{Array.from({ length }).map((_, i) => (
					<React.Fragment key={i}>
						{i === separatorIndex && (
							<div
								aria-hidden="true"
								className="mx-1 h-5 w-px bg-muted-foreground/30"
							/>
						)}
						<input
							aria-label={`Dígito ${i + 1}`}
							autoComplete="one-time-code"
							autoCorrect="off"
							className={cn(
								"h-12 w-10 rounded-md border bg-background text-center font-medium text-xl shadow-sm transition-colors",
								"placeholder:text-muted-foreground focus:placeholder-transparent focus:ring-2 focus:ring-lime-400",
								i === activeIndex
									? "border-lime-500"
									: "border-muted-foreground/30",
								disabled && "cursor-not-allowed opacity-50"
							)}
							disabled={disabled}
							inputMode="numeric"
							maxLength={1}
							name={name ? `${name}-${i}` : undefined}
							onChange={(e) => handleChange(e, i)}
							onFocus={() => setActiveIndex(i)}
							onKeyDown={(e) => handleKeyDown(e, i)}
							onPaste={(e) => handlePaste(e, i)}
							placeholder="-"
							ref={(el) => {
								inputsRef.current[i] = el;
							}}
							spellCheck={false}
							type="text"
							value={digits[i] || ""}
						/>
					</React.Fragment>
				))}
			</div>
		);
	}
);

OTPInputCustom.displayName = "OTPInputCustom";

export default OTPInputCustom;

"use client";

import { ClockFading, Ticket } from "lucide-react";

interface EventOptionsProps {
    onOptionSelect: (option: "event_tickets" | "event_countdown") => void;
}

type Option = {
    value: "event_tickets" | "event_countdown";
    title: string;
    description: string;
    icon: "ticket" | "countdown";
    bg: string;
};

const OptionItem = ({ opt, onSelect }: { opt: Option; onSelect: (v: Option["value"]) => void }) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(opt.value)}
            className="relative flex w-full max-w-full items-center justify-between gap-4 py-2 transition-colors hover:bg-gray-50 overflow-hidden"
        >
            <div className="flex items-center gap-4">
                <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${opt.bg}`}>
                    {opt.icon === "ticket" ? (
                        <Ticket className="h-6 w-6 text-white" strokeWidth={1.5} />
                    ) : (
                        <ClockFading className="h-6 w-6 text-white" strokeWidth={1.5} />
                    )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col  max-w-md">
                    <span className="font-medium text-left">{opt.title}</span>
                    <span className="text-sm text-gray-500 truncate break-words max-w-md font-normal text-left">
                        {opt.description}
                    </span>
                </div>
            </div>
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-18 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-transparent via-background to-background`}>
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-black"
                >
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </button>
    );
};

const EventOptions = ({ onOptionSelect }: EventOptionsProps) => {
    const options: Option[] = [
        {
            value: "event_tickets",
            title: "Ingressos",
            description: "Adicione um botão de compra de ingressos.",
            icon: "ticket",
            bg: "bg-purple-700",
        },
        {
            value: "event_countdown",
            title: "Contagem Regressiva",
            description: "Mostre um contador até o evento.",
            icon: "countdown",
            bg: "bg-blue-400",
        },
    ];

    return (
        <div className="flex w-full max-w-full flex-col gap-2">
            {options.map((opt) => (
                <OptionItem key={opt.value} opt={opt} onSelect={(v) => onOptionSelect(v)} />
            ))}
        </div>
    );
};

export default EventOptions;

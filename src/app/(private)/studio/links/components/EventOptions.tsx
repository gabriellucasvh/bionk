"use client";

import { Ticket } from "lucide-react";

interface EventOptionsProps {
	onOptionSelect: (option: "event_tickets") => void;
}

const EventOptions = ({ onOptionSelect }: EventOptionsProps) => {
	return (
		<div>
			<div className="grid grid-cols-3 gap-4">
				<button
					className="flex flex-col items-center gap-2 rounded-2xl p-6 transition-colors hover:bg-muted"
					onClick={() => onOptionSelect("event_tickets")}
					type="button"
				>
					<div
						className="relative w-20 overflow-hidden rounded-2xl border bg-purple-400"
						style={{ aspectRatio: "6 / 7" }}
					>
						<Ticket className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-6 w-6 text-black" />
					</div>
					<span className="font-medium text-sm">Ingressos</span>
				</button>
			</div>
		</div>
	);
};

export default EventOptions;

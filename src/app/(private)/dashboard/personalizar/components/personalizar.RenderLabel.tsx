import { Label } from "@/components/ui/label";

// Interface de props para o novo componente
interface RenderLabelProps {
	text: string;
	hasPending: boolean;
}

// Componente movido para fora
export const RenderLabel = ({ text, hasPending }: RenderLabelProps) => {
	return (
		<Label className="mb-3 block">
			{text}
			{hasPending && (
				<span className="ml-2 text-red-500 text-xs">(não salvo)</span>
			)}
		</Label>
	);
};

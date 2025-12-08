import { Label } from "@/components/ui/label";

// Interface de props para o novo componente
interface RenderLabelProps {
	text: string;
	hasPending?: boolean;
	icon?: React.ReactNode;
}

// Componente movido para fora
export const RenderLabel = ({ text, hasPending, icon }: RenderLabelProps) => {
	return (
		<Label className="inline-block items-center gap-2">
			{icon && icon}
			{text}
			{hasPending && (
				<span className="ml-2 text-red-500 text-sm">(não salvo)</span>
			)}
		</Label>
	);
};

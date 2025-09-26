import BaseTemplate from "../components/BaseTemplate";
import type { TemplateComponentProps } from "@/types/user-profile";

export default function VinhoTemplate({ user }: TemplateComponentProps) {
	return <BaseTemplate user={user} />;
}

import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function VibrantTemplate({ user }: TemplateComponentProps) {
	return <BaseTemplate user={user} />;
}

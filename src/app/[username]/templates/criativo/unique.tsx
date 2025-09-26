import BaseTemplate from "../components/BaseTemplate";
import type { TemplateComponentProps } from "@/types/user-profile";

export default function UniqueTemplate({ user }: TemplateComponentProps) {
	return <BaseTemplate user={user} />;
}

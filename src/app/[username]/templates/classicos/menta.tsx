import type { TemplateComponentProps } from "@/types/user-profile";
import BaseTemplate from "../components/BaseTemplate";

export default function MentaTemplate({ user }: TemplateComponentProps) {
	return <BaseTemplate user={user} />;
}

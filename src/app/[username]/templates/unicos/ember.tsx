import BaseTemplate from "../components/BaseTemplate";
import type { TemplateComponentProps } from "@/types/user-profile";

export default function EmberTemplate({ user }: TemplateComponentProps) {
	return <BaseTemplate user={user} />;
}

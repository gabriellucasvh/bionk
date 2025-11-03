import NovaSenhaClient from "./NovaSenhaClient";

export default function NovaSenhaPage({
	searchParams,
}: {
	searchParams: { token?: string };
}) {
	const token =
		typeof searchParams?.token === "string" ? searchParams.token : "";
	return <NovaSenhaClient token={token} />;
}

import VerificarOtpClient from "./VerificarOtpClient";

export default function VerificarOtpPage({
	searchParams,
}: {
	searchParams: { login?: string };
}) {
	const login =
		typeof searchParams?.login === "string" ? searchParams.login : "";
	return <VerificarOtpClient initialLogin={login} />;
}

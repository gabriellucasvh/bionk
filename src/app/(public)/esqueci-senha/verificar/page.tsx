import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import VerificarOtpClient from "./VerificarOtpClient";

export default async function VerificarOtpPage({
    searchParams,
}: {
    searchParams: Promise<{ login?: string }>;
}) {
	const cookieStore = await cookies();
	const fpReq = cookieStore.get("fp_req");
	if (!(fpReq && fpReq.value === "1")) {
		redirect("/esqueci-senha");
	}
    const sp = await searchParams;
    const login = typeof sp?.login === "string" ? sp.login : "";
    return <VerificarOtpClient initialLogin={login} />;
}

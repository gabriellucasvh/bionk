"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface NextAuthSessionProviderProps {
	children: ReactNode;
	session?: Session | null;
}

export default function NextAuthSessionProvider({
	children,
	session,
}: NextAuthSessionProviderProps) {
	return (
		<SessionProvider
			refetchInterval={5 * 60}
			refetchOnWindowFocus={false}
			session={session}
		>
			{children}
		</SessionProvider>
	);
}

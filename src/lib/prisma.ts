import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prismaProxy?: PrismaClient };

let prismaInstance: PrismaClient | null = null;

function normalizeDatabaseUrl(cs: string): string {
	try {
		const u = new URL(cs);
		if (!u.searchParams.get("sslmode")) {
			const host = u.hostname.toLowerCase();
			const isLocal =
				host === "localhost" || host === "127.0.0.1" || host === "::1";
			u.searchParams.set("sslmode", isLocal ? "disable" : "require");
		}
		return u.toString();
	} catch {
		return cs;
	}
}

const prismaProxy = new Proxy({} as PrismaClient, {
	get(_target, prop, _receiver) {
		if (!prismaInstance) {
			const cs = process.env.DATABASE_URL;
			if (!(typeof cs === "string" && cs.length > 0)) {
				throw new Error("DATABASE_URL não configurada");
			}
			const adapter = new PrismaPg({
				connectionString: normalizeDatabaseUrl(cs),
			});
			prismaInstance = new PrismaClient({ adapter } as any);
		}
		const value = (prismaInstance as any)[prop];
		return typeof value === "function" ? value.bind(prismaInstance) : value;
	},
});

globalForPrisma.prismaProxy = globalForPrisma.prismaProxy ?? prismaProxy;

export default globalForPrisma.prismaProxy as PrismaClient;

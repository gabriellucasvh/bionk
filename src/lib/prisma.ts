import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prismaProxy?: PrismaClient };

let prismaInstance: PrismaClient | null = null;

const prismaProxy = new Proxy({} as PrismaClient, {
    get(_target, prop, _receiver) {
        if (!prismaInstance) {
            const cs = process.env.DATABASE_URL;
            if (!(typeof cs === "string" && cs.length > 0)) {
                throw new Error("DATABASE_URL não configurada");
            }
            const adapter = new PrismaPg({ connectionString: cs });
            prismaInstance = new PrismaClient({ adapter });
        }
        const value = (prismaInstance as any)[prop];
        return typeof value === "function" ? value.bind(prismaInstance) : value;
    },
});

globalForPrisma.prismaProxy = globalForPrisma.prismaProxy ?? prismaProxy;

export default globalForPrisma.prismaProxy as PrismaClient;

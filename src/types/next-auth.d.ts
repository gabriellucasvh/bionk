import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      name?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}
declare module "next-auth" {
  interface User {
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    username?: string;
    accessToken?: string;
  }
}

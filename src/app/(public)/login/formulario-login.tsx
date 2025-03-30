"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GreenAnimation from "../../../components/green-animation";
import { GoogleBtn } from "@/components/googleBtn";

// Define the form schema
const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// Infer the TypeScript type from the schema
type FormData = z.infer<typeof schema>;

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { data: _session, status } = useSession(); // Renamed to _session to indicate intentional non-use
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <section className="flex items-center justify-center h-screen">
        <span className="loader"></span>
      </section>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setMessage("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setMessage("Credenciais inválidas. Tente novamente.");
      } else {
        router.replace("/");
      }
    } catch (error) {
      setMessage("Ocorreu um erro durante o login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen flex items-center justify-center py-25 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 w-full h-full -z-10">
        <GreenAnimation />
      </div>
      <form
        className="bg-white p-8 rounded-lg w-full max-w-md border relative z-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl font-bold text-center text-black">
            Seja bem-vindo de volta!
          </h2>
          <p className="text-muted-foreground">Acesse sua conta no Bionk e gerencie seus com facilidade.</p>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="block text-base text-black">Seu email</Label>
            <Input
              className="w-full px-4 py-3 rounded-md focus-visible:border-lime-500"
              placeholder="Digite seu e-mail"
              type="email"
              {...register("email")}
            />
            {errors.email && <p className="text-red-600 font-base mt-2">{errors.email.message}</p>}
          </div>

          <div>
            <Label className="block text-base text-black">Sua senha</Label>
            <div className="relative">
              <Input
                className="w-full px-4 py-3 rounded-md focus-visible:border-lime-500"
                placeholder="Digite sua senha"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <p className="text-red-600 font-base mt-2">{errors.password.message}</p>}
          </div>
          <div className="-mt-5">
            <Link href={"/"} className="text-blue-500 text-sm hover:underline">Esqueceu a senha?</Link>
          </div>
          <div className="flex flex-col items-center justify-center space-y-4">
            <span className="w-full flex items-center justify-center h-px bg-gray-300">
              <span className="px-4 bg-white">ou</span>
            </span>
            <GoogleBtn />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white text-lg font-bold py-3 px-6 bg-green-500 hover:bg-green-600 transition-colors duration-300 rounded-md"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {message && (
              <div className="mt-4 p-4 bg-white border border-lime-500 rounded-md text-black font-base text-center">
                {message}
              </div>
            )}
          </div>
          <span className="mt-10">
            Não possui uma conta? {" "}
            <Link className="text-blue-500 hover:underline" href={"/registro"}>Crie gratuitamente!</Link>
          </span>
        </div>
      </form>
    </div>
  );
}

export default Login;
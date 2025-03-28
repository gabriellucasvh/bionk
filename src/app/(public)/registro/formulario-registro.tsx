"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { GoogleBtn } from "@/components/googleBtn";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import GreenAnimation from "@/components/green-animation";

const schema = z
  .object({
    name: z.string().min(3, "Insira um nome de usuário válido"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: session, status } = useSession();
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

  async function onSubmit(data: any) {
    setLoading(true);
    setMessage("");

    try {
      await axios.post("/api/auth/register", data);
      setMessage("Cadastro realizado com sucesso!");

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setMessage("Erro ao autenticar. Faça login manualmente.");
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Erro ao cadastrar");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex">
      {/* Card de Registro */}
      <section className="w-full min-h-screen flex items-center justify-center  px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 w-full h-full -z-10">
          <GreenAnimation />
        </div>
        <article className="bg-white p-8 rounded-lg w-full max-w-md">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl font-bold text-center text-black">
              Junte-se ao Bionk
            </h2>
            <p className="text-muted-foreground">
              Personalize, organize e compartilhe todos os seus links em um só
              lugar.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="block text-base font-semibold text-black">
                Seu nome
              </Label>
              <Input
                className="w-full px-4 py-3 border mb-4 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
                placeholder="Digite seu nome"
                type="text"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-600 font-base mt-2">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label className="block text-base font-semibold text-black">
                Seu email
              </Label>
              <Input
                className="w-full px-4 py-3 border mb-4 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
                placeholder="Digite seu e-mail"
                type="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-600 font-base mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label className="block text-base font-semibold text-black">
                Sua senha
              </Label>
              <div className="relative">
                <Input
                  className="w-full px-4 py-3 border mb-4 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
                  placeholder="Digite sua senha"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-4"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 font-base mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label className="block text-base font-semibold text-black">
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  className="w-full px-4 py-3 border mb-4 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
                  placeholder="Confirme sua senha"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-4"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 font-base mt-2">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Ao criar uma conta, você aceita os nossos{" "}
                <Link className="underline" href="/termos">
                  Termos e Condições
                </Link>{" "}
                e a nossa{" "}
                <Link className="underline" href="/privacidade">
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col items-center justify-center space-y-4">
              <span className="w-full flex items-center justify-center h-px bg-gray-300">
                <span className="px-4 bg-white">ou</span>
              </span>
              <GoogleBtn />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-500 transition-colors duration-300 text-white text-lg font-bold py-3 px-6 rounded-md cursor-pointer"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>

            {message && (
              <div className="mt-4 p-4 bg-white border border-lime-500 rounded-md text-black font-base text-center">
                {message}
              </div>
            )}
            <div>
              <span>
                Já possui uma conta?{" "}
                <Link className="text-blue-500" href={"/login"}>
                  Faça o Login
                </Link>
              </span>
            </div>
          </form>
        </article>
      </section>
    </main>
  );
}

export default Register;

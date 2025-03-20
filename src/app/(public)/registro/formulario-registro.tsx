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
    reset,
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
    return <div className="h-screen flex items-center justify-center bg-white">Carregando...</div>;
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
    <div className="min-h-screen flex items-center justify-center bg-white py-25 px-4 sm:px-6 lg:px-8">
      <form
        className="bg-white p-8 rounded-lg w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-black">
          Registro
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-black mb-2">Seu nome</label>
            <input
              className="w-full px-4 py-3 border-2 border-black rounded-md"
              placeholder="Digite seu nome"
              type="text"
              {...register("name")}
            />
            {errors.name && <p className="text-red-600 font-bold mt-2">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-lg font-bold text-black mb-2">Seu email</label>
            <input
              className="w-full px-4 py-3 border-2 border-black rounded-md"
              placeholder="Digite seu e-mail"
              type="email"
              {...register("email")}
            />
            {errors.email && <p className="text-red-600 font-bold mt-2">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-lg font-bold text-black mb-2">Sua senha</label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border-2 border-black rounded-md"
                placeholder="Digite sua senha"
                type={showPassword ? "text" : "password"}
                {...register("password")}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-4">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && <p className="text-red-600 font-bold mt-2">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-lg font-bold text-black mb-2">Confirme sua senha</label>
            <div className="relative">
              <input
                className="w-full px-4 py-3 border-2 border-black rounded-md"
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
            {errors.confirmPassword && <p className="text-red-600 font-bold mt-2">{errors.confirmPassword.message}</p>}
          </div>

            <div className="flex flex-col items-center justify-center space-y-3">
                <span>ou</span>
            <GoogleBtn />
            </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-lg font-bold py-3 px-6 border-2 border-black rounded-md cursor-pointer"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

          {message && (
            <div className="mt-4 p-4 bg-[#98EECC] border-2 border-black rounded-md text-black font-bold text-center">
              {message}
            </div>
          )}
          <div>
              <span>
                Já possui uma conta? {""}
                <Link className="text-blue-500" href={"/login"}>Faça o Login</Link>
              </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Register;

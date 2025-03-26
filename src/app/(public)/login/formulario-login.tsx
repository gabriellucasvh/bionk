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

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-25 px-4 sm:px-6 lg:px-8">
      <form
        className="bg-white p-8 rounded-lg w-full max-w-md border"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-black" style={{ fontFamily: "system-ui" }}>
          Login
        </h2>

        <div className="space-y-6">
          <div>
            <Label className="block text-base font-semibold text-black">Seu email</Label>
            <Input
              className="w-full px-4 py-3 rounded-md focus-visible:border-lime-500"
              placeholder="Digite seu e-mail"
              type="email"
              {...register("email")}
            />
            {errors.email && <p className="text-red-600 font-bold mt-2">{errors.email.message}</p>}
          </div>

          <div>
            <Label className="block text-base font-semibold text-black">Sua senha</Label>
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
            {errors.password && <p className="text-red-600 font-bold mt-2">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full  text-white text-lg font-bold py-3 px-6 bg-green-600 hover:bg-green-500 transition-colors duration-300 rounded-md"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {message && (
            <div className="mt-4 p-4 bg-[#98EECC] border-2 border-black rounded-md text-black font-bold text-center">
              {message}
            </div>
          )}
          <div>
              <span>
                Não possui uma conta? {""}
                <Link className="text-blue-500" href={"/registro"}>Crie gratuitamente!</Link>
              </span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;

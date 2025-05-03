"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { GoogleBtn } from "@/components/buttons/button-google";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LoadingPage from "@/components/layout/LoadingPage";

// Define the form schema
const schema = z
  .object({
    name: z.string()
      .min(3, "Insira um nome de usuário válido")
      .regex(/^[a-zA-Z0-9\s\-]+$/, {
        message: "Use apenas letras, números e hífens",
      }),

    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

// Infer the TypeScript type from the schema
type FormData = z.infer<typeof schema>;

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: session, status } = useSession();
  // Verifica apenas se existe sessão, sem acessar dados
  useEffect(() => {
    if (session) { // Apenas verifica a existência
      // Lógica que não expõe os dados da sessão
    }
  }, [session]);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <LoadingPage />
    );
  }

  const onSubmit = async (data: FormData) => {
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
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage(error.response?.data?.error || "Erro ao cadastrar");
      } else {
        setMessage("Erro ao cadastrar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      {/* Card de Registro */}
      <section className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <article className="bg-white p-8 rounded-lg w-full max-w-md md:border border-lime-500">
          <div className="text-center mb-2 space-y-2">
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
                <p className="text-red-600 text-sm -mt-3">
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
                <p className="text-red-600 text-sm -mt-3">
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
                <p className="text-red-600 text-sm -mt-3">
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
                <p className="text-red-600 text-sm -mt-3">
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
              <span className="text-sm">
                Já possui uma conta?{" "}
                <Link className="text-blue-500 hover:underline" href={"/login"}>
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

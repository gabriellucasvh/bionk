"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GoogleBtn } from "@/components/buttons/button-google";
import LoadingPage from "@/components/layout/LoadingPage";
import { ForgotPasswordModal } from '@/components/modals/ForgotPasswordModal'; 
import { Button } from '@/components/ui/button'; 

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type FormData = z.infer<typeof schema>;

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false); 

  const { data: session, status } = useSession(); 
  useEffect(() => {
    if (session) { 
      // Lógica que não expõe os dados da sessão
    }
  }, [session]);
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "OAuthAccountNotLinked") {
      setMessage("Este e-mail já está cadastrado. Faça login com o método original ou use outro e-mail para o Google.");
    } else if (error) {
      // Handle other potential errors from URL if necessary
      setMessage("Ocorreu um erro. Tente novamente.");
    }

    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router, searchParams]);

  if (status === "loading") {
    return (
      <LoadingPage />
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
  const openForgotPasswordModal = () => setIsForgotPasswordModalOpen(true);
  const closeForgotPasswordModal = () => setIsForgotPasswordModalOpen(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <form
        className="bg-white p-8 rounded-lg w-full max-w-md md:border border-lime-500 relative z-10"
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
            {errors.email && <p className="text-red-600 text-sm -mt-3">{errors.email.message}</p>}
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
            {errors.password && <p className="text-red-600 text-sm -mt-3">{errors.password.message}</p>}
          </div>
          <div className="-mt-5 text-left">
            <Button
              type="button"
              variant="link"
              className="text-blue-500 text-sm hover:underline p-0 h-auto"
              onClick={openForgotPasswordModal} 
            >
              Esqueceu a senha?
            </Button>
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
          <span className="text-sm">
            Não possui uma conta? {" "}
            <Link className="text-blue-500 hover:underline" href={"/registro"}>Crie gratuitamente!</Link>
          </span>
        </div>
      </form>

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={closeForgotPasswordModal}
      />
    </div>
  );
}

export default Login;

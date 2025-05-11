"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { GoogleBtn } from "@/components/buttons/button-google";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import LoadingPage from "@/components/layout/LoadingPage";
import { Button } from "@/components/ui/button";

const emailSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "O código deve ter 6 dígitos").regex(/^\d{6}$/, "Código inválido, use apenas números"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type Stage = "email" | "otp" | "password" | "success";

function Register() {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleEmailSubmit: SubmitHandler<EmailFormData> = async (data) => {
    setLoading(true);
    setMessage(null);
    try {
      await axios.post("/api/auth/register", { email: data.email, stage: "request-otp" });
      setEmail(data.email);
      setStage("otp");
      setMessage({ type: 'success', text: "Código de verificação enviado para o seu e-mail." });
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage({ type: 'error', text: error.response?.data?.error || "Erro ao solicitar código." });
      } else {
        setMessage({ type: 'error', text: "Erro ao solicitar código." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit: SubmitHandler<OtpFormData> = async (data) => {
    setLoading(true);
    setMessage(null);
    try {
      await axios.post("/api/auth/register", { email, otp: data.otp, stage: "verify-otp" });
      setStage("password");
      setMessage({ type: 'success', text: "Código verificado com sucesso! Defina sua senha." });
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage({ type: 'error', text: error.response?.data?.error || "Erro ao verificar código." });
      } else {
        setMessage({ type: 'error', text: "Erro ao verificar código." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit: SubmitHandler<PasswordFormData> = async (data) => {
    setLoading(true);
    setMessage(null);
    try {
      await axios.post("/api/auth/register", { email, password: data.password, stage: "create-user" });
      setStage("success");
      setMessage({ type: 'success', text: "Conta criada com sucesso! Você será redirecionado para o login." });
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      if (error instanceof AxiosError) {
        setMessage({ type: 'error', text: error.response?.data?.error || "Erro ao criar conta." });
      } else {
        setMessage({ type: 'error', text: "Erro ao criar conta." });
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <LoadingPage />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <section className="w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <article className="bg-white p-8 rounded-lg w-full max-w-md md:border border-lime-500">
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-2xl font-bold text-center text-black">
              {stage === "email" && "Crie sua conta Bionk"}
              {stage === "otp" && "Verifique seu E-mail"}
              {stage === "password" && "Defina sua Senha"}
              {stage === "success" && "Registro Concluído!"}
            </h2>
            <p className="text-muted-foreground">
              {stage === "email" && "Comece personalizando seus links."}
              {stage === "otp" && `Enviamos um código de 6 dígitos para ${email}. Verifique sua caixa de entrada (e spam).`}
              {stage === "password" && "Escolha uma senha segura para sua conta."}
              {stage === "success" && "Você será redirecionado para a página de login em breve."}
            </p>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm text-center ${message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {stage === "email" && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <div>
                <Label className="block text-base font-semibold text-black">Seu email</Label>
                <Input
                  className="w-full px-4 py-3 border mt-1 mb-1 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
                  placeholder="Digite seu e-mail"
                  type="email"
                  {...emailForm.register("email")}
                  disabled={loading}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-red-600 text-sm">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 transition-colors duration-300 text-white text-lg font-bold py-3 px-6 rounded-md cursor-pointer">
                {loading ? "Enviando..." : "Continuar"}
              </Button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
              <div>
                <Label className="block text-base font-semibold text-black">Código de Verificação</Label>
                <Input
                  className="w-full px-4 py-3 border mt-1 mb-1 rounded-md focus-visible:border-lime-500 transition-colors duration-400 tracking-[0.3em] text-center"
                  placeholder="------"
                  type="text"
                  maxLength={6}
                  {...otpForm.register("otp")}
                  disabled={loading}
                />
                {otpForm.formState.errors.otp && (
                  <p className="text-red-600 text-sm">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 transition-colors duration-300 text-white text-lg font-bold py-3 px-6 rounded-md cursor-pointer">
                {loading ? "Verificando..." : "Verificar Código"}
              </Button>
              <Button type="button" variant="link" onClick={() => { setStage('email'); setMessage(null); emailForm.reset(); }} disabled={loading}>
                Usar outro e-mail
              </Button>
            </form>
          )}

          {stage === "password" && (
            <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
              <div>
                <Label className="block text-base font-semibold text-black">Sua senha</Label>
                <div className="relative mt-1">
                  <Input
                    className="w-full px-4 py-3 border mb-1 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
                    placeholder="Digite sua senha"
                    type={showPassword ? "text" : "password"}
                    {...passwordForm.register("password")}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordForm.formState.errors.password && (
                  <p className="text-red-600 text-sm">{passwordForm.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <Label className="block text-base font-semibold text-black">Confirmar senha</Label>
                <div className="relative mt-1">
                  <Input
                    className="w-full px-4 py-3 border mb-1 rounded-md focus-visible:border-lime-500 transition-colors duration-400"
                    placeholder="Confirme sua senha"
                    type={showConfirmPassword ? "text" : "password"}
                    {...passwordForm.register("confirmPassword")}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-red-600 text-sm">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 transition-colors duration-300 text-white text-lg font-bold py-3 px-6 rounded-md cursor-pointer">
                {loading ? "Salvando..." : "Criar Conta"}
              </Button>
            </form>
          )}

          {stage !== "success" && (
            <>
              <div className="flex flex-col items-center justify-center space-y-4 mt-6">
                <span className="w-full flex items-center justify-center h-px bg-gray-300">
                  <span className="px-4 bg-white text-muted-foreground">ou</span>
                </span>
                <GoogleBtn />
              </div>
              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">
                  Já possui uma conta?{" "}
                  <Link className="text-blue-500 hover:underline" href={"/login"} onClick={() => setMessage(null)}>
                    Faça o Login
                  </Link>
                </span>
              </div>
            </>
          )}
          {stage === "email" && (
             <div className="mt-4">
                <p className="text-xs text-muted-foreground text-center">
                  Ao continuar, você aceita os nossos{" "}
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
          )}
        </article>
      </section>
    </main>
  );
}

export default Register;

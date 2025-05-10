// src/app/(private)/profile/change-email/change-email-form.client.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ToastMessage from "@/components/ToastMessage"; 

const changeEmailSchema = z.object({
  newEmail: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  currentPassword: z.string().min(6, { message: "A senha atual deve ter pelo menos 6 caracteres." }),
});

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export default function ChangeEmailForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
  });

  const onSubmit = async (data: ChangeEmailFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/change-email-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Falha ao solicitar alteração de e-mail.");
      }

      setMessage({ type: 'success', text: result.message || "Um e-mail de verificação foi enviado para o seu novo endereço. Por favor, verifique sua caixa de entrada." });
      reset();

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Ocorreu um erro. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Alterar E-mail</CardTitle>
        <CardDescription>
          Insira seu novo e-mail e sua senha atual para confirmar a alteração.
          Um link de verificação será enviado para o novo endereço.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="newEmail">Novo E-mail</Label>
            <Input
              id="newEmail"
              type="email"
              {...register("newEmail")}
              placeholder="seu.novo.email@exemplo.com"
              className={errors.newEmail ? "border-red-500" : ""}
            />
            {errors.newEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.newEmail.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              placeholder="••••••••"
              className={errors.currentPassword ? "border-red-500" : ""}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          {message && (
            <ToastMessage
              variant={message.type}
              message={message.text}
              onClose={() => setMessage(null)}
            />
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? "Enviando..." : "Solicitar Alteração de E-mail"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
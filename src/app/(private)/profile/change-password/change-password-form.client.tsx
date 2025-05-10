// src/app/(private)/profile/change-password/change-password-form.client.tsx
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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, { message: "A senha atual deve ter pelo menos 6 caracteres." }),
  newPassword: z.string().min(6, { message: "A nova senha deve ter pelo menos 6 caracteres." }),
  confirmNewPassword: z.string().min(6, { message: "A confirmação da nova senha deve ter pelo menos 6 caracteres." }),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmNewPassword"], 
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Falha ao alterar a senha.");
      }

      setMessage({ type: 'success', text: result.message || "Senha alterada com sucesso!" });
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
        <CardTitle>Alterar Senha</CardTitle>
        <CardDescription>
          Insira sua senha atual e a nova senha para atualizar suas credenciais de acesso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          <div>
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              placeholder="••••••••"
              className={errors.newPassword ? "border-red-500" : ""}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              {...register("confirmNewPassword")}
              placeholder="••••••••"
              className={errors.confirmNewPassword ? "border-red-500" : ""}
            />
            {errors.confirmNewPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword.message}</p>
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
            {isLoading ? "Alterando..." : "Alterar Senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
// src/app/(public)/reset-password/[token]/formulario-reset.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define the form schema
const schema = z
  .object({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'], // Apply error to confirmPassword field
  });

// Infer the TypeScript type from the schema
type FormData = z.infer<typeof schema>;

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        password: data.password,
      });
      setMessage(response.data.message || 'Senha redefinida com sucesso!');
      setIsSuccess(true);
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setIsSuccess(false);
      if (error instanceof AxiosError) {
        setMessage(error.response?.data?.error || 'Erro ao redefinir a senha.');
      } else {
        setMessage('Ocorreu um erro inesperado.');
      }
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="bg-white p-8 rounded-lg w-full max-w-md md:border border-lime-500">
      <div className="text-center mb-6 space-y-2">
        <h2 className="text-2xl font-bold text-center text-black">
          Redefinir Senha
        </h2>
        <p className="text-muted-foreground">
          Digite sua nova senha abaixo.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="block text-base font-semibold text-black">
            Nova Senha
          </Label>
          <div className="relative">
            <Input
              className="w-full px-4 py-3 border rounded-md focus-visible:border-lime-500 transition-colors duration-400"
              placeholder="Digite sua nova senha"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              disabled={loading || isSuccess}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-4 text-gray-500"
              disabled={loading || isSuccess}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Label className="block text-base font-semibold text-black">
            Confirmar Nova Senha
          </Label>
          <div className="relative">
            <Input
              className="w-full px-4 py-3 border rounded-md focus-visible:border-lime-500 transition-colors duration-400"
              placeholder="Confirme sua nova senha"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              disabled={loading || isSuccess}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 px-4 text-gray-500"
              disabled={loading || isSuccess}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading || isSuccess}
          className="w-full text-white text-lg font-bold py-3 px-6 bg-green-500 hover:bg-green-600 transition-colors duration-300 rounded-md disabled:opacity-50"
        >
          {loading ? 'Redefinindo...' : 'Redefinir Senha'}
        </Button>

        {message && (
          <div
            className={`mt-4 p-3 rounded-md text-center text-sm font-medium ${isSuccess ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'}`}
          >
            {message}
            {isSuccess && <p className="text-xs mt-1">Você será redirecionado para o login...</p>}
          </div>
        )}
      </form>
    </article>
  );
}
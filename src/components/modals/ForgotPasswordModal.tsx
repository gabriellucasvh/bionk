// src/components/modals/ForgotPasswordModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { Mail, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().email('Por favor, insira um e-mail válido.'),
});

type FormData = z.infer<typeof schema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COOLDOWN_SECONDS = 60;

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  useEffect(() => {
    if (!isOpen) {
      reset(); 
      setMessage('');
      setIsSuccess(false);
      setLoading(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FormData) => {
    if (cooldown > 0) return; 

    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await axios.post('/api/auth/request-password-reset', {
        email: data.email,
      });
      setMessage(response.data.message || 'Link de redefinição enviado com sucesso!');
      setIsSuccess(true);
      setCooldown(COOLDOWN_SECONDS); 
      // Optionally close modal after success
      // setTimeout(onClose, 3000);
    } catch (error) {
      setIsSuccess(false);
      if (error instanceof AxiosError) {
        setMessage(error.response?.data?.error || 'Erro ao solicitar redefinição.');
      } else {
        setMessage('Ocorreu um erro inesperado.');
      }
      console.error('Request password reset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Esqueceu sua senha?</DialogTitle>
          <DialogDescription>
            Digite seu e-mail abaixo para receber um link de redefinição de senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email-forgot" className="text-right">
              Email
            </Label>
            <div className="col-span-3 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email-forgot"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                {...register('email')}
                disabled={loading || cooldown > 0 || isSuccess}
              />
            </div>
          </div>
          {errors.email && (
            <p className="col-span-4 text-red-600 text-sm text-center -mt-2">
              {errors.email.message}
            </p>
          )}

          {message && (
            <div
              className={`col-span-4 mt-2 p-3 rounded-md text-center text-sm font-medium ${isSuccess ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'}`}
            >
              {message}
            </div>
          )}

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading || cooldown > 0 || isSuccess}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
              ) : cooldown > 0 ? (
                `Aguarde ${cooldown}s`
              ) : isSuccess ? (
                'Enviado!'
              ) : (
                'Enviar Link'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// src/app/(private)/profile/verify-new-email/verify-new-email.client.tsx
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function VerifyNewEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado ou inválido.');
      return;
    }

    const verifyToken = async () => {
      setStatus('loading');
      try {
        const response = await fetch('/api/profile/verify-new-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Falha ao verificar o e-mail.');
        }

        setStatus('success');
        setMessage(result.message || 'Seu novo e-mail foi verificado com sucesso!');
        // Opcional: redirecionar para o dashboard ou página de configurações após um tempo
        setTimeout(() => {
          router.push('/dashboard/configs');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Ocorreu um erro ao verificar seu e-mail.');
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {status === 'loading' && 'Verificando seu Novo E-mail...'}
          {status === 'success' && 'E-mail Verificado!'}
          {status === 'error' && 'Erro na Verificação'}
        </CardTitle>
        <CardDescription>
          {status === 'loading' && 'Aguarde um momento enquanto processamos sua solicitação.'}
          {status === 'success' && message}
          {status === 'error' && message}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6">
        {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
        {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
        {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}

        {(status === 'success' || status === 'error') && (
          <Link href="/dashboard/configs" passHref>
            <Button variant="outline">
              Ir para Configurações
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
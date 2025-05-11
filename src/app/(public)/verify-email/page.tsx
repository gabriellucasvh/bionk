'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [message, setMessage] = useState<string>('Verificando seu e-mail...');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token) {
      setError('Token de verificação não encontrado na URL.');
      setIsLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Falha ao verificar o e-mail.');
        } else {
          setMessage(data.message || 'E-mail verificado com sucesso!');
          // Redirecionar para a página de login após um pequeno atraso
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (e) {
        console.error('Erro na verificação:', e);
        setError('Ocorreu um erro ao tentar verificar seu e-mail.');
      }
      setIsLoading(false);
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Verificação de E-mail
        </h1>
        {isLoading && (
          <div className="flex justify-center items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
            <p className="text-gray-700 dark:text-gray-300">{message}</p>
          </div>
        )}
        {!isLoading && error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
            <span className="font-medium">Erro!</span> {error}
          </div>
        )}
        {!isLoading && !error && (
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800" role="alert">
            <span className="font-medium">Sucesso!</span> {message}
          </div>
        )}
        {!isLoading && (
          <div className="text-center">
            <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
              Ir para o Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
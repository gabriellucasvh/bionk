import { Suspense } from 'react';
import ResetPasswordForm from './formulario-reset';
import LoadingPage from '@/components/layout/LoadingPage';

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<LoadingPage />}>
        <ResetPasswordForm token={token} />
      </Suspense>
    </div>
  );
}

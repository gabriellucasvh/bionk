// src/app/(private)/profile/verify-new-email/page.tsx
import { Suspense } from "react";
import VerifyNewEmailClient from "./verify-new-email.client";

export default function VerifyNewEmailPage() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
      <Suspense fallback={<div>Carregando...</div>}>
        <VerifyNewEmailClient />
      </Suspense>
    </main>
  );
}
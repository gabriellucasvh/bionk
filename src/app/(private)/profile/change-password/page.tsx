// src/app/(private)/profile/change-password/page.tsx
import ChangePasswordForm from "./change-password-form.client";

export default function ChangePasswordPage() {
  return (
    <main className="container mx-auto max-w-md py-12">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Alterar Senha
      </h1>
      <ChangePasswordForm />
    </main>
  );
}
// src/app/(private)/profile/change-email/page.tsx
import ChangeEmailForm from "./change-email-form.client";

export default function ChangeEmailPage() {
  return (
    <main className="container mx-auto max-w-md py-12">
      <h1 className="mb-8 text-center text-3xl font-bold">
        Alterar Endereço de E-mail
      </h1>
      <ChangeEmailForm />
    </main>
  );
}
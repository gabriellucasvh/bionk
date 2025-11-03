"use client";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const REGEX_UPPERCASE = /[A-Z]/;
const REGEX_LOWERCASE = /[a-z]/;
const REGEX_DIGIT = /\d/;
const REGEX_REPEAT = /([A-Za-z0-9])\1{3,}/;

function validatePasswordStrength(pwd: string): string[] {
  const errs: string[] = [];
  if (pwd.length < 9) {
    errs.push("A senha deve ter pelo menos 9 caracteres.");
  }
  if (pwd.length > 64) {
    errs.push("A senha deve ter no máximo 64 caracteres.");
  }
  if (!REGEX_UPPERCASE.test(pwd)) {
    errs.push("Inclua pelo menos 1 letra maiúscula.");
  }
  if (!REGEX_LOWERCASE.test(pwd)) {
    errs.push("Inclua pelo menos 1 letra minúscula.");
  }
  if (!REGEX_DIGIT.test(pwd)) {
    errs.push("Inclua pelo menos 1 número.");
  }
  const lower = pwd.toLowerCase();
  const seqs = [
    "123456",
    "234567",
    "345678",
    "456789",
    "012345",
    "abcdef",
    "bcdefg",
    "cdefgh",
    "defghi",
    "uvwxyz",
    "qwerty",
    "asdfgh",
    "zxcvbn",
  ];
  if (seqs.some((s) => lower.includes(s))) {
    errs.push("Evite sequências óbvias.");
  }
  if (REGEX_REPEAT.test(pwd)) {
    errs.push("Evite repetição excessiva.");
  }
  return errs;
}

export default function NovaSenhaClient({ token }: { token: string }) {
  const router = useRouter();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const strengthErrors = validatePasswordStrength(pwd);
  const canSubmit = token.length > 0 && strengthErrors.length === 0 && pwd === confirm;

  async function handleReset() {
    if (!canSubmit) {
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: pwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Senha redefinida com sucesso. Redirecionando para o login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setMessage(
          typeof data.error === "string" ? data.error : "Não foi possível redefinir a senha."
        );
      }
    } catch {
      setMessage("Erro interno. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-semibold text-2xl">Criar nova senha</h1>
      <p className="mt-2 text-muted-foreground text-sm">Defina uma senha forte para sua conta.</p>
      <div className="mt-6 w-full space-y-2">
        <Label htmlFor="pwd">Nova senha</Label>
        <div className="relative">
          <Input
            aria-invalid={strengthErrors.length > 0 && pwd.length > 0}
            id="pwd"
            maxLength={64}
            onChange={(e) => setPwd(e.target.value)}
            type={showPwd ? "text" : "password"}
            value={pwd}
          />
          <button
            aria-label={showPwd ? "Ocultar senha" : "Exibir senha"}
            className="-translate-y-1/2 absolute top-1/2 right-2"
            onClick={() => {
              setShowPwd(!showPwd);
            }}
            type="button"
          >
            {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div className="mt-4 w-full space-y-2">
        <Label htmlFor="confirm">Confirmar nova senha</Label>
        <div className="relative">
          <Input
            aria-invalid={confirm.length > 0 && confirm !== pwd}
            id="confirm"
            maxLength={64}
            onChange={(e) => setConfirm(e.target.value)}
            type={showConfirm ? "text" : "password"}
            value={confirm}
          />
          <button
            aria-label={showConfirm ? "Ocultar confirmação" : "Exibir confirmação"}
            className="-translate-y-1/2 absolute top-1/2 right-2"
            onClick={() => {
              setShowConfirm(!showConfirm);
            }}
            type="button"
          >
            {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {strengthErrors.length > 0 && (
        <ul className="mt-3 mr-auto text-start text-destructive text-sm">
          {strengthErrors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      {message && <p className="mt-4 text-sm">{message}</p>}
      <div className="mt-6 flex w-full gap-3">
        <BaseButton disabled={!canSubmit || loading} fullWidth onClick={handleReset}>
          {loading ? "Redefinindo..." : "Salvar nova senha"}
        </BaseButton>
      </div>
    </div>
  );
}
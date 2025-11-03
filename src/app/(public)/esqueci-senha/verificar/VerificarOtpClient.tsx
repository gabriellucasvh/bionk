"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BaseButton } from "@/components/buttons/BaseButton";
import OTPInputCustom from "@/components/ui/otp-input-custom";

export default function VerificarOtpClient({
  initialLogin,
}: {
  initialLogin: string;
}) {
  const router = useRouter();
  const login = initialLogin;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [otpCooldownTimer, setOtpCooldownTimer] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isOtpComplete = otp.replace(/\D/g, "").length === 6;

  useEffect(() => {
    if (!login) {
      router.push("/esqueci-senha");
    }
  }, [login, router]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, []);

  function startOtpCooldownTimer(initialSeconds = 30) {
    setOtpCooldownTimer(initialSeconds);
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = setInterval(() => {
      setOtpCooldownTimer((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleVerify() {
    if (!isOtpComplete) {
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, otp }),
      });
      const data = await res.json();
      if (res.ok && typeof data.token === "string") {
        router.push(
          `/esqueci-senha/nova-senha?token=${encodeURIComponent(data.token)}`
        );
      } else {
        setMessage(
          typeof data.error === "string" ? data.error : "Código inválido ou expirado."
        );
      }
    } catch {
      setMessage("Erro interno. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!login) {
      return;
    }
    setResending(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          typeof data.message === "string"
            ? data.message
            : "Código reenviado. Verifique seu e-mail."
        );
        startOtpCooldownTimer(30);
      } else {
        setMessage(
          typeof data.error === "string"
            ? data.error
            : "Não foi possível reenviar o código."
        );
      }
    } catch {
      setMessage("Erro interno. Tente novamente mais tarde.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto flex h-dvh w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="font-semibold text-2xl">Verifique seu código de acesso</h1>
      <p className="mt-2 text-muted-foreground text-sm">Digite o código enviado ao seu e-mail.</p>
      <div className="mt-6 w-full space-y-2">
        <div className="flex justify-center">
          <OTPInputCustom
            aria-label="Código de verificação"
            autoFocus={!loading}
            disabled={loading}
            onChange={(value) => setOtp(value)}
            separatorIndex={-1}
            value={otp}
          />
        </div>
      </div>
      {message && <p className="mt-4 text-sm">{message}</p>}
      <div className="mt-6 flex w-full max-w-lg flex-col justify-center gap-3">
        <div className="flex items-center justify-center gap-2">
          <p className="text-muted-foreground text-sm">Não recebeu o código? </p>
          <button
            className="mx-0 border-none px-0 py-0 text-sm"
            disabled={resending || otpCooldownTimer > 0}
            onClick={handleResend}
            type="button"
          >
            {otpCooldownTimer > 0
              ? `Reenviar código em ${otpCooldownTimer}s`
              : "Reenviar código"}
          </button>
        </div>
        <BaseButton disabled={!isOtpComplete || loading} fullWidth onClick={handleVerify}>
          {loading ? "Verificando..." : "Verificar"}
        </BaseButton>
      </div>
    </div>
  );
}
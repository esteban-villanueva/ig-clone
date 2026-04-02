"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface RegisterFormProps {
  onToggleMode?: () => void;
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ─── Logic unchanged ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerAction(null, formData);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Account created! Please log in.");
        if (onToggleMode) onToggleMode();
        else router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-[420px]">
      {/* Card */}
      <div
        className="rounded-3xl p-8 sm:p-10"
        style={{
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="mb-2"
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: "2rem",
              fontWeight: 800,
              lineHeight: 1.1,
              color: "var(--landing-heading)",
              letterSpacing: "-0.01em",
            }}
          >
            Creá tu cuenta
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--landing-body)" }}
          >
            Empezá a compartir tus momentos en minutos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error message */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#dc2626",
              }}
            >
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-xs font-semibold tracking-wide uppercase"
              style={{ color: "var(--landing-muted)" }}
            >
              Nombre
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Tu nombre"
              autoComplete="name"
              required
              disabled={isLoading}
              className="h-11 rounded-xl border-0 bg-white/60 text-sm shadow-sm ring-1 ring-black/10 focus-visible:ring-2 focus-visible:ring-pink-400/60 transition-all placeholder:text-zinc-400"
              style={{ color: "var(--landing-heading)" }}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-semibold tracking-wide uppercase"
              style={{ color: "var(--landing-muted)" }}
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vos@ejemplo.com"
              autoComplete="email"
              required
              disabled={isLoading}
              className="h-11 rounded-xl border-0 bg-white/60 text-sm shadow-sm ring-1 ring-black/10 focus-visible:ring-2 focus-visible:ring-pink-400/60 transition-all placeholder:text-zinc-400"
              style={{ color: "var(--landing-heading)" }}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold tracking-wide uppercase"
              style={{ color: "var(--landing-muted)" }}
            >
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={isLoading}
              className="h-11 rounded-xl border-0 bg-white/60 text-sm shadow-sm ring-1 ring-black/10 focus-visible:ring-2 focus-visible:ring-pink-400/60 transition-all placeholder:text-zinc-400"
              style={{ color: "var(--landing-heading)" }}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-semibold tracking-wide uppercase"
              style={{ color: "var(--landing-muted)" }}
            >
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={isLoading}
              className="h-11 rounded-xl border-0 bg-white/60 text-sm shadow-sm ring-1 ring-black/10 focus-visible:ring-2 focus-visible:ring-pink-400/60 transition-all placeholder:text-zinc-400"
              style={{ color: "var(--landing-heading)" }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full h-11 mt-2
              rounded-xl
              text-sm font-semibold
              text-white
              transition-all duration-200
              hover:opacity-90 hover:scale-[1.01]
              active:scale-[0.99]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
            "
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)",
              boxShadow: "0 4px 16px rgba(236, 72, 153, 0.3)",
            }}
          >
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {/* Footer */}
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--landing-muted)" }}
        >
          ¿Ya tenés cuenta?{" "}
          {onToggleMode ? (
            <button
              onClick={onToggleMode}
              className="hover:opacity-70 transition-opacity font-semibold underline underline-offset-2 disabled:opacity-50"
              style={{ color: "var(--landing-body)" }}
              disabled={isLoading}
            >
              Iniciar sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
              style={{ color: "var(--landing-body)" }}
            >
              Iniciar sesión
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}

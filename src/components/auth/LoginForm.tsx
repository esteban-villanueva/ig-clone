"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface LoginFormProps {
  onToggleMode?: () => void;
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ─── Logic unchanged ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
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
            Bienvenido de vuelta
          </h1>
          <p
            className="text-sm"
            style={{ color: "var(--landing-body)" }}
          >
            Ingresá tu email y contraseña para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              type="email"
              placeholder="vos@ejemplo.com"
              autoComplete="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              minLength={6}
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Footer */}
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--landing-muted)" }}
        >
          ¿No tenés cuenta?{" "}
          {onToggleMode ? (
            <button
              onClick={onToggleMode}
              className="hover:opacity-70 transition-opacity font-semibold underline underline-offset-2 disabled:opacity-50"
              style={{ color: "var(--landing-body)" }}
              disabled={isLoading}
            >
              Registrarse
            </button>
          ) : (
            <Link
              href="/register"
              className="font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
              style={{ color: "var(--landing-body)" }}
            >
              Registrarse
            </Link>
          )}
        </p>
      </div>
    </div>
  );
}

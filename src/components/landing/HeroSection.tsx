"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GradientWord } from "@/components/landing/atoms/GradientWord";
import { EyebrowLabel } from "@/components/landing/atoms/EyebrowLabel";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ?? "localhost:3000";

export function HeroSection() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeForm, setActiveForm] = useState<"login" | "register">("register");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsSubmitting(true);
    router.push(`/register?username=${encodeURIComponent(username.trim())}`);
  };

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-[var(--landing-section-pt)] pb-20">
      {/* Eyebrow */}
      {/*       <div className="animate-fade-up" style={{ animationDelay: "0.05s" }}>
        <EyebrowLabel>✦ Tu espacio. Tu historia. Sin límites.</EyebrowLabel>
      </div> */}

      {/* H1 */}
      <h1
        className="animate-fade-up mt-6 max-w-3xl leading-[1.08] tracking-tight"
        style={{
          fontSize: "clamp(2.8rem, 7vw, 5.2rem)",
          color: "var(--landing-heading)",
          animationDelay: "0.15s",
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontWeight: 800,
        }}
      >
        Tu lugar para{" "}
        <GradientWord>compartir.</GradientWord>
      </h1>

      {/* Auth Card Integrated */}
      <div
        id="auth-section"
        className="animate-fade-up mt-10 w-full max-w-md scroll-mt-24 min-h-[600px] flex items-center justify-center"
        style={{ animationDelay: "0.35s" }}
      >
        <div className="w-full relative z-10">
          {activeForm === "login" ? (
            <LoginForm onToggleMode={() => setActiveForm("register")} />
          ) : (
            <RegisterForm onToggleMode={() => setActiveForm("login")} />
          )}
        </div>
      </div>
    </section>
  );
}

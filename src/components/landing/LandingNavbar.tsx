"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-in-out
        ${scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-black/5 shadow-sm"
          : "bg-transparent"
        }
      `}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-bold tracking-tight"
          style={{ color: "var(--landing-heading)" }}
        >
          {/* Simple camera icon as logo mark */}
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 via-pink-500 to-violet-500 text-white text-xs">
            ✦
          </span>
          <span>IG</span>
        </Link>

        {/* Badge center */}
        {/*         <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-black/8 text-xs font-medium" style={{ color: "var(--landing-body)" }}>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold tracking-wide">
            Beta
          </span>
          <span>Ahora disponible · Creá tu cuenta gratis</span>
        </div> */}

        {/* Auth links */}
        {/* <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--landing-body)" }}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="
              landing-gradient-border
              inline-flex items-center justify-center
              px-4 py-2 rounded-full
              text-sm font-semibold
              transition-all duration-200
              hover:shadow-md hover:shadow-pink-200/40
              hover:scale-[1.03]
            "
            style={{ color: "var(--landing-heading)" }}
          >
            Registrarse
          </Link>
        </div> */}
      </nav>
    </header>
  );
}

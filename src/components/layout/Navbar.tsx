"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { SearchBar } from "@/components/layout/SearchBar";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "rgba(0,0,0,0.07)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 gap-4">
        {/* Logo */}
        <Link
          href="/feed"
          className="flex items-center gap-2 shrink-0"
        >
          <span
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs"
            style={{
              background: "linear-gradient(135deg, #F59E0B, #EC4899, #8B5CF6)",
            }}
          >
            ✦
          </span>
          <span
            className="text-base font-bold tracking-tight hidden sm:block"
            style={{ color: "var(--landing-heading, #1a1a2e)" }}
          >
            ig clone
          </span>
        </Link>

        {/* Search — only when authenticated */}
        {session && (
          <div className="flex-1 max-w-xs">
            <SearchBar />
          </div>
        )}

        {/* Right side */}
        {status === "loading" ? (
          <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-100 shrink-0" />
        ) : session ? (
          <div className="flex items-center gap-3 shrink-0">
            <Link href={`/profile/${session.user.id}`}>
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-pink-300 transition-all">
                <AvatarImage src={session.user?.image ?? undefined} />
                <AvatarFallback
                  className="text-xs font-semibold text-white"
                  style={{
                    background: "linear-gradient(135deg, #F59E0B, #EC4899)",
                  }}
                >
                  {getInitials(session.user?.name ?? null)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg px-3 h-8"
            >
              Salir
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/login" />}
              className="text-sm text-zinc-600 hover:text-zinc-900 rounded-lg"
            >
              Iniciar sesión
            </Button>
            <Link
              href="/register"
              className="
                landing-gradient-border
                inline-flex items-center justify-center
                px-4 py-1.5 rounded-full
                text-sm font-semibold
                transition-all duration-200
                hover:scale-[1.03] hover:shadow-sm hover:shadow-pink-200/50
              "
              style={{ color: "var(--landing-heading, #1a1a2e)" }}
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

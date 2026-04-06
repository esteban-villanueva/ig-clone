"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { SearchBar } from "@/components/layout/SearchBar";
import { NotificationsDropdown } from "@/components/layout/NotificationsDropdown";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <div className="sticky top-4 z-40 mx-auto w-full px-4 sm:px-6 max-w-5xl">
      <nav
        className="w-full rounded-[2rem] border shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderColor: "rgba(255, 255, 255, 0.6)",
        }}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4 sm:gap-6 relative">
          {/* Lado izquierdo: Logo + Search */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 flex-1">
            <Link
              href="/feed"
              className="flex items-center shrink-0 group z-10"
              title="Ir al inicio"
            >
              <span
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white text-base shadow-[0_0_15px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-500 ease-out group-hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #F59E0B, #EC4899, #8B5CF6)",
                }}
              >
                ✦
              </span>
            </Link>

            {/* Search */}
            {session && (
              <div className="w-full max-w-[160px] sm:max-w-[200px] md:max-w-[240px] transition-all">
                <SearchBar />
              </div>
            )}
          </div>

          {/* Lado derecho */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0 z-10">
            {status === "loading" ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-black/5" />
            ) : session ? (
              <div className="flex items-center gap-2 sm:gap-4 bg-black/5 rounded-full px-2 py-1.5 border border-white/30 shadow-sm">
                <NotificationsDropdown userId={session.user.id} />
                
                <Link href={`/profile/${session.user.id}`} className="shrink-0 relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 via-pink-500 to-violet-500 rounded-full blur-[6px] opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-white shadow-sm group-hover:scale-[1.02] transition-all duration-300 relative z-10">
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
                
                <div className="w-[1px] h-5 bg-black/10 mx-1 hidden sm:block"></div>
                
                <button
                  type="button"
                  className="flex items-center justify-center p-2 rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Salir"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </div>
  );
}
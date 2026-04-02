"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { SearchBar } from "@/components/layout/SearchBar";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Hide navbar on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          Ig Clone
        </Link>

        {session && <SearchBar />}

        {status === "loading" ? (
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
        ) : session ? (
          <div className="flex items-center gap-4">
            <Link href={`/profile/${session.user.id}`}>
              <Avatar className="h-7 w-7 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={session.user?.image ?? undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(session.user?.name ?? null)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Log in
            </Button>
            <Button size="sm" render={<Link href="/register" />}>
              Sign up
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

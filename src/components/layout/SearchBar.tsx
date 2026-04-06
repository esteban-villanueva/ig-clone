"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { searchUsers } from "@/actions/search";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserResult {
  id: string;
  name: string | null;
  image: string | null;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const data = await searchUsers(query);
      setResults(data);
      setIsLoading(false);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback(() => {
    setQuery("");
    setIsOpen(false);
  }, []);

  const showDropdown =
    isOpen && (results.length > 0 || (query.length >= 2 && !isLoading));

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search users…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="h-9 w-full rounded-full border border-black/5 bg-black/5 pl-9 pr-3 text-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pink-400 transition-all"
        />
      </div>

      {showDropdown && (
        <div className="fixed inset-x-4 top-17 mx-auto max-w-[calc(100vw-2rem)] md:absolute md:inset-x-auto md:left-0 md:top-full md:mt-2 md:w-80 rounded-2xl border bg-white/95 backdrop-blur-xl p-1 shadow-2xl z-50 transform origin-top md:origin-top-left transition-all animate-in fade-in slide-in-from-top-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              Searching…
            </div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                onClick={handleSelect}
                className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{user.name ?? "Unnamed"}</span>
              </Link>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

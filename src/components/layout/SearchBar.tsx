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
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-md border bg-popover p-1 shadow-md">
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

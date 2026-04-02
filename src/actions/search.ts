"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function searchUsers(query: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim();

  const users = await db.user.findMany({
    where: {
      name: { contains: trimmed, mode: "insensitive" },
      NOT: { id: session.user.id },
    },
    select: { id: true, name: true, image: true },
    take: 10,
    orderBy: { name: "asc" },
  });

  return users;
}

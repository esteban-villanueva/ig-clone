"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleFollow(
  targetUserId: string
): Promise<{ following: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const followerId = session.user.id;

  if (followerId === targetUserId) {
    throw new Error("You cannot follow yourself");
  }

  const existing = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: targetUserId,
      },
    },
  });

  if (existing) {
    await db.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUserId,
        },
      },
    });
    revalidatePath("/profile/[id]");
    return { following: false };
  }

  await db.follow.create({
    data: {
      followerId,
      followingId: targetUserId,
    },
  });

  revalidatePath("/profile/[id]");
  return { following: true };
}

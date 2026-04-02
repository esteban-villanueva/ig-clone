"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleLike(postId: string): Promise<{ liked: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const existing = await db.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (existing) {
    await db.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
    revalidatePath("/");
    return { liked: false };
  }

  await db.like.create({
    data: {
      postId,
      userId,
    },
  });

  revalidatePath("/");
  return { liked: true };
}

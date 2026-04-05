"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

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

  const post = await db.post.findUnique({
    where: { id: postId },
    select: { authorId: true }
  });

  await db.like.create({
    data: {
      postId,
      userId,
    },
  });

  if (post && post.authorId !== userId) {
    const notification = await db.notification.create({
      data: {
        type: "LIKE",
        issuerId: userId,
        recipientId: post.authorId,
        postId,
      },
      include: {
        issuer: { select: { id: true, name: true, image: true } },
        post: { select: { id: true, imageUrl: true } },
      }
    });

    try {
      await pusherServer.trigger(`private-${post.authorId}`, 'new:notification', notification);
    } catch (error) {
      console.error("Pusher trigger error:", error);
    }
  }

  revalidatePath("/");
  return { liked: true };
}

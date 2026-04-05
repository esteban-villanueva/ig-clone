"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

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

  // TargetUserId != followerId Ya ha sido verificado arriba, pero por si acaso.
  if (followerId !== targetUserId) {
    const notification = await db.notification.create({
      data: {
        type: "FOLLOW",
        issuerId: followerId,
        recipientId: targetUserId,
      },
      include: {
        issuer: { select: { id: true, name: true, image: true } },
      }
    });

    try {
      await pusherServer.trigger(`private-${targetUserId}`, 'new:notification', notification);
    } catch (error) {
      console.error("Pusher trigger error:", error);
    }
  }

  revalidatePath("/profile/[id]");
  return { following: true };
}

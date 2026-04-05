"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

export async function addComment(postId: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to comment" };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { error: "Comment cannot be empty" };
  }
  if (trimmed.length > 500) {
    return { error: "Comment must be 500 characters or less" };
  }

  try {
    const comment = await db.comment.create({
      data: {
        postId,
        authorId: session.user.id,
        text: trimmed,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (post && post.authorId !== session.user.id) {
      const notification = await db.notification.create({
        data: {
          type: "COMMENT",
          issuerId: session.user.id,
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
    return {
      success: true,
      comment: {
        id: comment.id,
        text: comment.text,
        author: {
          name: comment.author.name,
          image: comment.author.image,
        },
        createdAt: comment.createdAt,
      },
    };
  } catch (error) {
    console.error("Failed to add comment:", error);
    return { error: "Failed to add comment. Please try again." };
  }
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to delete a comment" };
  }

  try {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { error: "Comment not found" };
    }

    if (comment.authorId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    await db.comment.delete({
      where: { id: commentId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { error: "Failed to delete comment." };
  }
}

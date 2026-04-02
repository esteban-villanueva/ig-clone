"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

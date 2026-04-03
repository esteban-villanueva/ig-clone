"use server";

import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPostDetail(postId: string) {
  const session = await auth();
  const userId = session?.user?.id;

  const post = await db.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { likes: true, comments: true },
      },
      likes: userId
        ? {
            where: { userId },
            select: { userId: true },
          }
        : false,
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    caption: post.caption,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      name: post.author.name,
      image: post.author.image,
    },
    comments: post.comments.map((c) => ({
      id: c.id,
      text: c.text,
      author: {
        id: c.author.id,
        name: c.author.name,
        image: c.author.image,
      },
      createdAt: c.createdAt,
    })),
    _count: post._count,
    likedByUser: post.likes.length > 0,
  };
}

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to create a post" };
  }

  const image = formData.get("image") as File | null;
  const caption = formData.get("caption") as string;

  if (!image || image.size === 0) {
    return { error: "Image is required" };
  }

  if (!image.type.startsWith("image/")) {
    return { error: "Only image files are allowed" };
  }

  try {
    const imageUrl = await uploadImage(image);

    await db.post.create({
      data: {
        caption,
        imageUrl,
        authorId: session.user.id,
      },
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { error: "Failed to create post. Please try again." };
  }
}

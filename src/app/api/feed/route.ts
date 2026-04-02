import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FeedResponse, FeedPost } from "@/lib/feed";

const DEFAULT_LIMIT = 20;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const limit = DEFAULT_LIMIT;

  const posts = await db.post.findMany({
    where: {
      author: {
        followers: {
          some: {
            followerId: session.user.id,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit + 1,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
      likes: {
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      },
    },
  });

  const hasNextPage = posts.length > limit;
  const items = hasNextPage ? posts.slice(0, -1) : posts;
  const nextCursor = hasNextPage ? items[items.length - 1]?.id ?? null : null;

  const feedPosts: FeedPost[] = items.map((post) => ({
    id: post.id,
    caption: post.caption,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    author: post.author,
    _count: post._count,
    likedByUser: post.likes.length > 0,
  }));

  const response: FeedResponse = {
    posts: feedPosts,
    nextCursor,
    hasNextPage,
  };

  return NextResponse.json(response);
}

import { db } from "./db";

export interface FeedPost {
  id: string;
  caption: string | null;
  imageUrl: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  likedByUser: boolean;
}

export interface FeedResponse {
  posts: FeedPost[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export function parseCursor(searchParams: URLSearchParams): string | null {
  return searchParams.get("cursor");
}

const DEFAULT_LIMIT = 20;

export async function getFeed({
  cursor,
  limit = DEFAULT_LIMIT,
  userId,
}: {
  cursor: string | null;
  limit?: number;
  userId: string;
}): Promise<FeedResponse> {
  const posts = await db.post.findMany({
    where: {
      OR: [
        // Posts from users I follow
        {
          author: {
            followings: {
              some: {
                followerId: userId,
              },
            },
          },
        },
        // My own posts
        {
          authorId: userId,
        },
      ],
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
          userId,
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

  return {
    posts: feedPosts,
    nextCursor,
    hasNextPage,
  };
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  // 1. Get current user
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  // 2. Get all Follow records (where I'm the follower)
  const followsAsFollower = await db.follow.findMany({
    where: { followerId: userId },
    select: { id: true, followerId: true, followingId: true },
  });

  // 3. Get all Follow records (where I'm being followed)
  const followsAsFollowing = await db.follow.findMany({
    where: { followingId: userId },
    select: { id: true, followerId: true, followingId: true },
  });

  // 4. Get ALL posts in the system
  const allPosts = await db.post.findMany({
    select: { id: true, authorId: true, caption: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // 5. Get posts from followed users (same query as feed)
  const feedPosts = await db.post.findMany({
    where: {
      OR: [
        {
          author: {
            followings: {
              some: { followerId: userId },
            },
          },
        },
        { authorId: userId },
      ],
    },
    select: { id: true, authorId: true, caption: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // 6. Get all users
  const allUsers = await db.user.findMany({
    select: { id: true, name: true },
    take: 20,
  });

  return NextResponse.json({
    currentUser: user,
    followsAsFollower, // people I follow
    followsAsFollowing, // people who follow me
    allPosts,
    feedPosts,
    allUsers,
  });
}

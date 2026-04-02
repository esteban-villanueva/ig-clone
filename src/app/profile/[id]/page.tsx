import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostsGrid } from "@/components/profile/PostsGrid";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const { id: profileId } = await params;

  const user = await db.user.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      name: true,
      image: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          followings: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isOwnProfile = user.id === session.user.id;

  let isFollowing = false;
  if (!isOwnProfile) {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: profileId,
        },
      },
    });
    isFollowing = !!follow;
  }

  const posts = await db.post.findMany({
    where: { authorId: profileId },
    select: {
      id: true,
      imageUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader
        user={user}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
      />

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <PostsGrid posts={posts} />
      </div>
    </div>
  );
}

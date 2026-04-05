import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFeed } from "@/lib/feed";
import { CreatePostDialog } from "@/components/upload/CreatePostDialog";
import { PostCard } from "@/components/feed/PostCard";
import { FeedSkeleton } from "@/components/feed/FeedSkeleton";
import { Suspense } from "react";

async function FeedSection() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const feed = await getFeed({
    cursor: null,
    userId: session.user.id,
  });

  if (feed.posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          Follow users to see their posts
        </p>
        <p className="text-sm text-zinc-500 mt-1">
          When you follow people, their posts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl w-full mx-auto">
      {feed.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center py-6 w-full px-4">
      <div className="w-full max-w-xl mx-auto mb-6">
        <CreatePostDialog />
      </div>
      <Suspense
        fallback={
          <div className="space-y-6 max-w-xl w-full mx-auto px-4">
            <FeedSkeleton />
          </div>
        }
      >
        <FeedSection />
      </Suspense>
    </div>
  );
}

import Image from "next/image";
import { PostDetailDialog } from "@/components/feed/PostDetailDialog";

interface PostsGridProps {
  posts: {
    id: string;
    imageUrl: string;
    createdAt: Date;
  }[];
}

export function PostsGrid({ posts }: PostsGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          No posts yet
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {posts.map((post) => (
        <PostDetailDialog
          key={post.id}
          postId={post.id}
          trigger={
            <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden group cursor-pointer">
              <Image
                src={post.imageUrl}
                alt="Post"
                fill
                className="object-cover group-hover:opacity-80 transition-opacity"
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 33vw, 33vw"
              />
            </div>
          }
        />
      ))}
    </div>
  );
}

"use client";

import { useState, useOptimistic, useTransition } from "react";
import Image from "next/image";
import type { FeedPost } from "@/lib/feed";
import { toggleLike } from "@/actions/like";
import { CommentSection } from "@/components/feed/CommentSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatRelativeTime } from "@/lib/utils";

interface PostCardProps {
  post: FeedPost;
}

export function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(post.likedByUser);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [isLikePending, startLikeTransition] = useTransition();

  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post._count.comments);

  const [optimisticLiked, addOptimisticLike] = useOptimistic(
    liked,
    (state, newLiked: boolean) => newLiked
  );

  const handleLikeToggle = () => {
    if (isLikePending) return;
    const newLiked = !optimisticLiked;

    addOptimisticLike(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    startLikeTransition(async () => {
      try {
        const result = await toggleLike(post.id);
        setLiked(result.liked);
        setLikeCount((prev) =>
          result.liked
            ? optimisticLiked
              ? prev
              : prev + 1
            : optimisticLiked
              ? prev - 1
              : prev
        );
      } catch {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
      }
    });
  };

  return (
    <article className="border border-zinc-200 rounded-lg bg-white dark:bg-zinc-950 dark:border-zinc-800">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={post.author.image ?? undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(post.author.name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">
          {post.author.name ?? "Anonymous"}
        </span>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-square bg-zinc-100 dark:bg-zinc-900">
        <Image
          src={post.imageUrl}
          alt={post.caption ?? "Post image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 470px"
          priority={false}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 p-3">
        {/* Like button with heart SVG */}
        <button
          type="button"
          aria-label={optimisticLiked ? "Unlike post" : "Like post"}
          className="hover:opacity-70 transition-opacity"
          onClick={handleLikeToggle}
          disabled={isLikePending}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={optimisticLiked ? "#ef4444" : "none"}
            stroke={optimisticLiked ? "#ef4444" : "currentColor"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {/* Comment button */}
        <button
          type="button"
          aria-label="Comment on post"
          className="hover:opacity-70 transition-opacity"
          onClick={() => setShowComments((prev) => !prev)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="px-3 pb-1">
        <p className="text-sm font-semibold">
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </p>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-3 pb-2">
          <p className="text-sm">
            <span className="font-medium">
              {post.author.name ?? "Anonymous"}
            </span>{" "}
            {post.caption}
          </p>
        </div>
      )}

      {/* Comments link */}
      {commentCount > 0 && !showComments && (
        <div className="px-3 pb-1">
          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            View all {commentCount} comments
          </button>
        </div>
      )}

      {/* Comment Section */}
      {showComments && (
        <CommentSection postId={post.id} initialComments={[]} />
      )}

      {/* Time */}
      <div className="px-3 pb-3">
        <p className="text-xs text-zinc-500">
          {formatRelativeTime(post.createdAt)}
        </p>
      </div>
    </article>
  );
}

"use client";

import { useState, useOptimistic, useTransition, useEffect, useCallback } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import { getPostDetail } from "@/actions/post";
import { toggleLike } from "@/actions/like";
import { addComment } from "@/actions/comment";

interface CommentItem {
  id: string;
  text: string;
  author: {
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
}

interface PostDetailData {
  id: string;
  caption: string | null;
  imageUrl: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  comments: CommentItem[];
  _count: {
    likes: number;
    comments: number;
  };
  likedByUser: boolean;
}

interface PostDetailDialogProps {
  postId: string;
  trigger: React.ReactNode;
}

export function PostDetailDialog({ postId, trigger }: PostDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLikePending, startLikeTransition] = useTransition();
  const [isCommentPending, startCommentTransition] = useTransition();

  const [optimisticLiked, addOptimisticLike] = useOptimistic(
    liked,
    (_state, newLiked: boolean) => newLiked
  );

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: CommentItem) => [...state, newComment]
  );

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPostDetail(postId);
      if (data) {
        const normalized: PostDetailData = {
          ...data,
          createdAt: new Date(data.createdAt),
          comments: data.comments.map((c) => ({
            ...c,
            createdAt: new Date(c.createdAt),
          })),
        };
        setPost(normalized);
        setLiked(normalized.likedByUser);
        setLikeCount(normalized._count.likes);
        setComments(normalized.comments);
      }
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (open && !post) {
      fetchPost();
    }
  }, [open, post, fetchPost]);

  const handleLikeToggle = () => {
    if (isLikePending) return;
    const newLiked = !optimisticLiked;

    addOptimisticLike(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    startLikeTransition(async () => {
      try {
        const result = await toggleLike(postId);
        setLiked(result.liked);
        setLikeCount((prev) =>
          result.liked ? (optimisticLiked ? prev : prev + 1) : (optimisticLiked ? prev - 1 : prev)
        );
      } catch {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
      }
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || isCommentPending) return;

    setCommentText("");

    const optimisticComment: CommentItem = {
      id: `optimistic-${Date.now()}`,
      text: trimmed,
      author: { name: "You", image: null },
      createdAt: new Date(),
    };

    addOptimisticComment(optimisticComment);
    setComments((prev) => [...prev, optimisticComment]);

    startCommentTransition(async () => {
      const result = await addComment(postId, trimmed);
      if (result.success && result.comment) {
        setComments((prev) =>
          prev.filter((c) => c.id !== optimisticComment.id).concat({
            ...result.comment!,
            createdAt: new Date(result.comment!.createdAt),
          })
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <DialogContent
        showCloseButton
        className="max-w-[calc(100%-2rem)] sm:max-w-4xl p-0 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 border-t-zinc-900" />
          </div>
        ) : post ? (
          <div className="flex flex-col md:flex-row h-[80vh] md:h-[70vh]">
            {/* Left side: Image */}
            <div className="relative w-full md:w-1/2 bg-black flex items-center justify-center">
              <Image
                src={post.imageUrl}
                alt={post.caption ?? "Post image"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Right side: Content */}
            <div className="flex flex-col w-full md:w-1/2 md:min-w-0">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(post.author.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">
                  {post.author.name ?? "Anonymous"}
                </span>
              </div>

              {/* Comments section - scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Caption as first comment */}
                {post.caption && (
                  <div className="flex items-start gap-2 text-sm">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={post.author.image ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(post.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p>
                        <span className="font-medium">
                          {post.author.name ?? "Anonymous"}
                        </span>{" "}
                        <span className="break-words">{post.caption}</span>
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatRelativeTime(post.createdAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments */}
                {optimisticComments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2 text-sm">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={comment.author.image ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(comment.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p>
                        <span className="font-medium">
                          {comment.author.name ?? "Anonymous"}
                        </span>{" "}
                        <span className="break-words">{comment.text}</span>
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatRelativeTime(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 p-4 border-t border-zinc-200 dark:border-zinc-800">
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
                <button
                  type="button"
                  aria-label="Comment on post"
                  className="hover:opacity-70 transition-opacity"
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

              {/* Like count */}
              <div className="px-4 pb-1">
                <p className="text-sm font-semibold">
                  {likeCount} {likeCount === 1 ? "like" : "likes"}
                </p>
              </div>

              {/* Time */}
              <div className="px-4 pb-2">
                <p className="text-xs text-zinc-500 uppercase">
                  {formatRelativeTime(post.createdAt)}
                </p>
              </div>

              {/* Comment input */}
              <form
                onSubmit={handleCommentSubmit}
                className="flex items-center gap-2 p-4 border-t border-zinc-200 dark:border-zinc-800"
              >
                <Input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={500}
                  className="flex-1 h-8 text-sm"
                  disabled={isCommentPending}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  className="text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:opacity-50"
                  disabled={!commentText.trim() || isCommentPending}
                >
                  Post
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-zinc-500">Post not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

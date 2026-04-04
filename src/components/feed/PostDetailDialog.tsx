"use client";

import { useState, useOptimistic, useTransition, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import { getPostDetail } from "@/actions/post";
import { toggleLike } from "@/actions/like";
import { addComment, deleteComment } from "@/actions/comment";
import { useSession } from "next-auth/react";

interface CommentItem {
  id: string;
  text: string;
  author: {
    id?: string;
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
  const { data: session } = useSession();
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

    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    startLikeTransition(async () => {
      addOptimisticLike(newLiked);
      try {
        const result = await toggleLike(postId);
        setLiked(result.liked);
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

    startCommentTransition(async () => {
      try {
        const result = await addComment(postId, trimmed);
        if (result.success && result.comment) {
          setComments((prev) =>
            prev.concat({
              ...result.comment!,
              createdAt: new Date(result.comment!.createdAt),
            })
          );
        }
      } catch (error) {
        // Pending state will just finish and re-enable the input
      }
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    const originalComments = [...comments];
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    
    startCommentTransition(async () => {
      try {
        const result = await deleteComment(commentId);
        if (result?.error) {
          setComments(originalComments);
        }
      } catch {
        setComments(originalComments);
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
          <div className="flex flex-col md:flex-row h-[85vh] md:h-[75vh]">
            {/* Left side: Image */}
            <div className="relative w-full min-h-[40vh] md:min-h-0 md:h-full md:w-1/2 bg-black flex flex-shrink-0 items-center justify-center">
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
            <div className="flex flex-col w-full flex-1 md:w-1/2 md:flex-none md:min-w-0 min-h-0">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-zinc-200 dark:border-zinc-800">
                <Link href={`/profile/${post.author.id}`} onClick={() => setOpen(false)}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(post.author.name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Link
                  href={`/profile/${post.author.id}`}
                  className="text-sm font-semibold hover:underline truncate"
                  onClick={() => setOpen(false)}
                >
                  {post.author.name ?? "Anonymous"}
                </Link>
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
                        <Link
                          href={`/profile/${post.author.id}`}
                          className="font-bold hover:underline"
                          onClick={() => setOpen(false)}
                        >
                          {post.author.name ?? "Anonymous"}
                        </Link>{" "}
                        <span className="break-words">{post.caption}</span>
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatRelativeTime(post.createdAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comments */}
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2 text-sm relative group">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={comment.author.image ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(comment.author.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 pr-6">
                      <p>
                        {comment.author.id ? (
                          <Link
                            href={`/profile/${comment.author.id}`}
                            className="font-bold hover:underline"
                            onClick={() => setOpen(false)}
                          >
                            {comment.author.name ?? "Anonymous"}
                          </Link>
                        ) : (
                          <span className="font-bold">
                            {comment.author.name ?? "Anonymous"}
                          </span>
                        )}{" "}
                        <span className="break-words">{comment.text}</span>
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {formatRelativeTime(comment.createdAt)}
                      </p>
                    </div>

                    {session?.user?.id === comment.author.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="absolute right-0 top-0 text-zinc-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1"
                        aria-label="Delete comment"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    )}
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

"use client";

import { useState, useOptimistic, useTransition } from "react";
import { addComment } from "@/actions/comment";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials, formatRelativeTime } from "@/lib/utils";

interface CommentItem {
  id: string;
  text: string;
  author: {
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
}

interface CommentSectionProps {
  postId: string;
  initialComments: CommentItem[];
}

export function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment: CommentItem) => [...state, newComment]
  );
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [expanded, setExpanded] = useState(false);

  const SHOW_LIMIT = 3;
  const displayComments = expanded
    ? optimisticComments
    : optimisticComments.slice(-SHOW_LIMIT);
  const hasMore = optimisticComments.length > SHOW_LIMIT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    setText("");

    const optimisticComment: CommentItem = {
      id: `optimistic-${Date.now()}`,
      text: trimmed,
      author: { name: "You", image: null },
      createdAt: new Date(),
    };

    addOptimisticComment(optimisticComment);

    startTransition(async () => {
      const result = await addComment(postId, trimmed);
      if (result.success && result.comment) {
        setComments((prev) => [
          ...prev,
          {
            ...result.comment,
            createdAt: new Date(result.comment.createdAt),
          },
        ]);
      } else {
        // Rollback optimistic update on failure
        setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      }
    });
  };

  return (
    <div className="border-t border-zinc-100 dark:border-zinc-800">
      {/* Comments list */}
      <div className="max-h-48 overflow-y-auto px-3 py-2 space-y-1.5">
        {hasMore && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            View all {optimisticComments.length} comments
          </button>
        )}
        {displayComments.map((comment) => (
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
              <p className="text-xs text-zinc-500">
                {formatRelativeTime(comment.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-3 border-t border-zinc-100 dark:border-zinc-800"
      >
        <Input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          className="flex-1 h-8 text-sm"
          disabled={isPending}
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:opacity-50"
          disabled={!text.trim() || isPending}
        >
          Post
        </Button>
      </form>
    </div>
  );
}

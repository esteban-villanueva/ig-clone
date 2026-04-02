import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { FeedPost } from "@/lib/feed";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt as string} />;
  },
}));

// Mock Server Actions
vi.mock("@/actions/like", () => ({
  toggleLike: vi.fn().mockResolvedValue({ liked: true }),
}));

vi.mock("@/actions/comment", () => ({
  addComment: vi.fn().mockResolvedValue({}),
}));

// Mock CommentSection
vi.mock("@/components/feed/CommentSection", () => ({
  CommentSection: ({ postId }: { postId: string }) => (
    <div data-testid="comment-section" data-postid={postId}>
      Comments
    </div>
  ),
}));

// Mock utils
vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
  getInitials: (name: string | null) => (name ? name.charAt(0).toUpperCase() : "?"),
  formatRelativeTime: (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  },
}));

import { PostCard } from "../PostCard";

const mockPost: FeedPost = {
  id: "post-1",
  caption: "Beautiful sunset today!",
  imageUrl: "https://example.com/sunset.jpg",
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  author: {
    id: "author-1",
    name: "Jane Doe",
    image: "https://example.com/avatar.jpg",
  },
  _count: {
    likes: 42,
    comments: 5,
  },
  likedByUser: false,
};

describe("PostCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows author name", () => {
    render(<PostCard post={mockPost} />);
    // Author name appears in header and caption
    expect(screen.getAllByText("Jane Doe")).toHaveLength(2);
  });

  it("shows caption", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(/Beautiful sunset today!/)).toBeInTheDocument();
  });

  it("shows post image", () => {
    render(<PostCard post={mockPost} />);
    const img = screen.getByRole("img", { name: /Beautiful sunset today!/ });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/sunset.jpg");
  });

  it("shows likes count", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("42 likes")).toBeInTheDocument();
  });

  it("shows comments count link", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(/View all 5 comments/)).toBeInTheDocument();
  });

  it("shows relative time", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("shows 'Anonymous' when author name is null", () => {
    const postWithoutName: FeedPost = {
      ...mockPost,
      author: { ...mockPost.author, name: null },
    };
    render(<PostCard post={postWithoutName} />);
    expect(screen.getAllByText("Anonymous")).toHaveLength(2); // header + caption
  });

  it("does not show caption section when caption is null", () => {
    const postWithoutCaption: FeedPost = {
      ...mockPost,
      caption: null,
    };
    render(<PostCard post={postWithoutCaption} />);
    expect(screen.queryByText(/Beautiful sunset/)).not.toBeInTheDocument();
  });

  it("shows singular 'like' when count is 1", () => {
    const postWithOneLike: FeedPost = {
      ...mockPost,
      _count: { ...mockPost._count, likes: 1 },
    };
    render(<PostCard post={postWithOneLike} />);
    expect(screen.getByText("1 like")).toBeInTheDocument();
  });

  it("shows like button with correct aria-label when not liked", () => {
    render(<PostCard post={mockPost} />);
    const likeButton = screen.getByRole("button", { name: /Like post/ });
    expect(likeButton).toBeInTheDocument();
  });

  it("shows like button with correct aria-label when liked", () => {
    const likedPost: FeedPost = {
      ...mockPost,
      likedByUser: true,
    };
    render(<PostCard post={likedPost} />);
    const likeButton = screen.getByRole("button", { name: /Unlike post/ });
    expect(likeButton).toBeInTheDocument();
  });

  it("shows comment button", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByRole("button", { name: /Comment on post/ })).toBeInTheDocument();
  });

  it("shows comment section when comments link is clicked", () => {
    render(<PostCard post={mockPost} />);

    const viewCommentsBtn = screen.getByText(/View all 5 comments/);
    fireEvent.click(viewCommentsBtn);

    expect(screen.getByTestId("comment-section")).toBeInTheDocument();
  });

  it("does not show comments link when comment count is 0", () => {
    const postNoComments: FeedPost = {
      ...mockPost,
      _count: { ...mockPost._count, comments: 0 },
    };
    render(<PostCard post={postNoComments} />);
    expect(screen.queryByText(/View all/)).not.toBeInTheDocument();
  });
});

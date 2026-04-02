import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseCursor, getFeed } from "../feed";

// Mock the db module
vi.mock("@/lib/db", () => ({
  db: {
    post: {
      findMany: vi.fn(),
    },
  },
}));

// Import mocked db
import { db } from "@/lib/db";

const mockedFindMany = vi.mocked(db.post.findMany);

describe("parseCursor", () => {
  it("returns cursor value when present in searchParams", () => {
    const params = new URLSearchParams("cursor=abc123");
    expect(parseCursor(params)).toBe("abc123");
  });

  it("returns null when cursor is not present", () => {
    const params = new URLSearchParams("other=value");
    expect(parseCursor(params)).toBeNull();
  });

  it("returns null for empty cursor value", () => {
    const params = new URLSearchParams("cursor=");
    expect(parseCursor(params)).toBe("");
  });
});

describe("getFeed", () => {
  const mockUserId = "user-1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns posts from followed users", async () => {
    const mockPosts = [
      {
        id: "post-1",
        caption: "Hello world",
        imageUrl: "https://example.com/image.jpg",
        createdAt: new Date("2024-01-01"),
        author: { id: "author-1", name: "Test Author", image: null },
        _count: { likes: 5, comments: 2 },
        likes: [{ id: "like-1" }],
      },
    ];

    mockedFindMany.mockResolvedValue(mockPosts as any);

    const result = await getFeed({ cursor: null, userId: mockUserId });

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            {
              author: {
                followings: {
                  some: {
                    followerId: mockUserId,
                  },
                },
              },
            },
            {
              authorId: mockUserId,
            },
          ],
        },
      })
    );
    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].id).toBe("post-1");
  });

  it("returns correct cursor for next page", async () => {
    // Create 21 posts to simulate hasNextPage
    const mockPosts = Array.from({ length: 21 }, (_, i) => ({
      id: `post-${i}`,
      caption: `Caption ${i}`,
      imageUrl: `https://example.com/image-${i}.jpg`,
      createdAt: new Date("2024-01-01"),
      author: { id: "author-1", name: "Test Author", image: null },
      _count: { likes: 0, comments: 0 },
      likes: [],
    }));

    mockedFindMany.mockResolvedValue(mockPosts as any);

    const result = await getFeed({ cursor: null, userId: mockUserId });

    expect(result.hasNextPage).toBe(true);
    expect(result.nextCursor).toBe("post-19"); // last item of sliced array (index 19)
    expect(result.posts).toHaveLength(20);
  });

  it("returns hasNextPage: false when no more posts", async () => {
    const mockPosts = [
      {
        id: "post-1",
        caption: "Only post",
        imageUrl: "https://example.com/image.jpg",
        createdAt: new Date("2024-01-01"),
        author: { id: "author-1", name: "Test Author", image: null },
        _count: { likes: 0, comments: 0 },
        likes: [],
      },
    ];

    mockedFindMany.mockResolvedValue(mockPosts as any);

    const result = await getFeed({ cursor: null, userId: mockUserId });

    expect(result.hasNextPage).toBe(false);
    expect(result.nextCursor).toBeNull();
  });

  it("includes likedByUser flag based on likes array", async () => {
    const mockPosts = [
      {
        id: "post-1",
        caption: "Liked post",
        imageUrl: "https://example.com/image.jpg",
        createdAt: new Date("2024-01-01"),
        author: { id: "author-1", name: "Test Author", image: null },
        _count: { likes: 5, comments: 2 },
        likes: [{ id: "like-1" }],
      },
      {
        id: "post-2",
        caption: "Unliked post",
        imageUrl: "https://example.com/image2.jpg",
        createdAt: new Date("2024-01-01"),
        author: { id: "author-2", name: "Another Author", image: null },
        _count: { likes: 3, comments: 1 },
        likes: [],
      },
    ];

    mockedFindMany.mockResolvedValue(mockPosts as any);

    const result = await getFeed({ cursor: null, userId: mockUserId });

    expect(result.posts[0].likedByUser).toBe(true);
    expect(result.posts[1].likedByUser).toBe(false);
  });

  it("uses cursor and skip when cursor is provided", async () => {
    mockedFindMany.mockResolvedValue([]);

    await getFeed({ cursor: "post-5", userId: mockUserId });

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: "post-5" },
        skip: 1,
      })
    );
  });

  it("returns empty posts when no posts found", async () => {
    mockedFindMany.mockResolvedValue([]);

    const result = await getFeed({ cursor: null, userId: mockUserId });

    expect(result.posts).toEqual([]);
    expect(result.hasNextPage).toBe(false);
    expect(result.nextCursor).toBeNull();
  });
});

"use client";

import { useState, useOptimistic, useTransition } from "react";
import { toggleFollow } from "@/actions/follow";
import { updateProfile } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    _count: {
      posts: number;
      followers: number;
      followings: number;
    };
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing: initialFollowing,
}: ProfileHeaderProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  const handleFollowToggle = () => {
    if (isPending) return;
    startTransition(async () => {
      try {
        const result = await toggleFollow(user.id);
        setFollowing(result.following);
      } catch {
        // Rollback on error
        setFollowing((prev) => !prev);
      }
    });
  };

  return (
    <div className="px-4 py-6">
      {/* Top section: avatar + stats */}
      <div className="flex items-center gap-6 md:gap-10">
        <Avatar className="h-20 w-20 md:h-36 md:w-36">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="text-2xl">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h1 
              className="text-2xl md:text-3xl"
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--landing-heading, #111)",
              }}
            >
              {user.name ?? "Anonymous"}
            </h1>
            {isOwnProfile ? (
              <EditProfileDialog
                user={user}
                open={editOpen}
                onOpenChange={setEditOpen}
              />
            ) : (
              <Button
                variant={following ? "outline" : "default"}
                size="sm"
                onClick={handleFollowToggle}
                disabled={isPending}
              >
                {isPending
                  ? "..."
                  : following
                    ? "Unfollow"
                    : "Follow"}
              </Button>
            )}
          </div>

          {/* Stats row */}
          <div className="flex gap-6 text-sm" style={{ color: "var(--landing-body, #444)" }}>
            <span className="flex flex-col md:flex-row md:gap-1.5 items-start md:items-center">
              <strong className="text-lg md:text-base" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 700, color: "var(--landing-heading, #111)" }}>{user._count.posts}</strong>{" "}
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] md:text-xs font-semibold">posts</span>
            </span>
            <span className="flex flex-col md:flex-row md:gap-1.5 items-start md:items-center">
              <strong className="text-lg md:text-base" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 700, color: "var(--landing-heading, #111)" }}>{user._count.followers}</strong>{" "}
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] md:text-xs font-semibold">seguidores</span>
            </span>
            <span className="flex flex-col md:flex-row md:gap-1.5 items-start md:items-center">
              <strong className="text-lg md:text-base" style={{ fontFamily: "var(--font-fraunces), Georgia, serif", fontWeight: 700, color: "var(--landing-heading, #111)" }}>{user._count.followings}</strong>{" "}
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] md:text-xs font-semibold">siguiendo</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: { id: string; name: string | null; image: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (selectedFile) {
      formData.set("image", selectedFile);
    }

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.success) {
        setPreview(null);
        setSelectedFile(null);
        onOpenChange(false);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Edit Profile
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your name and profile picture.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={user.name ?? ""}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Profile Picture</Label>
              <Input
                id="edit-image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-2 h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

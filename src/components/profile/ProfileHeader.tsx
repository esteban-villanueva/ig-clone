"use client";

import { useState, useOptimistic, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "@/actions/follow";
import { updateProfile } from "@/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
import { Textarea } from "@/components/ui/textarea";
import { Settings, Camera, User2, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string | null;
    image: string | null;
    bio?: string | null;
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
              <button
                onClick={handleFollowToggle}
                disabled={isPending}
                className="group flex items-center justify-center h-9 w-9 rounded-full brand-icon-hover disabled:opacity-50"
                title={following ? "Unfollow" : "Follow"}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                ) : following ? (
                  <UserMinus className="h-5 w-5 text-zinc-500" />
                ) : (
                  <UserPlus className="h-5 w-5 text-zinc-500" />
                )}
              </button>
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

          {/* Bio display */}
          {user.bio && (
            <div className="mt-4 max-w-md">
              <p className="text-sm leading-relaxed text-zinc-600 whitespace-pre-wrap">
                {user.bio}
              </p>
            </div>
          )}
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
  user: { id: string; name: string | null; image: string | null; bio?: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { update } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (selectedFile) {
      formData.set("image", selectedFile);
    }

    startTransition(async () => {
      setError(null);
      const result = await updateProfile(formData);
      if (result.success) {
        // Update browser session
        await update({
          name: formData.get("name"),
          image: result.imageUrl || user.image,
        });

        // Force server re-render for profile page data
        router.refresh();

        setPreview(null);
        setSelectedFile(null);
        setError(null);
        onOpenChange(false);
      } else if (result.error) {
        setError(result.error);
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
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex items-center justify-center h-9 w-9 rounded-full brand-icon-hover"
            title="Settings"
          />
        }
      >
        <Settings className="w-5 h-5 text-zinc-500" />
      </DialogTrigger>
      <DialogContent
        className="overflow-hidden border-none p-0 max-w-sm"
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header con gradiente suave */}
          <div className="relative pt-8 pb-6 px-6 text-center border-b border-black/5">
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: "linear-gradient(90deg, #F59E0B, #EC4899, #8B5CF6)" }}></div>
            <DialogTitle
              className="text-2xl"
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--landing-heading, #111)",
              }}
            >
              Edit Profile
            </DialogTitle>
            <DialogDescription className="mt-1 text-zinc-500 text-xs font-medium uppercase tracking-wider">
              Update your presence
            </DialogDescription>
          </div>

          <div className="flex-1 px-8 py-8 space-y-8 overflow-y-auto max-h-[60vh]">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-1">
              <Label className="text-[10px] uppercase font-bold tracking-[0.15em] text-zinc-400 mb-2">Profile Image</Label>
              <div
                className="relative group cursor-pointer"
                onClick={() => document.getElementById("edit-image")?.click()}
              >
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-500 via-pink-500 to-violet-500 rounded-full opacity-30 group-hover:opacity-60 blur-[6px] transition-opacity duration-300"></div>
                <Avatar className="h-24 w-24 border-2 border-white ring-2 ring-black/5 shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                  <AvatarImage src={preview || user.image || undefined} />
                  <AvatarFallback className="bg-zinc-100">
                    <User2 className="w-8 h-8 text-zinc-300" />
                  </AvatarFallback>
                </Avatar>

                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Camera className="w-5 h-5 mb-1" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Change</span>
                </div>

                <Input
                  id="edit-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-[10px] uppercase font-bold tracking-[0.15em] text-zinc-400 ml-1">Full Name</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={user.name ?? ""}
                required
                className="h-11 bg-white/40 border-black/5 focus:bg-white/60 focus:border-pink-500/30 focus:ring-pink-500/5 transition-all text-sm font-medium rounded-xl"
                placeholder="How do you want to be seen?"
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-bio" className="text-[10px] uppercase font-bold tracking-[0.15em] text-zinc-400 ml-1">About You</Label>
              <Textarea
                id="edit-bio"
                name="bio"
                defaultValue={user.bio ?? ""}
                className="min-h-24 bg-white/40 border-black/5 focus:bg-white/60 focus:border-violet-500/30 focus:ring-violet-500/5 transition-all text-sm leading-relaxed rounded-xl py-3"
                placeholder="Tell the world your story..."
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-row items-center justify-center sm:justify-center gap-3 p-8 border-t border-black/5 bg-gradient-to-b from-transparent to-black/[0.02] mx-0 mb-0">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 max-w-[140px] py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 hover:bg-black/5 transition-all duration-300 border border-black/5 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 max-w-[140px] py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-md shadow-pink-500/20"
              style={{ background: "linear-gradient(135deg, #F59E0B, #EC4899, #8B5CF6)" }}
            >
              {isPending ? "Sync..." : "Save"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="border border-zinc-200 rounded-lg bg-white dark:bg-zinc-950 dark:border-zinc-800 overflow-hidden"
        >
          {/* Avatar + name skeleton */}
          <div className="flex items-center gap-3 p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          {/* Image skeleton */}
          <Skeleton className="w-full aspect-square" />
          {/* Text skeletons */}
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

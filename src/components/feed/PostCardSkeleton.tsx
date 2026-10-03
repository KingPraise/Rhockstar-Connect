import { Skeleton } from "@/components/ui/Skeleton";

export default function PostCardSkeleton() {
  return (
    <div className="neo-card p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-3 sm:gap-4 mb-4">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <Skeleton className="h-64 sm:h-96 w-full rounded-2xl mb-4" />
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-8 rounded-lg" />
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}

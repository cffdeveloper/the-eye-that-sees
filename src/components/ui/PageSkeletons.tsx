import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function IntelFeedGridSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-xl xl:row-span-2" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-72 rounded-xl xl:row-span-2" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-48 rounded-xl md:col-span-2" />
      </div>
    </div>
  );
}

export function CrossIntelPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

export function IndustryBriefSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2 py-2", className)}>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-[95%]" />
      <Skeleton className="h-3 w-[88%]" />
      <Skeleton className="h-3 w-[70%]" />
    </div>
  );
}

export function SavedLibraryListSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2 py-2", className)}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-2 rounded-xl border border-border/30 bg-muted/15 px-3 py-2.5">
          <Skeleton className="h-4 w-4 shrink-0 rounded" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-[72%]" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SubscriptionGateSkeleton({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", compact ? "py-3" : "py-6", className)}>
      <Skeleton className={cn("h-3 rounded-md", compact ? "w-[85%]" : "w-2/3")} />
      <Skeleton className={cn("h-3 rounded-md", compact ? "w-[60%]" : "w-1/2")} />
      {!compact && <Skeleton className="h-3 w-[40%] rounded-md" />}
    </div>
  );
}

export function CustomIntelGeneratingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("glass-panel space-y-4 border border-border/40 p-8", className)}>
      <div className="space-y-2">
        <Skeleton className="mx-auto h-3 w-48" />
        <Skeleton className="mx-auto h-2.5 w-64 max-w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[96%]" />
        <Skeleton className="h-3 w-[91%]" />
        <Skeleton className="h-3 w-[85%]" />
        <Skeleton className="h-3 w-[78%]" />
      </div>
      <div className="flex justify-center gap-1 pt-2">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/70 [animation-duration:400ms]" />
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50 [animation-duration:400ms]"
          style={{ animationDelay: "120ms" }}
        />
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary/30 [animation-duration:400ms]"
          style={{ animationDelay: "240ms" }}
        />
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto max-w-6xl space-y-6 px-1 py-6", className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

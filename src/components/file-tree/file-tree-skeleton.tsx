import { Skeleton } from "../ui/skeleton";

type FileTreeSkeletonProps = {
  level: number;
};

export function FileTreeSkeleton({ level }: FileTreeSkeletonProps) {
  return (
    <div className="space-y-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-2 py-1"
          style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
        >
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

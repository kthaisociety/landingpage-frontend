import { Skeleton } from "@/shared/ui/skeleton"
import { Card } from "@/shared/ui/card"
import { ProgressiveBlur } from "@/shared/ui/progressive-blur"

export function JobCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden cursor-pointer w-full aspect-22/25">
      {/* Background Image Skeleton */}
      <div className="absolute inset-0">
        <Skeleton className="h-full w-full" />
      </div>

      <ProgressiveBlur
        position="bottom"
        height="70%"
        className="absolute left-0 right-0 bottom-0"
      />

      <div
        className="absolute inset-0 pointer-events-none z-15"
        style={{
          background: `linear-gradient(to bottom, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.1) 50%, 
            rgba(255, 255, 255, 0.6) 80%, 
            rgba(255, 255, 255, 0.8) 100%)`
        }}
      />

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 z-20">
        {/* Title */}
        <Skeleton className="h-7 w-3/4 mb-1" />

        {/* Company & Location */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    </Card>
  )
}

export function JobsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
    </div>
  )
}


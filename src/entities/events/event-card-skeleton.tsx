import { Skeleton } from "@/shared/ui/skeleton"
import { Card } from "@/shared/ui/card"
import { ProgressiveBlur } from "@/shared/ui/progressive-blur"

export function EventCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden cursor-pointer w-full aspect-[22/25]">
      {/* Background Image Skeleton */}
      <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.02] will-change-transform">
        <Skeleton className="h-full w-full" />
      </div>

      {/* Progressive Blur Overlay */}
      <ProgressiveBlur
        position="bottom"
        height="50%"
        className="absolute left-0 right-0 bottom-0"
      />

      {/* Gradient overlay for better text readability */}
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
        <Skeleton className="h-7 w-3/4 mb-3" />

        {/* Date */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Button */}
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-9 px-4 py-2 w-36 rounded-md" />
        </div>
      </div>
    </Card>
  )
}

export function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <EventCardSkeleton />
      <EventCardSkeleton />
      <EventCardSkeleton />
      <EventCardSkeleton />
      <EventCardSkeleton />
      <EventCardSkeleton />
    </div>
  )
}




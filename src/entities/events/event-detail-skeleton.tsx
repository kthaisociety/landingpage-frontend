import { Skeleton } from "@/shared/ui/skeleton"
import { AsciiGrid } from "@/shared/ui/ascii-grid"

export function EventDetailSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Dark Blue Header Section */}
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
        <div className="absolute inset-0 pointer-events-none">
          <AsciiGrid 
            color="rgba(0, 0, 0, 0.2)" 
            cellSize={12} 
            enableDripping={false}
            className="w-full h-full"
          />
        </div>
        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          {/* Back Button Skeleton */}
          <Skeleton className="h-10 w-20 mb-6 -ml-4" />

          {/* Status Badge Skeleton */}
          <Skeleton className="h-6 w-24 mb-4 rounded-full" />

          {/* Main Title Skeleton */}
          <Skeleton className="h-16 md:h-20 w-3/4 mb-6" />

          {/* Event Details Skeleton */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-48" />
            </div>
          </div>
        </div>
      </section>

      {/* White Content Area */}
      <section className="relative max-w-7xl mx-4 sm:mx-auto z-20 -mt-24 bg-neutral-50 rounded-3xl p-4 md:p-8 mb-24 shadow-lg border">
        <div className="container mx-auto">
          {/* Breadcrumbs Skeleton */}
          <div className="mb-8 flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Event Description Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-7 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex gap-3 mt-8">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
      </section>
    </div>
  )
}






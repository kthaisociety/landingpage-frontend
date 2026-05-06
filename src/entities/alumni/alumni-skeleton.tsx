import { Skeleton } from "@/shared/ui/skeleton";

export function AlumniSkeleton() {
  return (
    <div className="container mx-auto my-6 p-6">
      <div className="space-y-5 mb-8">
        <Skeleton className="h-10 w-60" /> 
        <Skeleton className="h-5 w-1/2" />   
        <Skeleton className="h-5 w-1/2" />   
        <Skeleton className="h-5 w-1/2" />   
      </div>
      <div className="flex justify-end items-center mb-8">
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
          {/*Skeleton cards 1*/}
           <div className="p-4 border rounded-md shadow-sm space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/*Skeleton cards 2*/}
          <div className="p-4 border rounded-md shadow-sm space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>

          {/*Skeleton cards 3*/}
          <div className="p-4 border rounded-md shadow-sm space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
      </div>
    </div>
  );
}
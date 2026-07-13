import React from "react";
import { Skeleton } from "../ui/Skeleton";

export function CollegeCardSkeleton() {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-700/30 flex flex-col justify-between h-full space-y-4">
      <div>
        <div className="flex justify-between items-start mb-3">
          <Skeleton variant="circular" className="w-10 h-10" />
          <Skeleton className="w-12 h-6 rounded-full" />
        </div>
        <Skeleton className="w-3/4 h-6 mb-2" />
        <Skeleton className="w-1/3 h-4 mb-4" />
        
        <div className="space-y-2 mb-4">
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-5/6 h-3" />
          <Skeleton className="w-4/6 h-3" />
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-slate-700/30 flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-8 rounded-lg" />
      </div>
    </div>
  );
}

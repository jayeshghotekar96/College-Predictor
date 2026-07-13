import React from "react";
import { Skeleton } from "../ui/Skeleton";

export function ResultCardSkeleton() {
  return (
    <div className="ticket-stub mb-4 overflow-hidden p-0">
      <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
        {/* Left Indicator */}
        <div className="ticket-tab bg-slate-700/30"></div>
        
        {/* Left Side: Details */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="w-2/3 h-7 mb-2" />
            <Skeleton className="w-16 h-8 rounded-full" />
          </div>
          <Skeleton className="w-1/2 h-5" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>

        {/* Right Side: Probability Meter */}
        <div className="flex-shrink-0 relative ticket-perforation md:pl-10 md:py-2 w-full md:w-auto flex justify-center items-center">
          <Skeleton variant="circular" className="w-[120px] h-[120px]" />
        </div>
      </div>
    </div>
  );
}

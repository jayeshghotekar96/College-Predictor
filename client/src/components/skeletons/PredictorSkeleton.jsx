import React from "react";
import { Skeleton } from "../ui/Skeleton";
import { ResultCardSkeleton } from "./ResultCardSkeleton";

export function PredictorSkeleton() {
  return (
    <div className="w-full relative flex-1 flex flex-col bg-[#0F172A]">
      {/* Tab Navigation Skeleton */}
      <nav className="glass-panel px-6 relative z-10 border-b border-slate-700/30 shadow-xs mb-8">
        <div className="max-w-7xl mx-auto flex gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4 flex items-center">
              <Skeleton className="w-32 h-6" />
            </div>
          ))}
        </div>
      </nav>
      
      {/* Main Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 w-full pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-4">
            <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-700/30 sticky top-24">
              <Skeleton className="w-48 h-8 mb-2" />
              <Skeleton className="w-3/4 h-4 mb-8" />
              
              <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i}>
                    <Skeleton className="w-32 h-4 mb-2" />
                    <Skeleton className="w-full h-12 rounded-xl" />
                  </div>
                ))}
              </div>
              <Skeleton className="w-full h-14 rounded-xl mt-8" />
            </div>
          </div>
          
          {/* Right Column - Results */}
          <div className="lg:col-span-8">
            <Skeleton className="w-40 h-8 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <ResultCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

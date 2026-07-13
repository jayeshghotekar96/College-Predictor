import React from "react";
import { Skeleton } from "../ui/Skeleton";

export function CollegeDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0F172A] pb-20">
      {/* Hero Section */}
      <div className="relative pt-16 pb-12 overflow-hidden border-b border-slate-700/30">
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <Skeleton variant="circular" className="w-24 h-24 mb-6" />
          <Skeleton className="w-32 h-6 mb-4" />
          <Skeleton className="w-3/4 max-w-2xl h-10 mb-4" />
          <Skeleton className="w-1/2 max-w-lg h-5 mb-8" />
          <div className="flex gap-3 flex-wrap justify-center">
            <Skeleton className="w-24 h-8 rounded-lg" />
            <Skeleton className="w-24 h-8 rounded-lg" />
            <Skeleton className="w-24 h-8 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <Skeleton className="w-48 h-8 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-700/30">
                    <Skeleton className="w-1/3 h-5" />
                    <Skeleton className="w-1/4 h-5" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl h-96">
              <Skeleton className="w-64 h-8 mb-6" />
              <Skeleton className="w-full h-full max-h-[300px]" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <Skeleton className="w-40 h-8 mb-4" />
              <div className="space-y-3">
                <Skeleton className="w-full h-12 rounded-xl" />
                <Skeleton className="w-full h-12 rounded-xl" />
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl">
              <Skeleton className="w-40 h-8 mb-4" />
              <Skeleton className="w-full h-40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

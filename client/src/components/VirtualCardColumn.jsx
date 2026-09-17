import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ResultCard } from "./ResultCard";

export const VirtualCardColumn = React.memo(function VirtualCardColumn({
  items,
  category,
  userPercentile,
  isShortlisted,
  onToggleShortlist,
  isAddedToOption,
  onToggleOption,
  emptyMessage,
}) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 290,
    overscan: 4,
  });

  if (items.length === 0) {
    return (
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        <p className="text-xs text-slate-500 bg-black/20 p-4 text-center rounded-lg border border-dashed border-white/10">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="max-h-[70vh] overflow-y-auto pr-1 relative will-change-scroll"
      style={{ contain: "content" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const res = items[virtualRow.index];
          return (
            <div
              key={`${res.college.collegeCode}-${res.branch.choiceCode}`}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ResultCard
                result={res}
                category={category}
                userPercentile={userPercentile}
                isShortlisted={isShortlisted(
                  res.college.collegeCode,
                  res.branch.choiceCode,
                )}
                onToggleShortlist={onToggleShortlist}
                isAddedToOption={isAddedToOption(res.branch.choiceCode)}
                onToggleOption={onToggleOption}
                index={virtualRow.index}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

import { useState } from "react";
import { useData } from "../lib/DataContext";
import { ProbabilityMeter } from "./ProbabilityMeter";

export function OptionFormPanel({
  optionForm,
  userPercentile,
  onRemove,
  onMove,
  onRankChange,
  onReorderList,
  exportAsText,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const { data } = useData();

  const handleCopy = () => {
    const text = exportAsText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const items = [...optionForm];
    const draggedItem = items[draggedIndex];
    // Remove from old position and insert at new position
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    onReorderList(items.map((item, idx) => ({ ...item, rank: idx + 1 })));
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <>
      {/* Floating option form button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 bg-amber hover:opacity-90 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider z-40 transition-transform active:scale-95 cursor-pointer border border-white/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4.5 h-4.5"
        >
          <path d="M19.5 22.5a.75.75 0 00.75-.75v-19.5a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75v19.5c0 .414.336.75.75.75h15zM7.5 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 6zm0 3.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM8.25 12.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" />
        </svg>
        <span>Option Form ({optionForm.length})</span>
      </button>

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full pl-10 flex">
            <div className="w-screen max-w-lg glass-panel flex flex-col shadow-xl animate-slideLeft">
              {/* Header */}
              <div className="bg-ink text-paper px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold">
                    Build My Option Form
                  </h3>
                  <p className="text-[10px] text-paper/60 uppercase tracking-wider mt-0.5">
                    Official Ranked Preference List
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-paper-cool/10 rounded-full transition-colors cursor-pointer text-paper/60 hover:text-paper"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-[11px] text-ink-muted mb-4 leading-normal">
                  💡 Drag rows by their handles or use the up/down arrows to
                  reorder your selections. Direct-input rank changes are also
                  supported.
                </p>

                {optionForm.length === 0 ? (
                  <div className="h-2/3 flex flex-col items-center justify-center text-center text-ink-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-12 h-12 stroke-paper-cool mb-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="font-heading text-sm font-semibold text-ink-light">
                      Option form list is empty
                    </p>
                    <p className="text-xs mt-1">
                      Add seats from the predictor results to build your
                      preference form.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 print-section">
                    <style>{`
                      @media print {
                        body * { visibility: hidden; }
                        .print-section, .print-section * { visibility: visible; }
                        .print-section { position: absolute; left: 0; top: 0; width: 100%; color: black; background: white; }
                        .glass-panel { background: white !important; color: black !important; border: none; }
                        .text-white { color: black !important; }
                        .text-white\\/50 { color: #666 !important; }
                        button { display: none !important; }
                      }
                    `}</style>
                    {optionForm.map((item, idx) => {
                      // Use cutoff from item if available
                      const latestCutoff = item.latestCutoff || 0;
                      return (
                        <div
                          key={item.choiceCode}
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white rounded-md border border-paper-cool/50 flex items-center shadow-xs transition-shadow ${
                            draggedIndex === idx
                              ? "border-amber opacity-40 shadow-md"
                              : "hover:shadow-sm"
                          }`}
                        >
                          {/* Drag Handle */}
                          <div className="cursor-grab active:cursor-grabbing p-3 text-ink-muted/50 hover:text-ink transition-colors">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 6a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6zm0 6a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 6a.75.75 0 01.75-.75H18a.75.75 0 010 1.5H3.75A.75.75 0 013 18z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>

                          {/* Rank Input */}
                          <div className="flex items-center gap-1 pl-1">
                            <span className="text-[10px] font-heading font-bold text-white/50 uppercase">
                              Rank
                            </span>
                            <input
                              type="number"
                              min="1"
                              max={optionForm.length}
                              value={item.rank}
                              onChange={(e) =>
                                onRankChange(
                                  item.choiceCode,
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="mono font-bold text-xs text-center border border-white/10 w-9 py-1 rounded glass-input"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 px-4 py-3 border-l border-white/10">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="mono text-[9px] font-bold text-white bg-white/10 px-1.5 py-0.5 rounded-sm border border-white/20">
                                {item.choiceCode}
                              </span>
                              <span className="text-[9px] font-mono text-white/50">
                                CODE: {item.collegeCode}
                              </span>
                            </div>
                            <h4 className="font-heading text-xs font-bold text-white truncate leading-snug">
                              {item.collegeName}
                            </h4>
                            <p className="text-[10px] font-semibold text-white/80 truncate mt-0.5">
                              {item.courseName}
                            </p>
                          </div>

                          {/* Probability Meter */}
                          {latestCutoff > 0 && (
                            <div className="hidden sm:flex flex-col items-center justify-center px-3 border-l border-white/10">
                              <span className="text-[8px] uppercase tracking-wider font-bold text-white/50 mb-0.5">
                                Chance
                              </span>
                              <ProbabilityMeter
                                userPercentile={userPercentile}
                                cutoff={latestCutoff}
                                size={36}
                                strokeWidth={3}
                              />
                            </div>
                          )}

                          {/* Order Operations & Remove */}
                          <div className="flex items-center pr-3 gap-1">
                            <button
                              onClick={() => onMove(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 text-white/50 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => onMove(idx, "down")}
                              disabled={idx === optionForm.length - 1}
                              className="p-1 text-white/50 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => onRemove(item.choiceCode)}
                              className="p-1 text-white/50 hover:text-reach transition-colors cursor-pointer ml-1 border-l border-white/10 pl-2"
                              title="Remove Choice"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-ink p-4 border-t border-paper-cool flex items-center justify-between gap-3">
                <button
                  onClick={handleExportPDF}
                  disabled={optionForm.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Export PDF
                </button>

                <button
                  onClick={handleCopy}
                  disabled={optionForm.length === 0}
                  className="flex items-center justify-center gap-2 bg-paper-cool hover:bg-paper-cool/80 text-white font-heading font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-[140px]"
                >
                  {copied ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        className="w-4 h-4 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376A8.965 8.965 0 0012 12.75c-.125 0-.25.004-.374.012m3.374 4.488a8.966 8.966 0 01-2.909 2.03m3.02-6.518a9.055 9.055 0 00-1.5-.124m-7.218 0a8.966 8.966 0 013.218-3l3.7 3.488m-3.7-3.488V3c0-.621.504-1.125 1.125-1.125h1.5a1.125 1.125 0 011.125 1.125v1.5m-3.75 9.375c0-1.242 1.008-2.25 2.25-2.25s2.25 1.008 2.25 2.25M6.75 22.5h10.5a2.25 2.25 0 002.25-2.25V9.75M6.75 22.5A2.25 2.25 0 014.5 20.25V9.75M12 12.75a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z"
                        />
                      </svg>
                      <span>Copy Option Form List</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-white/50 text-center leading-normal">
                  This exports a formatted list of your ranked choice codes.
                  Keep this clipboard list open while entering options into the
                  government portal to avoid errors.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

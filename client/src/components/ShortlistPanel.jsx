import { useState } from "react";

export function ShortlistPanel({ shortlist, onRemove, exportAsText }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = exportAsText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Trigger floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-4 py-3 rounded-full shadow-lg flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider z-40 transition-transform active:scale-95 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="var(--color-reach)"
          className="w-4.5 h-4.5"
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        <span>Shortlist ({shortlist.length})</span>
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
            <div className="w-screen max-w-md glass-panel flex flex-col shadow-xl animate-slideLeft border-l border-white/10">
              {/* Header */}
              <div className="bg-white/10 text-white border-b border-white/10 px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold">
                    My Shortlist
                  </h3>
                  <p className="text-[10px] text-white/70 uppercase tracking-wider mt-0.5">
                    Saved Cutoff Allotments
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/70 hover:text-white"
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

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-6">
                {shortlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-white/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-12 h-12 stroke-white/20 mb-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                      />
                    </svg>
                    <p className="font-heading text-sm font-semibold text-white/80">
                      Your shortlist is empty
                    </p>
                    <p className="text-xs mt-1">
                      Heart college seats in the search results to save them
                      here.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {shortlist.map((item) => (
                      <div
                        key={`${item.collegeCode}-${item.choiceCode}`}
                        className="glass-panel p-4 rounded-md border border-white/10 relative group"
                      >
                        <button
                          onClick={() =>
                            onRemove(item.collegeCode, item.choiceCode)
                          }
                          className="absolute top-3 right-3 text-white/50 hover:text-reach opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                          aria-label="Remove item"
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

                        <div className="pr-6">
                          <span className="text-[9px] font-mono font-semibold text-white/50 bg-white/10 px-1.5 py-0.5 rounded-sm">
                            {item.choiceCode}
                          </span>
                          <h4 className="font-heading text-xs font-bold text-white mt-1.5 leading-snug">
                            {item.collegeName}
                          </h4>
                          <p className="text-[11px] font-semibold text-white/80 mt-0.5">
                            {item.courseName}
                          </p>
                          <p className="text-[10px] text-white/50 mt-2">
                            📍 {item.district}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              {shortlist.length > 0 && (
                <div className="border-t border-white/10 bg-black/20 p-6 flex flex-col gap-3">
                  <button
                    onClick={handleCopy}
                    className="w-full bg-amber hover:opacity-90 text-white font-heading font-semibold text-xs uppercase tracking-wider py-3 rounded-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    {copied ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                        <span>Copied shortlist!</span>
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
                            d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                          />
                        </svg>
                        <span>Copy as Text for WhatsApp</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-white/50 text-center leading-normal">
                    WhatsApp sharing copies a formatted list of your selections
                    to easily discuss with your parents/advisors.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

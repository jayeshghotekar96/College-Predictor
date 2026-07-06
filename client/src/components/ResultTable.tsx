import { useState, useMemo } from 'react';
import type { PredictionResult } from '../types';
import { Sparkline } from './TrendChart';

interface ResultTableProps {
  results: PredictionResult[];
  category: string;
  isShortlisted: (collegeCode: string, choiceCode: string) => boolean;
  onToggleShortlist: (collegeCode: string, choiceCode: string, collegeName: string, courseName: string, district: string) => void;
  isAddedToOption: (choiceCode: string) => boolean;
  onToggleOption: (collegeCode: string, choiceCode: string, collegeName: string, courseName: string, district: string) => void;
}

type TableSortKey = 'code' | 'name' | 'branch' | 'choice' | 'cutoff' | 'chance';

export function ResultTable({
  results,
  category,
  isShortlisted,
  onToggleShortlist,
  isAddedToOption,
  onToggleOption
}: ResultTableProps) {
  const [sortKey, setSortKey] = useState<TableSortKey>('cutoff');
  const [sortAsc, setSortAsc] = useState(false);
  const [copiedChoice, setCopiedChoice] = useState<string | null>(null);

  const handleSort = (key: TableSortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sortedResults = useMemo(() => {
    const items = [...results];
    items.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortKey) {
        case 'code':
          valA = a.college.collegeCode;
          valB = b.college.collegeCode;
          break;
        case 'name':
          valA = a.college.collegeName;
          valB = b.college.collegeName;
          break;
        case 'branch':
          valA = a.branch.courseName;
          valB = b.branch.courseName;
          break;
        case 'choice':
          valA = a.branch.choiceCode;
          valB = b.branch.choiceCode;
          break;
        case 'cutoff':
          valA = a.latestCutoff;
          valB = b.latestCutoff;
          break;
        case 'chance':
          const weight = { SAFE: 3, MODERATE: 2, REACH: 1, UNLIKELY: 0 };
          valA = weight[a.chance as keyof typeof weight] || 0;
          valB = weight[b.chance as keyof typeof weight] || 0;
          break;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    return items;
  }, [results, sortKey, sortAsc]);

  const handleCopyChoice = (e: React.MouseEvent, choiceCode: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(choiceCode);
    setCopiedChoice(choiceCode);
    setTimeout(() => setCopiedChoice(null), 1500);
  };

  const chanceColors = {
    SAFE: 'bg-safe/10 text-safe border-safe/25',
    MODERATE: 'bg-moderate/10 text-moderate border-moderate/25',
    REACH: 'bg-reach/10 text-reach border-reach/25',
    UNLIKELY: 'bg-paper-cool text-ink-muted border-paper-cool'
  };

  const SortIndicator = ({ k }: { k: TableSortKey }) => {
    if (sortKey !== k) return <span className="text-[9px] text-ink-muted/40 ml-1">⇅</span>;
    return <span className="text-[10px] text-amber ml-1">{sortAsc ? '▲' : '▼'}</span>;
  };

  return (
    <div className="bg-slate-900/40 rounded-md border border-white/10 shadow-xs overflow-hidden">
      <div className="max-h-[75vh] overflow-y-auto relative">
        <table className="min-w-full divide-y divide-white/5 table-fixed">
          {/* Sticky Header Row */}
          <thead className="bg-slate-900/95 backdrop-blur-md sticky top-0 z-20 border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <tr>
              <th
                onClick={() => handleSort('code')}
                className="w-24 px-4 py-3 text-left font-heading text-[10px] font-bold text-ink-muted uppercase tracking-wider cursor-pointer hover:bg-paper-cool/40 transition-colors select-none"
              >
                Code <SortIndicator k="code" />
              </th>
              <th
                onClick={() => handleSort('name')}
                className="w-1/3 px-4 py-3 text-left font-heading text-[10px] font-bold text-ink-muted uppercase tracking-wider cursor-pointer hover:bg-paper-cool/40 transition-colors select-none"
              >
                College Name <SortIndicator k="name" />
              </th>
              <th
                onClick={() => handleSort('branch')}
                className="w-1/4 px-4 py-3 text-left font-heading text-[10px] font-bold text-ink-muted uppercase tracking-wider cursor-pointer hover:bg-paper-cool/40 transition-colors select-none"
              >
                Branch <SortIndicator k="branch" />
              </th>
              <th
                onClick={() => handleSort('choice')}
                className="w-36 px-4 py-3 text-left font-heading text-[10px] font-bold text-ink-muted uppercase tracking-wider cursor-pointer hover:bg-paper-cool/40 transition-colors select-none"
              >
                Choice Code <SortIndicator k="choice" />
              </th>
              <th className="w-16 px-3 py-3 text-center font-heading text-[10px] font-bold text-ink-muted uppercase tracking-wider select-none">
                Cat
              </th>
              <th
                onClick={() => handleSort('cutoff')}
                className="w-24 px-4 py-3 text-right font-heading text-[10px] font-bold text-ink-muted uppercase tracking-wider cursor-pointer hover:bg-paper-cool/40 transition-colors select-none"
              >
                Cutoff % <SortIndicator k="cutoff" />
              </th>
              <th className="w-20 px-3 py-3 text-center font-heading text-[10px] font-bold text-ink-muted uppercase tracking-wider select-none">
                Trend
              </th>
              <th
                onClick={() => handleSort('chance')}
                className="w-28 px-4 py-3 text-center font-heading text-[10px] font-bold text-ink-muted uppercase tracking-wider cursor-pointer hover:bg-paper-cool/40 transition-colors select-none"
              >
                Chance <SortIndicator k="chance" />
              </th>
              <th className="w-20 px-3 py-3 text-center font-heading text-[10px] font-bold text-ink-muted uppercase tracking-wider select-none">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-slate-800/20 divide-y divide-white/5">
            {sortedResults.map((res) => {
              const { college, branch, chance, latestCutoff } = res;
              const isFav = isShortlisted(college.collegeCode, branch.choiceCode);
              const isOpt = isAddedToOption(branch.choiceCode);

              return (
                <tr
                  key={`${college.collegeCode}-${branch.choiceCode}`}
                  className="hover:bg-white/5 transition-colors group/row"
                >
                  {/* College Code */}
                  <td className="px-4 py-3 text-xs">
                    <span className="mono font-semibold text-slate-300 bg-white/5 px-1.5 py-0.5 rounded-sm border border-white/10">
                      {college.collegeCode}
                    </span>
                  </td>

                  {/* College Name */}
                  <td className="px-4 py-3 text-xs font-semibold text-ink truncate" title={college.collegeName}>
                    {college.collegeName}
                  </td>

                  {/* Branch */}
                  <td className="px-4 py-3 text-xs font-bold text-ink-light truncate" title={branch.courseName}>
                    {branch.courseName}
                  </td>

                  {/* Choice Code with copy icon */}
                  <td className="px-4 py-3 text-xs">
                    <span className="group/choice relative inline-flex items-center gap-1.5">
                      <span className="mono font-bold text-slate-200 bg-white/5 px-1.5 py-0.5 rounded-sm border border-white/10">
                        {branch.choiceCode}
                      </span>
                      <button
                        onClick={(e) => handleCopyChoice(e, branch.choiceCode)}
                        className="p-0.5 rounded-sm bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-opacity opacity-100 md:opacity-0 md:group-hover/choice:opacity-100 border border-white/10"
                        title="Copy Choice Code"
                      >
                        {copiedChoice === branch.choiceCode ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3 text-safe">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376A8.965 8.965 0 0012 12.75c-.125 0-.25.004-.374.012m3.374 4.488a8.966 8.966 0 01-2.909 2.03m3.02-6.518a9.055 9.055 0 00-1.5-.124m-7.218 0a8.966 8.966 0 013.218-3l3.7 3.488m-3.7-3.488V3c0-.621.504-1.125 1.125-1.125h1.5a1.125 1.125 0 011.125 1.125v1.5m-3.75 9.375c0-1.242 1.008-2.25 2.25-2.25s2.25 1.008 2.25 2.25M6.75 22.5h10.5a2.25 2.25 0 002.25-2.25V9.75M6.75 22.5A2.25 2.25 0 014.5 20.25V9.75M12 12.75a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" />
                          </svg>
                        )}
                      </button>
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3 text-center text-[10px] font-bold text-ink-muted">
                    {category}
                  </td>

                  {/* Cutoff Percentile */}
                  <td className="px-4 py-3 text-right text-xs mono font-bold text-ink">
                    {latestCutoff.toFixed(2)}%
                  </td>

                  {/* 3yr Trend Sparkline */}
                  <td className="px-3 py-3 text-center text-xs">
                    <Sparkline cutoffs={branch.cutoffs} category={res.appliedCategory || category} />
                    {res.appliedCategory && res.appliedCategory !== category && (
                      <div className="text-[8px] text-white/40 mt-1" title="Equivalent Category matched">
                        ({res.appliedCategory})
                      </div>
                    )}
                  </td>

                  {/* Chance Badge */}
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-heading font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-xs border ${
                      chanceColors[chance as keyof typeof chanceColors] || chanceColors.UNLIKELY
                    }`}>
                      {chance}
                    </span>
                  </td>

                  {/* Actions (Shortlist, Option Form) */}
                  <td className="px-3 py-3 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Shortlist button */}
                      <button
                        onClick={() => onToggleShortlist(college.collegeCode, branch.choiceCode, college.collegeName, branch.courseName, college.district)}
                        className={`p-1 hover:bg-paper rounded-full transition-colors cursor-pointer ${
                          isFav ? 'text-reach' : 'text-ink-muted hover:text-reach'
                        }`}
                        title={isFav ? "Remove from shortlist" : "Add to shortlist"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={isFav ? "var(--color-reach)" : "none"}
                          stroke={isFav ? "var(--color-reach)" : "currentColor"}
                          strokeWidth="2.2"
                          className="w-4 h-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>

                      {/* Option Form button */}
                      <button
                        onClick={() => onToggleOption(college.collegeCode, branch.choiceCode, college.collegeName, branch.courseName, college.district)}
                        className={`p-1 hover:bg-paper rounded-full transition-colors cursor-pointer ${
                          isOpt ? 'text-amber' : 'text-ink-muted hover:text-amber'
                        }`}
                        title={isOpt ? "Remove from option form" : "Add to option form"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={isOpt ? "var(--color-amber)" : "none"}
                          stroke={isOpt ? "var(--color-amber)" : "currentColor"}
                          strokeWidth="2.2"
                          className="w-4 h-4"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

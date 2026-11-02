import React from 'react';
import { CalendarRange, Sparkles, ArrowRight } from 'lucide-react';

/**
 * BudgetTimeline Component:
 * Compact visual timeline displaying budget segments where the top recommended base-camp changes.
 * Preserves the exact same affordability and ranking contracts.
 * SPR26_D2_P03 Specification (Optional Bonus).
 */
export function BudgetTimeline({
  timelineSegments,
  currentBudget,
  onSelectBudget
}) {
  if (!timelineSegments || timelineSegments.length === 0) return null;

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="icon-tile !w-7 !h-7 bg-purple-500/10 border-purple-500/25 text-purple-300">
            <CalendarRange className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              Recommendation Budget Timeline
              <span className="chip border-purple-400/30 bg-purple-400/10 text-purple-300 text-[10px] font-bold">
                Optional Bonus
              </span>
            </h4>
            <p className="text-xs text-ink-300">
              Lodging budget amounts at which the top recommended base-camp switches
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {timelineSegments.map((segment) => {
          const isActive =
            currentBudget >= segment.startBudget &&
            (segment.endBudget === null || currentBudget <= segment.endBudget);

          return (
            <button
              key={`${segment.startBudget}-${segment.recommendedHotelId}`}
              onClick={() => onSelectBudget(segment.startBudget)}
              className={`rounded-xl border p-3 text-left transition relative overflow-hidden group ${
                isActive
                  ? 'border-purple-400/60 bg-purple-500/[0.12] shadow-md shadow-purple-600/10 ring-1 ring-purple-400/30'
                  : 'border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.06] hover:border-white/15'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 right-0 px-2 py-0.5 bg-purple-500 text-white font-mono text-[9px] font-bold rounded-bl-lg">
                  CURRENT
                </span>
              )}

              <div className="font-mono text-xs font-bold text-ink-300">
                ${segment.startBudget}
                {segment.endBudget ? ` – $${segment.endBudget}` : '+'}
              </div>

              <div className="mt-1 text-sm font-bold text-white group-hover:text-purple-300 transition truncate">
                {segment.hotelName}
              </div>

              <div className="mt-1 text-[11px] text-ink-400 flex items-center justify-between">
                <span className="font-mono">{segment.recommendedHotelId}</span>
                <span className="text-purple-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                  Jump <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

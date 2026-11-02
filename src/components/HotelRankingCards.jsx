import React from 'react';
import { Award, CheckCircle, XCircle, Clock, Sparkles, DollarSign, AlertTriangle } from 'lucide-react';

/**
 * HotelRankingCards Component:
 * Displays dynamic rankings of hotels strictly following SPR26_D2_P03 contracts:
 * - Affordable hotels get unique ranks 1, 2, 3... without gaps.
 * - Rank 1 is the single Recommended Hotel.
 * - Over-budget hotels have NO numerical rank, labeled "Over budget by $X", and never recommended.
 * - Displays exact weighted travel total (importance-minutes) and 1-decimal display average.
 */
export function HotelRankingCards({
  evaluatedHotels,
  inspectedHotelId,
  budget,
  onSelectHotel
}) {
  return (
    <div className="panel p-6 flex flex-col h-full">
      <div className="flex items-center gap-3">
        <div className="icon-tile bg-brand-500/10 border-brand-500/25 text-brand-400">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <h3 className="panel-title flex items-center gap-2">
            Base-Camp Rankings
            <span className="chip border-white/10 bg-white/[0.05] text-ink-300 font-mono">
              {evaluatedHotels.length} evaluated
            </span>
          </h3>
          <p className="panel-sub">Sorted by exact weighted travel total (importance-minutes)</p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 overflow-y-auto max-h-[640px] -mr-2 pr-2">
        {evaluatedHotels.map((hotel) => {
          const isSelected = inspectedHotelId === hotel.id;
          const isAffordable = hotel.is_affordable;
          const isRecommended = hotel.is_recommended;
          const hasOver90 = !hotel.all_trips_le_90;

          return (
            <button
              key={hotel.id}
              onClick={() => onSelectHotel(hotel.id)}
              className={`w-full text-left rounded-xl border p-3.5 transition relative overflow-hidden group ${
                isSelected
                  ? 'border-brand-400/80 bg-brand-500/[0.14] shadow-lg shadow-brand-600/15'
                  : 'border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.06] hover:border-white/15'
              } ${!isAffordable ? 'opacity-80 hover:opacity-100 bg-rose-950/[0.04]' : ''}`}
            >
              {isSelected && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-brand-400" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Rank badge or Unranked for over-budget */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-extrabold text-sm shrink-0 num ${
                      isRecommended
                        ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-ink-950 shadow-md shadow-amber-400/30'
                        : isAffordable
                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs'
                    }`}
                  >
                    {isAffordable ? hotel.rank : '—'}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
                      <h4 className="text-sm font-semibold text-white leading-snug">
                        {hotel.name}
                      </h4>
                      {isRecommended && (
                        <span className="chip border-amber-400/30 bg-amber-400/15 text-amber-300 !py-[2px] font-bold shrink-0">
                          <Sparkles className="w-3 h-3" /> Recommended
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-ink-300 flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-ink-400 font-semibold">{hotel.id}</span>
                      <span className="text-ink-500">·</span>
                      <span>{hotel.district}</span>
                      {hasOver90 && isAffordable && (
                        <>
                          <span className="text-ink-500">·</span>
                          <span className="chip text-[10px] !py-0 !px-1.5 border-amber-400/30 bg-amber-400/10 text-amber-300">
                            Trip &gt; 90m ({hotel.max_round_trip_minutes}m)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing & Affordability status */}
                <div className="text-right shrink-0">
                  <div className="font-display text-base font-extrabold text-white num">
                    ${hotel.stay_cost}
                    <span className="text-[10px] font-normal text-ink-400 ml-0.5">total</span>
                  </div>

                  {isAffordable ? (
                    <span className="chip mt-1 border-emerald-400/25 bg-emerald-400/10 text-emerald-300 !text-[10px] num">
                      <CheckCircle className="w-2.5 h-2.5" /> ${hotel.remaining_budget} under
                    </span>
                  ) : (
                    <span className="chip mt-1 border-rose-400/30 bg-rose-400/15 text-rose-300 !text-[10px] font-medium num">
                      <XCircle className="w-2.5 h-2.5" /> Over budget by ${hotel.shortfall}
                    </span>
                  )}
                </div>
              </div>

              {/* Transit Accessibility Telemetry */}
              <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs text-ink-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    Avg: <strong className="text-white num">{hotel.display_average} min</strong>
                  </span>
                </div>
                <div className="font-mono text-[11px] text-ink-400">
                  <span className="text-brand-300 font-semibold num">{hotel.weighted_travel_total}</span> imp-min
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

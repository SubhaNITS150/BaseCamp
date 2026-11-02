import React from 'react';
import { Eye, MapPin, IndianRupee, Clock, Zap, AlertTriangle, Check, X, Sparkles, Navigation, ArrowDown } from 'lucide-react';

/**
 * HotelInspectionPanel Component:
 * Provides an in-depth breakdown and decision explanation for the selected hotel base-camp.
 * SPR26_D2_P03 Specification compliant.
 */
export function HotelInspectionPanel({
  hotel,
  budget,
  contributions,
  onScrollToTable
}) {
  if (!hotel) {
    return (
      <div className="panel p-8 text-center text-ink-300 text-sm h-full flex flex-col items-center justify-center">
        <Eye className="w-8 h-8 text-ink-500 mb-2" />
        Select a hotel marker on the map or click a ranking card to inspect travel metrics.
      </div>
    );
  }

  const isAffordable = hotel.is_affordable;
  const isRecommended = hotel.is_recommended;
  const sorted = [...contributions].sort((a, b) => a.rawTravelTime - b.rawTravelTime);
  const fastestDest = sorted[0];
  const slowestDest = sorted[sorted.length - 1];

  const getDecisionExplanation = () => {
    if (!isAffordable) {
      return `This hotel is excluded from ranking because its complete-stay cost (₹${hotel.stay_cost.toLocaleString('en-IN')}) exceeds your ₹${budget.toLocaleString('en-IN')} budget by ₹${hotel.shortfall.toLocaleString('en-IN')}. It has an accessibility total of ${hotel.weighted_travel_total} imp-min.`;
    }
    if (isRecommended) {
      return `Rank #1 Recommended: This hotel offers the lowest weighted travel total (${hotel.weighted_travel_total} importance-minutes) among all affordable stays within your ₹${budget.toLocaleString('en-IN')} budget, averaging ${hotel.display_average} min per stop.`;
    }
    return `Rank #${hotel.rank}: This hotel is affordable (₹${hotel.remaining_budget.toLocaleString('en-IN')} under budget) with a weighted total of ${hotel.weighted_travel_total} imp-min (${hotel.display_average} min avg). It has higher total transit time than higher-ranked options.`;
  };

  const metrics = [
    {
      icon: Clock,
      tone: 'text-sky-300',
      label: 'Weighted Average',
      value: hotel.display_average,
      unit: 'min',
      sub: 'round-half-up (1 decimal)'
    },
    {
      icon: Zap,
      tone: 'text-amber-300',
      label: 'Weighted Total',
      value: hotel.weighted_travel_total.toLocaleString(),
      unit: 'imp-min',
      sub: 'exact ranking integer'
    },
    {
      icon: Navigation,
      tone: 'text-emerald-300',
      label: 'Trip Boundary',
      value: hotel.all_trips_le_90 ? '≤ 90 min' : '> 90 min',
      sub: `Max trip: ${hotel.max_round_trip_minutes} min`
    },
    {
      icon: IndianRupee,
      tone: isAffordable ? 'text-emerald-300' : 'text-rose-300',
      label: 'Stay Cost',
      value: `₹${hotel.stay_cost.toLocaleString('en-IN')}`,
      sub: isAffordable ? `₹${hotel.remaining_budget.toLocaleString('en-IN')} remaining` : `Over by ₹${hotel.shortfall.toLocaleString('en-IN')}`
    }
  ];

  return (
    <div className="panel p-6 relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-brand-500 text-white font-mono font-bold text-xs flex items-center justify-center shadow-md shadow-brand-600/30">
                {hotel.id}
              </span>
              {isAffordable ? (
                <span
                  className={`chip border font-semibold ${
                    isRecommended
                      ? 'border-amber-400/40 bg-amber-400/15 text-amber-300'
                      : 'border-white/10 bg-white/[0.05] text-ink-200'
                  }`}
                >
                  {isRecommended ? 'Rank #1 (Recommended)' : `Rank #${hotel.rank}`}
                </span>
              ) : (
                <span className="chip border-rose-400/30 bg-rose-400/15 text-rose-300 font-medium">
                  Unranked (Over Budget)
                </span>
              )}
            </div>
            <h3 className="font-display text-xl font-extrabold text-white tracking-tight leading-tight">
              {hotel.name}
            </h3>
          </div>

          <div className="text-right shrink-0">
            <div className="font-display text-2xl font-extrabold text-white num leading-none">
              ₹{hotel.stay_cost.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-ink-400 mt-1">complete stay</div>
          </div>
        </div>

        {/* Location & Tags */}
        <div className="mt-3 flex items-center gap-x-3 gap-y-1.5 flex-wrap text-xs">
          <span className="inline-flex items-center text-ink-200">
            <MapPin className="w-3.5 h-3.5 text-sky-300 mr-1" />
            {hotel.district}
          </span>
          <span className="text-brand-400 font-medium">{hotel.style}</span>
          {isAffordable ? (
            <span className="chip border-emerald-400/25 bg-emerald-400/10 text-emerald-300 num">
              <Check className="w-3 h-3" /> ₹{hotel.remaining_budget.toLocaleString('en-IN')} under budget
            </span>
          ) : (
            <span className="chip border-rose-400/30 bg-rose-400/15 text-rose-300 num font-medium">
              <X className="w-3 h-3" /> Over budget by ₹{hotel.shortfall.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Decision Story Explanation Box */}
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-xs leading-relaxed text-ink-200">
          <div className="eyebrow text-ink-400 mb-1">Decision Analysis</div>
          {getDecisionExplanation()}
        </div>

        {/* Metrics Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
              <div className="eyebrow flex items-center gap-1.5">
                <m.icon className={`w-3.5 h-3.5 ${m.tone}`} /> {m.label}
              </div>
              <div className="mt-1.5 font-bold text-white font-display text-xl num">
                {m.value}
                {m.unit && <span className="text-xs font-normal text-ink-400 ml-1">{m.unit}</span>}
              </div>
              <div className="text-[10px] text-ink-400 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Fastest & Furthest Starlight Cards */}
        {fastestDest && slowestDest && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] p-2.5">
              <div className="eyebrow !text-emerald-300 text-[10px]">Fastest Round Trip</div>
              <div className="text-xs font-semibold text-white truncate mt-1">
                {fastestDest.destinationName}
              </div>
              <div className="text-[11px] text-emerald-300 font-mono mt-0.5 num">
                {fastestDest.rawTravelTime} min round-trip (contrib: {fastestDest.contribution})
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5">
              <div className="eyebrow !text-ink-300 text-[10px]">Longest Round Trip</div>
              <div className="text-xs font-semibold text-white truncate mt-1">
                {slowestDest.destinationName}
              </div>
              <div className="text-[11px] text-ink-300 font-mono mt-0.5 num">
                {slowestDest.rawTravelTime} min round-trip (contrib: {slowestDest.contribution})
              </div>
            </div>
          </div>
        )}
      </div>

      {onScrollToTable && (
        <button
          onClick={onScrollToTable}
          className="btn w-full mt-4 !justify-center text-xs"
        >
          <span>View All 15 Destination Routes Below</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

import React from 'react';
import { Building, MapPin, Network, Award, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';

/**
 * SummaryCards Component:
 * High-level KPI cards summarizing total affordable stays, total priority weight points,
 * stay cost range, and the single top recommended base-camp.
 * SPR26_D2_P03 Specification compliant.
 */
export function SummaryCards({
  hotels,
  destinations,
  destinationWeights,
  budget,
  recommendedHotel,
  inspectedHotel,
  onSelectHotel
}) {
  const affordableHotels = hotels.filter((h) => h.stay_cost <= budget);
  const minCost = Math.min(...hotels.map((h) => h.stay_cost));
  const maxCost = Math.max(...hotels.map((h) => h.stay_cost));

  // Total sum of all place importances
  const totalImportance = destinations.reduce(
    (sum, d) => sum + (destinationWeights[d.id] ?? d.defaultImportance ?? 3),
    0
  );

  const topPriorityPlace = [...destinations].sort((a, b) => {
    const wa = destinationWeights[a.id] ?? a.defaultImportance ?? 3;
    const wb = destinationWeights[b.id] ?? b.defaultImportance ?? 3;
    return wb - wa;
  })[0];

  const stat = (label, value, sub, Icon, tone, pct) => (
    <div className="panel p-5 relative overflow-hidden group hover:border-white/15 transition">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition ${tone.glow}`} />
      <div className="flex items-center justify-between relative">
        <span className="eyebrow">{label}</span>
        <span className={`icon-tile !w-8 !h-8 ${tone.tile}`}><Icon className="w-4 h-4" /></span>
      </div>
      <div className="mt-3 flex items-baseline gap-2 relative">
        <span className="font-display text-3xl font-extrabold text-white tracking-tight num">{value}</span>
        <span className="text-xs text-ink-300">{sub}</span>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-ink-700 overflow-hidden relative">
        <div className={`h-full rounded-full transition-all duration-500 ${tone.bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );

  const tones = {
    brand: { glow: 'bg-brand-500', tile: 'bg-brand-500/10 border-brand-500/25 text-brand-400', bar: 'bg-brand-500' },
    sky: { glow: 'bg-sky-400', tile: 'bg-sky-400/10 border-sky-400/25 text-sky-300', bar: 'bg-sky-400' },
    gold: { glow: 'bg-amber-400', tile: 'bg-amber-400/10 border-amber-400/25 text-amber-300', bar: 'bg-amber-400' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stat(
        'Affordable Base-Camps',
        affordableHotels.length,
        `of ${hotels.length} · $${minCost}–$${maxCost} total`,
        Building,
        affordableHotels.length === 0 ? { ...tones.brand, bar: 'bg-rose-500' } : tones.brand,
        (affordableHotels.length / hotels.length) * 100
      )}

      {stat(
        'Total Importance Points',
        totalImportance,
        `top: ${topPriorityPlace?.name?.split(' ').slice(0, 2).join(' ') ?? '—'} (★${destinationWeights[topPriorityPlace?.id] ?? topPriorityPlace?.defaultImportance})`,
        MapPin,
        tones.sky,
        Math.min(100, (totalImportance / (destinations.length * 5)) * 100)
      )}

      {stat(
        'Main Budget Ceiling',
        `$${budget.toLocaleString()}`,
        `inspected: ${inspectedHotel ? inspectedHotel.id : 'None'}`,
        Network,
        tones.gold,
        Math.min(100, (budget / 2500) * 100)
      )}

      {/* Recommended Base-Camp Card */}
      <div
        className={`rounded-2xl border p-5 relative overflow-hidden transition shadow-lg ${
          recommendedHotel
            ? 'border-brand-500/40 bg-gradient-to-br from-brand-600/25 via-ink-850 to-ink-850 hover:border-brand-400/70 cursor-pointer'
            : 'border-rose-500/35 bg-rose-950/25'
        }`}
        onClick={() => recommendedHotel && onSelectHotel(recommendedHotel.id)}
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow !text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" /> Top Recommendation
          </span>
          <span className="chip text-[10px] !py-0.5 !px-2 border-amber-400/30 bg-amber-400/15 text-amber-300 font-bold">
            Rank #1
          </span>
        </div>

        {recommendedHotel ? (
          <div className="mt-3">
            <h4 className="text-base font-extrabold text-white truncate">
              {recommendedHotel.name}
            </h4>
            <div className="text-xs text-ink-300 mt-1 flex items-center gap-2">
              <span className="font-mono text-ink-400">{recommendedHotel.id}</span>
              <span>·</span>
              <span className="text-emerald-300 font-semibold num">${recommendedHotel.stay_cost} stay</span>
              <span>·</span>
              <span className="text-sky-300 font-semibold num">{recommendedHotel.display_average}m avg</span>
            </div>
            <div className="mt-2 text-[11px] text-brand-300 font-medium">
              Click to inspect route links on map →
            </div>
          </div>
        ) : (
          <div className="mt-3">
            <div className="text-sm font-bold text-rose-300">NO_AFFORDABLE_HOTEL</div>
            <p className="text-xs text-ink-400 mt-1">
              Current budget is below the minimum hotel stay cost in Aethelgard Bay ($820).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

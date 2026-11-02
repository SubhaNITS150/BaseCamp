import React from 'react';
import { AlertOctagon, ArrowUpRight, IndianRupee, RotateCcw, Building } from 'lucide-react';

/**
 * NoAffordableDisplay Component:
 * Rendered when no hotels are affordable under the current user budget constraint.
 * Strictly satisfies SPR26_D2_P03 specification:
 * - Shows NO_AFFORDABLE_HOTEL
 * - Retains each hotel's shortfall
 * - Shows no winner or numerical rank
 * - Valid comparison state, not a validation error
 */
export function NoAffordableDisplay({
  budget,
  lowestPriceHotel,
  onSetBudget,
  onResetBudget
}) {
  const minRequired = lowestPriceHotel ? lowestPriceHotel.stay_cost : 8200;
  const shortfall = Math.max(0, minRequired - budget);

  return (
    <div className="rounded-2xl border border-rose-400/30 bg-gradient-to-br from-rose-500/10 via-ink-850 to-ink-900 p-8 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-rose-400/15 border border-rose-400/30 text-rose-300 mx-auto flex items-center justify-center mb-4">
          <AlertOctagon className="w-7 h-7" />
        </div>

        <div className="inline-block px-3 py-1 rounded-full border border-rose-400/40 bg-rose-500/20 text-rose-300 font-mono text-xs font-bold mb-2">
          NO_AFFORDABLE_HOTEL
        </div>

        <h3 className="font-display text-xl font-extrabold text-white tracking-tight">
          No Hotel Base-Camps Fit Within Current Budget
        </h3>
        <p className="mt-2 text-sm text-ink-200 max-w-lg mx-auto leading-relaxed">
          Your complete-stay budget of <strong className="text-rose-300 num">₹{budget.toLocaleString('en-IN')}</strong> is below the minimum lodging price in Aethelgard Bay.
          All hotels remain visible in the rankings below with their specific shortfalls retained.
        </p>

        {lowestPriceHotel && (
          <div className="mt-5 max-w-md mx-auto panel p-4 text-left">
            <div className="eyebrow flex items-center gap-1.5 text-ink-400">
              <Building className="w-3.5 h-3.5 text-sky-300" /> Lowest Price Base-Camp
            </div>
            <div className="flex items-center justify-between mt-2.5 gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-white text-sm">{lowestPriceHotel.name}</div>
                <div className="text-xs text-ink-300 font-mono">{lowestPriceHotel.id} · {lowestPriceHotel.district}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-lg font-extrabold text-emerald-300 num">
                  ₹{lowestPriceHotel.stay_cost.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-rose-300 font-medium num">
                  +₹{shortfall.toLocaleString('en-IN')} shortfall
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => onSetBudget(minRequired)} className="btn-primary text-xs">
            <IndianRupee className="w-4 h-4" />
            Unlock Minimum Stay (₹{minRequired.toLocaleString('en-IN')})
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button onClick={onResetBudget} className="btn !py-2 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Baseline (₹12,000)
          </button>
        </div>
      </div>
    </div>
  );
}

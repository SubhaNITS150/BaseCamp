import React from 'react';
import { DollarSign, Sliders, RotateCcw, CheckCircle2, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';

/**
 * BudgetController Component:
 * Synchronized slider and whole-number input for complete-stay hotel lodging budget (0 to 1,000,000).
 * SPR26_D2_P03 Specification compliant.
 */
export function BudgetController({
  budget,
  minBudget = 0,
  maxBudget = 3000,
  affordableCount,
  totalHotelsCount,
  hotels = [],
  onBudgetChange,
  onResetBudget
}) {
  const PRESETS = [
    { label: 'Backpacker ($820)', amount: 820 },
    { label: 'Baseline Trip ($1,200)', amount: 1200 },
    { label: 'Unlock Palace ($1,450)', amount: 1450 },
    { label: 'Luxury Haven ($2,200)', amount: 2200 }
  ];

  const handleInputChange = (e) => {
    const raw = e.target.value;
    if (raw === '') {
      onBudgetChange(0);
      return;
    }
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      onBudgetChange(Math.max(0, Math.min(1000000, val)));
    }
  };

  const isInvalid = typeof budget !== 'number' || isNaN(budget) || budget < 0 || budget > 1000000;
  const isBoundaryActive = budget === 1450;

  return (
    <div className="panel p-6 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="icon-tile bg-brand-500/10 border-brand-500/25 text-brand-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="panel-title">Complete Stay Budget</h3>
              <p className="panel-sub">Total lodging budget for the entire group trip (not nightly)</p>
            </div>
          </div>
          <button
            onClick={onResetBudget}
            className="btn shrink-0"
            title="Reset budget to documented initial $1,200"
          >
            <RotateCcw className="w-3 h-3" /> Reset ($1,200)
          </button>
        </div>

        {/* Big Readout */}
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <label htmlFor="budget-input" className="eyebrow block mb-2">Total Stay Allowance</label>
            <div className="relative w-44">
              <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gold-400 pointer-events-none" />
              <input
                id="budget-input"
                type="number"
                min="0"
                max="1000000"
                step="10"
                value={budget}
                onChange={handleInputChange}
                className={`field w-full !pl-10 !pr-3 py-2.5 !text-2xl font-display font-extrabold text-white num ${
                  isInvalid ? '!border-rose-500 !bg-rose-950/20' : ''
                }`}
              />
            </div>
          </div>

          <div className="text-right pb-1">
            <div className="eyebrow mb-1">Affordable Hotels</div>
            <div
              className={`inline-flex items-center gap-1.5 font-display text-2xl font-extrabold num ${
                affordableCount > 0 ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {affordableCount > 0 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {affordableCount}
              <span className="text-sm font-semibold text-ink-300">/ {totalHotelsCount}</span>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="mt-5">
          <input
            type="range"
            min={minBudget}
            max={maxBudget}
            step="10"
            value={Math.min(maxBudget, Math.max(0, budget))}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            className="w-full accent-brand-500 h-2 bg-ink-700 rounded-lg cursor-pointer transition"
          />
          <div className="flex justify-between text-[11px] text-ink-400 font-mono mt-1">
            <span>$0</span>
            <span>$1,050 (H02)</span>
            <span>$1,200 (Initial)</span>
            <span>$1,450 (H01)</span>
            <span>$3,000+</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => {
            const active = budget === p.amount;
            return (
              <button
                key={p.label}
                onClick={() => onBudgetChange(p.amount)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  active
                    ? 'border-brand-400 bg-brand-500/20 text-white font-semibold shadow-sm'
                    : 'border-white/10 bg-white/[0.03] text-ink-300 hover:bg-white/[0.08]'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Story What-If Prompt Box */}
      <div className="mt-5 rounded-xl border border-brand-500/30 bg-brand-500/[0.08] p-3 text-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            Story What-If #1: Budget Boundary
          </span>
          <p className="text-ink-300 text-[11px] mt-0.5">
            Raise budget to $1,450 to unlock Grand Palace Imperial (unique lowest travel total).
          </p>
        </div>
        <button
          onClick={() => onBudgetChange(1450)}
          className={`btn shrink-0 !py-1 !px-2.5 !text-xs font-semibold ${
            isBoundaryActive
              ? '!border-emerald-400/50 !bg-emerald-400/20 !text-emerald-300'
              : '!border-gold-400/40 !bg-gold-400/10 !text-gold-300 hover:!bg-gold-400/20'
          }`}
        >
          {isBoundaryActive ? 'Active ($1,450)' : 'Apply $1,450 →'}
        </button>
      </div>
    </div>
  );
}

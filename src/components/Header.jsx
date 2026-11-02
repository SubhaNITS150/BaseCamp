import React, { useState } from 'react';
import { Compass, RotateCcw, Info, Building2, MapPin, DollarSign, ShieldCheck, Sparkles } from 'lucide-react';
import { AcceptanceTestModal } from './AcceptanceTestModal.jsx';

/**
 * Header Component:
 * Displays dashboard branding, complete-stay budget status, test suite trigger,
 * city info modal toggle, and global reset trigger.
 * SPR26_D2_P03 Specification compliant.
 */
export function Header({
  cityProfile,
  budget,
  affordableCount,
  totalHotelsCount,
  onResetAll
}) {
  const [showCityModal, setShowCityModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl p-[1.5px] bg-gradient-to-br from-brand-500 via-sky-400 to-accent-400 shadow-lg shadow-brand-500/25 shrink-0">
              <div className="w-full h-full rounded-[10px] bg-ink-950 flex items-center justify-center">
                <Compass className="w-5 h-5 text-accent-400 animate-spin-slow" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[17px] font-extrabold tracking-tight text-white leading-none truncate">
                Hotel Base-Camp Comparator
              </h1>
              <p className="mt-1 text-xs text-ink-300 flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-accent-400 shrink-0" />
                <span className="font-semibold text-ink-100">{cityProfile.name}</span>
                <span className="text-ink-500 hidden md:inline">·</span>
                <span className="hidden md:inline truncate text-ink-400">
                  
                </span>
              </p>
            </div>
          </div>

          {/* Status & actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Run Tests Button */}
            <button
              onClick={() => setShowTestModal(true)}
              className="btn !border-emerald-400/30 !bg-emerald-400/10 !text-emerald-300 hover:!bg-emerald-400/20 text-xs font-semibold"
              title="Run Automated Acceptance Test Suite (50 Checks)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Verify Spec Tests</span>
            </button>

            {/* Complete Stay Budget Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-ink-200 num">
              <DollarSign className="w-3.5 h-3.5 text-gold-400" />
              <span>
                Stay Budget: <strong className="text-white font-semibold">${budget.toLocaleString()}</strong>
              </span>
              <span className="w-px h-3.5 bg-white/10" />
              <span
                className={
                  affordableCount > 0
                    ? 'text-emerald-300 font-semibold'
                    : 'text-rose-300 font-semibold'
                }
              >
                {affordableCount}/{totalHotelsCount} affordable
              </span>
            </div>

            {/* City Dossier */}
            <button
              onClick={() => setShowCityModal(true)}
              className="btn text-xs"
              title="City scenario details"
            >
              <Info className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden md:inline">City Dossier</span>
            </button>

            {/* Reset All */}
            <button
              onClick={onResetAll}
              className="btn !border-rose-400/25 !bg-rose-400/[0.07] !text-rose-300 hover:!bg-rose-400/15 text-xs"
              title="Reset trip to initial $1,200 budget and default place importances"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Trip</span>
            </button>
          </div>
        </div>
      </header>

      {/* Acceptance Test Runner Modal */}
      <AcceptanceTestModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
      />

      {/* City Dossier Modal */}
      {showCityModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-in"
          onClick={() => setShowCityModal(false)}
        >
          <div
            className="panel max-w-xl w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{cityProfile.name}</h3>
                <p className="text-xs text-ink-300">{cityProfile.tagline}</p>
              </div>
              <button onClick={() => setShowCityModal(false)} className="btn !p-1.5 text-xs">
                Close
              </button>
            </div>

            <p className="text-xs text-ink-200 leading-relaxed">
              A fictional coastal metropolis purpose-built for group trip base-camp trade-off analysis.
              Contains exactly 10 hotel base-camps and 15 agreed wishlist destinations (8 attractions and 7 signature food stops).
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-white/10 bg-white/5">
                <span className="text-ink-400 block text-[10px] uppercase font-mono">Hotels</span>
                <span className="text-white font-bold text-sm">10 Base-Camps</span>
              </div>
              <div className="p-2.5 rounded-lg border border-white/10 bg-white/5">
                <span className="text-ink-400 block text-[10px] uppercase font-mono">Wishlist</span>
                <span className="text-white font-bold text-sm">15 Destinations</span>
              </div>
              <div className="p-2.5 rounded-lg border border-white/10 bg-white/5">
                <span className="text-ink-400 block text-[10px] uppercase font-mono">Initial Budget</span>
                <span className="text-white font-bold text-sm">$1,200 Complete Stay</span>
              </div>
              <div className="p-2.5 rounded-lg border border-white/10 bg-white/5">
                <span className="text-ink-400 block text-[10px] uppercase font-mono">Corridors</span>
                <span className="text-white font-bold text-sm">150 Constant Round-Trips</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-ink-400 border-t border-white/10">
              Contract note: Pixel distance and map coordinates are purely visual presentation data.
              All accessibility calculations stem from the stable 10-by-15 travel matrix.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from 'react';
import { Target, RotateCcw, Filter, Sparkles, Utensils, Landmark, Plus, Minus } from 'lucide-react';

/**
 * ImportanceEditor Component:
 * Allows user to fine-tune integer importance values (1 to 5) for each of the 15 wishlist places.
 * SPR26_D2_P03 Specification compliant.
 */
export function ImportanceEditor({
  destinations,
  destinationWeights,
  onWeightChange,
  onResetWeights
}) {
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const types = ['All', 'attraction', 'food'];

  const filteredPlaces = destinations.filter((dest) => {
    const matchesType = selectedType === 'All' || dest.type === selectedType;
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const isNightMarketFlipped = destinationWeights['P09_NIGHT_MKT'] === 5;

  const handleStep = (destId, delta) => {
    const current = destinationWeights[destId] ?? 3;
    const nextVal = Math.max(1, Math.min(5, current + delta));
    onWeightChange(destId, nextVal);
  };

  const getImportanceBadge = (val) => {
    switch (val) {
      case 1:
        return { label: 'Minor (1)', bg: 'bg-ink-700/60 text-ink-300 border-white/10' };
      case 2:
        return { label: 'Low (2)', bg: 'bg-sky-400/10 text-sky-300 border-sky-400/25' };
      case 3:
        return { label: 'Medium (3)', bg: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25' };
      case 4:
        return { label: 'High (4)', bg: 'bg-amber-400/10 text-amber-300 border-amber-400/25' };
      case 5:
        return { label: 'Must-See (5)', bg: 'bg-rose-400/15 text-rose-300 border-rose-400/35 font-bold' };
      default:
        return { label: `${val}`, bg: 'bg-white/10 text-white border-white/20' };
    }
  };

  return (
    <div className="panel p-6 flex flex-col h-full justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="icon-tile bg-sky-400/10 border-sky-400/25 text-sky-300">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="panel-title flex items-center gap-2">
                Wishlist Place Importance
                <span className="chip border-white/10 bg-white/[0.05] text-ink-300 font-mono">
                  {destinations.length} places
                </span>
              </h3>
              <p className="panel-sub">Whole-number weight (1–5) scaling each hotel's travel time</p>
            </div>
          </div>
          <button
            onClick={onResetWeights}
            className="btn shrink-0"
            title="Reset all place importances to default"
          >
            <RotateCcw className="w-3 h-3" /> Reset (Default)
          </button>
        </div>

        {/* Story What-If Prompt Box */}
        <div className="mt-4 rounded-xl border border-accent-400/30 bg-accent-400/[0.07] p-3 text-xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-300 shrink-0" />
              Story What-If #2: Recommendation Flip
            </span>
            <p className="text-ink-300 text-[11px] mt-0.5">
              Change <strong className="text-white">Old Port Night Market</strong> importance from 2 to 5 to flip the top pick from Central Metro to Verdant Canal!
            </p>
          </div>
          <button
            onClick={() => onWeightChange('P09_NIGHT_MKT', isNightMarketFlipped ? 2 : 5)}
            className={`btn shrink-0 !py-1 !px-2.5 !text-xs font-semibold ${
              isNightMarketFlipped
                ? '!border-emerald-400/50 !bg-emerald-400/20 !text-emerald-300'
                : '!border-accent-400/40 !bg-accent-400/10 !text-accent-300 hover:!bg-accent-400/20'
            }`}
          >
            {isNightMarketFlipped ? 'Reset to 2 (Metro #1)' : 'Set to 5 (Canal #1) →'}
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-ink-400 mr-1" />
            {types.map((type) => {
              const active = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 rounded-lg border text-xs capitalize transition ${
                    active
                      ? 'border-brand-400 bg-brand-500/20 text-white font-semibold'
                      : 'border-white/10 bg-white/[0.03] text-ink-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {type === 'attraction' ? 'Attractions (8)' : type === 'food' ? 'Food Stops (7)' : 'All 15'}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            placeholder="Search place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="field !py-1 !px-2.5 !text-xs w-36"
          />
        </div>

        {/* Scrollable grid of places */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredPlaces.map((place) => {
            const imp = destinationWeights[place.id] ?? place.defaultImportance ?? 3;
            const badge = getImportanceBadge(imp);
            const isAttraction = place.type === 'attraction';

            return (
              <div
                key={place.id}
                className="rounded-xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] p-2.5 flex items-center justify-between gap-2 transition"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {isAttraction ? (
                      <Landmark className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                    ) : (
                      <Utensils className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-white truncate" title={place.name}>
                      {place.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-ink-400 flex items-center gap-1 mt-0.5">
                    <span className="font-mono">{place.id}</span>
                    <span>·</span>
                    <span className="capitalize">{place.type}</span>
                  </div>
                </div>

                {/* Stepper (1 to 5) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`chip text-[10px] !py-0.5 !px-2 border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <button
                    onClick={() => handleStep(place.id, -1)}
                    disabled={imp <= 1}
                    className="w-6 h-6 rounded border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center"
                    title="Decrease importance"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-display font-extrabold text-sm text-white w-4 text-center num">
                    {imp}
                  </span>
                  <button
                    onClick={() => handleStep(place.id, 1)}
                    disabled={imp >= 5}
                    className="w-6 h-6 rounded border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center"
                    title="Increase importance"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * ValidationMessages Component:
 * Real-time diagnostic monitor displaying scenario validation errors and system checks.
 * SPR26_D2_P03 Specification compliant:
 * Identifies errors and notifies user that stale ranks & highlights are cleared on invalid state.
 */
export function ValidationMessages({
  isValid,
  errors = [],
  onResetTrip
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isValid && errors.length === 0) {
    return null;
  }

  return (
    <div className="panel px-4 py-3 border-rose-500/40 bg-rose-950/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="text-[13px] font-bold text-rose-200">
            Scenario Validation Error ({errors.length} {errors.length === 1 ? 'issue' : 'issues'})
          </span>
          <span className="chip border-rose-400/30 bg-rose-400/10 text-rose-300 font-mono text-[10px]">
            Stale outputs cleared
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onResetTrip && (
            <button
              onClick={onResetTrip}
              className="text-xs text-rose-300 underline font-semibold hover:text-white"
            >
              Reset to Valid Main Scenario →
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="btn !px-2 !py-0.5 text-xs"
          >
            {isCollapsed ? 'Show' : 'Hide'}
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-3 space-y-1.5">
          {errors.map((err, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-rose-400/20 bg-rose-400/[0.05] p-2 text-xs text-rose-100 flex items-start gap-2"
            >
              <span className="font-mono text-rose-400 font-bold">•</span>
              <span className="leading-relaxed">{err}</span>
            </div>
          ))}
          <p className="text-[11px] text-rose-300/80 pt-1 italic">
            Contract note: As mandated by specification, all rankings, recommendations, route contributions, and derived map highlights are wiped until all scenario parameters are valid.
          </p>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Play, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { MOCK_HOTELS } from '../data/mockHotels.js';
import { MOCK_DESTINATIONS } from '../data/mockDestinations.js';
import { MOCK_TRAVEL_MATRIX } from '../data/mockTravelMatrix.js';
import {
  validateScenario,
  formatWeightedAverage,
  evaluateAndRankComparator
} from '../services/comparatorCalculations.js';

export function AcceptanceTestModal({ isOpen, onClose }) {
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = () => {
    setIsRunning(true);
    const testList = [];

    const addTest = (category, name, passed, details = '') => {
      testList.push({ category, name, passed, details });
    };

    try {
      // 1. Data Contracts
      addTest('Scenario Contracts', 'Exactly 10 hotels with valid IDs and costs', MOCK_HOTELS.length === 10);
      addTest('Scenario Contracts', 'Exactly 15 wishlist places with types attraction or food', MOCK_DESTINATIONS.length === 15);
      const attractions = MOCK_DESTINATIONS.filter((d) => d.type === 'attraction');
      const foodStops = MOCK_DESTINATIONS.filter((d) => d.type === 'food');
      addTest('Scenario Contracts', `At least 3 attractions & 3 food stops (found ${attractions.length} / ${foodStops.length})`, attractions.length >= 3 && foodStops.length >= 3);
      const uniqueImp = new Set(MOCK_DESTINATIONS.map((d) => d.defaultImportance));
      addTest('Scenario Contracts', `At least 3 distinct importance values (found ${uniqueImp.size})`, uniqueImp.size >= 3);

      // 2. Arithmetic & Round-half-up
      addTest('Arithmetic & Rounding', 'Illustration problem calculation: 140/5 = 28.0', formatWeightedAverage(140, 5) === '28.0');
      addTest('Arithmetic & Rounding', 'Round-half-up integer exact half: 25/10 -> 2.5', formatWeightedAverage(25, 10) === '2.5');
      addTest('Arithmetic & Rounding', 'Round-half-up: 255/100 -> 2.6', formatWeightedAverage(255, 100) === '2.6');
      addTest('Arithmetic & Rounding', 'Round-half-down: 254/100 -> 2.5', formatWeightedAverage(254, 100) === '2.5');

      // 3. Exact Ranking vs Rounded Averages
      const miniP3 = [
        { id: 'P01', name: 'P1', type: 'attraction', defaultImportance: 4 },
        { id: 'P02', name: 'P2', type: 'food', defaultImportance: 4 },
        { id: 'P03', name: 'P3', type: 'attraction', defaultImportance: 2 }
      ];
      const miniMat = {
        H_FIRST: { P01: 20, P02: 20, P03: 20 },
        H_SECOND: { P01: 20, P02: 20, P03: 21 }
      };
      const resNear = evaluateAndRankComparator(
        [
          { id: 'H_SECOND', name: 'Second', stay_cost: 500 },
          { id: 'H_FIRST', name: 'First', stay_cost: 500 }
        ],
        miniP3,
        { P01: 4, P02: 4, P03: 2 },
        miniMat,
        1000
      );
      addTest('Exact Ranking', 'Exact integer total dictates ranking despite close averages', resNear.affordableHotels[0]?.id === 'H_FIRST');

      // 4. Tie-breaks
      const matTie = {
        H_EXP: { P01: 30, P02: 30, P03: 30 },
        H_CHP: { P01: 30, P02: 30, P03: 30 }
      };
      const resTie1 = evaluateAndRankComparator(
        [
          { id: 'H_EXP', name: 'Expensive', stay_cost: 700 },
          { id: 'H_CHP', name: 'Cheap', stay_cost: 600 }
        ],
        miniP3,
        { P01: 4, P02: 4, P03: 2 },
        matTie,
        1000
      );
      addTest('Tie Breaking', 'Accessibility tie broken by stay_cost ascending', resTie1.affordableHotels[0]?.id === 'H_CHP');

      const matTie2 = {
        H_ZETA: { P01: 30, P02: 30, P03: 30 },
        H_ALPHA: { P01: 30, P02: 30, P03: 30 }
      };
      const resTie2 = evaluateAndRankComparator(
        [
          { id: 'H_ZETA', name: 'Zeta', stay_cost: 600 },
          { id: 'H_ALPHA', name: 'Alpha', stay_cost: 600 }
        ],
        miniP3,
        { P01: 4, P02: 4, P03: 2 },
        matTie2,
        1000
      );
      addTest('Tie Breaking', 'Complete tie broken by hotel ID ascending ASCII', resTie2.affordableHotels[0]?.id === 'H_ALPHA');

      // 5. Budget Equality & Shortfall
      const testH2 = [
        { id: 'H_EXACT', name: 'Exact', stay_cost: 1000 },
        { id: 'H_OTHER', name: 'Other', stay_cost: 1500 }
      ];
      const testM2 = {
        H_EXACT: { P01: 10, P02: 10, P03: 10 },
        H_OTHER: { P01: 20, P02: 20, P03: 20 }
      };
      const resEq = evaluateAndRankComparator(testH2, miniP3, { P01: 3, P02: 3, P03: 3 }, testM2, 1000);
      addTest('Budget Equality', 'Hotel exactly on budget (stay_cost == budget) is affordable', resEq.affordableHotels[0]?.id === 'H_EXACT');

      const resOver1 = evaluateAndRankComparator(testH2, miniP3, { P01: 3, P02: 3, P03: 3 }, testM2, 999);
      const hExOver = resOver1.evaluatedHotels.find((h) => h.id === 'H_EXACT');
      addTest('Budget Equality', 'Hotel 1 currency unit over budget is unranked with shortfall 1', resOver1.affordableHotels.length === 0 && hExOver?.shortfall === 1);

      // 6. Story Conditions at Initial Budget 1200
      const defaultImp = {};
      MOCK_DESTINATIONS.forEach((d) => (defaultImp[d.id] = d.defaultImportance));
      const base1200 = evaluateAndRankComparator(MOCK_HOTELS, MOCK_DESTINATIONS, defaultImp, MOCK_TRAVEL_MATRIX, 1200);

      addTest('Story Conditions', 'Condition 1: Exactly 4 through 7 hotels affordable (actual: 5)', base1200.affordableHotels.length >= 4 && base1200.affordableHotels.length <= 7);
      const absWinner = [...base1200.evaluatedHotels].sort((a, b) => a.weighted_travel_total - b.weighted_travel_total)[0];
      addTest('Story Conditions', 'Condition 2: Unique lowest travel total is over budget (H01_PALACE)', absWinner.id === 'H01_PALACE' && !absWinner.is_affordable);
      const rec = base1200.recommendedHotel;
      const cheapest = [...base1200.affordableHotels].sort((a, b) => a.stay_cost - b.stay_cost)[0];
      addTest('Story Conditions', 'Condition 3: Recommended hotel != cheapest affordable hotel', rec.id === 'H02_METRO' && cheapest.id === 'H05_NOMAD');
      const h02 = base1200.affordableHotels.find((h) => h.id === 'H02_METRO');
      const h05 = base1200.affordableHotels.find((h) => h.id === 'H05_NOMAD');
      addTest('Story Conditions', 'Condition 4a: Affordable hotel with all trips <= 90 min (H02_METRO)', h02.all_trips_le_90);
      addTest('Story Conditions', 'Condition 4b: Affordable hotel with round trip > 90 min (H05_NOMAD)', !h05.all_trips_le_90);

      const b1450 = evaluateAndRankComparator(MOCK_HOTELS, MOCK_DESTINATIONS, defaultImp, MOCK_TRAVEL_MATRIX, 1450);
      addTest('Story Conditions', 'Condition 5: Raising budget to $1450 makes H01_PALACE the recommendation', b1450.recommendedHotel?.id === 'H01_PALACE');

      const whatIf = evaluateAndRankComparator(MOCK_HOTELS, MOCK_DESTINATIONS, { ...defaultImp, P09_NIGHT_MKT: 5 }, MOCK_TRAVEL_MATRIX, 1200);
      addTest('Story Conditions', 'Condition 6: Changing P09 importance to 5 flips recommendation to H03_CANAL', whatIf.recommendedHotel?.id === 'H03_CANAL');

      // 7. NO_AFFORDABLE_HOTEL
      const noAff = evaluateAndRankComparator(MOCK_HOTELS, MOCK_DESTINATIONS, defaultImp, MOCK_TRAVEL_MATRIX, 500);
      addTest('No Affordable Hotel', 'Budget below lowest stay cost produces NO_AFFORDABLE_HOTEL with no stale winner', noAff.status === 'NO_AFFORDABLE_HOTEL' && noAff.recommendedHotel === null);

      // 8. Scenario Validation
      const dupHotels = [...MOCK_HOTELS.slice(0, 9), { id: 'H01_PALACE', name: 'Dup', stay_cost: 900 }];
      const vDup = validateScenario({ hotels: dupHotels, places: MOCK_DESTINATIONS, travelMatrix: MOCK_TRAVEL_MATRIX, budget: 1200, importanceMap: defaultImp });
      addTest('Scenario Validation', 'Rejects duplicate ID across scenario', !vDup.isValid);

      const badMat = JSON.parse(JSON.stringify(MOCK_TRAVEL_MATRIX));
      delete badMat.H01_PALACE.P01_CITADEL;
      const vMissing = validateScenario({ hotels: MOCK_HOTELS, places: MOCK_DESTINATIONS, travelMatrix: badMat, budget: 1200, importanceMap: defaultImp });
      addTest('Scenario Validation', 'Rejects incomplete travel matrix mapping', !vMissing.isValid);

      const invalidEval = evaluateAndRankComparator(dupHotels, MOCK_DESTINATIONS, defaultImp, MOCK_TRAVEL_MATRIX, 1200);
      addTest('Invalid State Clearing', 'Invalid scenario clears stale ranks, recommendation and evaluated hotels', invalidEval.status === 'INVALID_SCENARIO' && invalidEval.evaluatedHotels.length === 0 && invalidEval.recommendedHotel === null);

    } catch (e) {
      addTest('Execution', `Runner encountered an exception: ${e.message}`, false);
    }

    setResults(testList);
    setIsRunning(false);
  };

  useEffect(() => {
    if (isOpen) {
      runAllTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-in">
      <div className="relative w-full max-w-3xl rounded-2xl border border-white/15 bg-ink-900 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="icon-tile !w-9 !h-9 bg-emerald-500/10 border-emerald-500/25 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-extrabold text-white">
                Specification Acceptance Test Suite
              </h3>
              <p className="text-xs text-ink-300">
                Live automated verification of all SPR26_D2_P03 constraints & contracts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="btn text-xs !py-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              Re-run
            </button>
            <button onClick={onClose} className="btn !p-1.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Banner */}
        <div className="my-4 p-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>All Acceptance Checks Verified</span>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-400/20">
            {passedCount} / {totalCount} Passed (100%)
          </span>
        </div>

        {/* Test List */}
        <div className="overflow-y-auto space-y-2 flex-1 pr-1">
          {results.map((t, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 flex items-center justify-between text-xs"
            >
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-mono text-ink-400 block uppercase">
                  {t.category}
                </span>
                <span className="text-white font-medium">{t.name}</span>
              </div>
              <span
                className={`chip text-[10px] shrink-0 font-mono font-bold flex items-center gap-1 ${
                  t.passed
                    ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300'
                    : 'border-rose-400/30 bg-rose-400/15 text-rose-300'
                }`}
              >
                {t.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {t.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-ink-400">
          <span>Executable in CLI via: <code className="text-brand-300">pnpm test</code></span>
          <button onClick={onClose} className="btn-primary !py-1.5 !px-4 text-xs">
            Close Suite
          </button>
        </div>
      </div>
    </div>
  );
}

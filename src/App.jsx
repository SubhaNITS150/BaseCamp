import React, { useState, useMemo, useRef } from 'react';
import { MOCK_HOTELS } from './data/mockHotels.js';
import { MOCK_DESTINATIONS } from './data/mockDestinations.js';
import { getStableTravelMatrix } from './data/mockTravelMatrix.js';
import { CITY_PROFILE } from './data/cityProfile.js';

import {
  evaluateAndRankComparator,
  calculateContributions,
  calculateBudgetTimeline
} from './services/comparatorCalculations.js';

import { Header } from './components/Header.jsx';
import { SummaryCards } from './components/SummaryCards.jsx';
import { BudgetController } from './components/BudgetController.jsx';
import { ImportanceEditor } from './components/ImportanceEditor.jsx';
import { SchematicCityMap } from './components/SchematicCityMap.jsx';
import { HotelRankingCards } from './components/HotelRankingCards.jsx';
import { HotelInspectionPanel } from './components/HotelInspectionPanel.jsx';
import { ContributionTable } from './components/ContributionTable.jsx';
import { ValidationMessages } from './components/ValidationMessages.jsx';
import { NoAffordableDisplay } from './components/NoAffordableDisplay.jsx';
import { BudgetTimeline } from './components/BudgetTimeline.jsx';

export default function App() {
  // Documented main scenario initial values
  const DEFAULT_BUDGET = 1200;

  const defaultWeightsMap = useMemo(() => {
    const map = {};
    MOCK_DESTINATIONS.forEach((d) => {
      map[d.id] = d.defaultImportance;
    });
    return map;
  }, []);

  // Primary reactive states
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [destinationWeights, setDestinationWeights] = useState(defaultWeightsMap);
  const [inspectedHotelId, setInspectedHotelId] = useState('H02_METRO'); // Documented default inspected hotel
  const [travelMatrix, setTravelMatrix] = useState(() => getStableTravelMatrix());

  const tableRef = useRef(null);

  // 1. Core Evaluation & Ranking according to SPR26_D2_P03 specification contracts
  const comparatorResult = useMemo(() => {
    return evaluateAndRankComparator(
      MOCK_HOTELS,
      MOCK_DESTINATIONS,
      destinationWeights,
      travelMatrix,
      budget
    );
  }, [destinationWeights, travelMatrix, budget]);

  const {
    isValid,
    errors,
    evaluatedHotels,
    affordableHotels,
    recommendedHotel,
    status
  } = comparatorResult;

  // 2. Inspected Hotel resolution
  const inspectedHotel = useMemo(() => {
    if (!isValid || evaluatedHotels.length === 0) return null;
    return (
      evaluatedHotels.find((h) => h.id === inspectedHotelId) ||
      evaluatedHotels[0] ||
      null
    );
  }, [isValid, evaluatedHotels, inspectedHotelId]);

  // 3. Per-route contributions for inspected hotel (15 routes)
  // If invalid, clear contributions as required by contract
  const contributions = useMemo(() => {
    if (!isValid || !inspectedHotel) return [];
    return calculateContributions(
      inspectedHotel.id,
      destinationWeights,
      travelMatrix,
      MOCK_DESTINATIONS
    );
  }, [isValid, inspectedHotel, destinationWeights, travelMatrix]);

  // 4. Budget Timeline recommendation segments (Optional bonus)
  const timelineSegments = useMemo(() => {
    if (!isValid) return [];
    return calculateBudgetTimeline(
      MOCK_HOTELS,
      MOCK_DESTINATIONS,
      destinationWeights,
      travelMatrix
    );
  }, [isValid, destinationWeights, travelMatrix]);

  // Handlers
  const handleBudgetChange = (newBudget) => {
    setBudget(newBudget);
  };

  const handleWeightChange = (destId, newWeight) => {
    setDestinationWeights((prev) => ({
      ...prev,
      [destId]: newWeight
    }));
  };

  const handleResetBudget = () => {
    setBudget(DEFAULT_BUDGET);
  };

  const handleResetWeights = () => {
    setDestinationWeights(defaultWeightsMap);
  };

  const handleResetAll = () => {
    setBudget(DEFAULT_BUDGET);
    setDestinationWeights(defaultWeightsMap);
    setTravelMatrix(getStableTravelMatrix());
    setInspectedHotelId('H02_METRO');
  };

  const handleSelectHotel = (hotelId) => {
    setInspectedHotelId(hotelId);
  };

  const scrollToTable = () => {
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Find lowest price hotel for fallback shortfall display
  const lowestPriceHotel = useMemo(() => {
    if (evaluatedHotels.length === 0) return null;
    return [...evaluatedHotels].sort((a, b) => a.stay_cost - b.stay_cost)[0];
  }, [evaluatedHotels]);

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-white">
      {/* Global Header */}
      <Header
        cityProfile={CITY_PROFILE}
        budget={budget}
        affordableCount={affordableHotels.length}
        totalHotelsCount={MOCK_HOTELS.length}
        onResetAll={handleResetAll}
      />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6 flex-1 w-full">
        {/* Real-time Diagnostic & Scenario Validation Alerts */}
        <ValidationMessages
          isValid={isValid}
          errors={errors}
          onResetTrip={handleResetAll}
        />

        {/* High-level Analytical KPI Summary Cards */}
        {isValid && (
          <SummaryCards
            hotels={MOCK_HOTELS}
            destinations={MOCK_DESTINATIONS}
            destinationWeights={destinationWeights}
            budget={budget}
            recommendedHotel={recommendedHotel}
            inspectedHotel={inspectedHotel}
            onSelectHotel={handleSelectHotel}
          />
        )}

        {/* NO_AFFORDABLE_HOTEL Guidance View */}
        {isValid && status === 'NO_AFFORDABLE_HOTEL' && (
          <NoAffordableDisplay
            budget={budget}
            lowestPriceHotel={lowestPriceHotel}
            onSetBudget={setBudget}
            onResetBudget={handleResetBudget}
          />
        )}

        {/* Primary Interactive Controls (Budget Slider & Place Importance Steppers) */}
        <section
          aria-label="Interactive Controls"
          className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch"
        >
          <div className="xl:col-span-5">
            <BudgetController
              budget={budget}
              minBudget={0}
              maxBudget={2500}
              affordableCount={affordableHotels.length}
              totalHotelsCount={MOCK_HOTELS.length}
              hotels={MOCK_HOTELS}
              onBudgetChange={handleBudgetChange}
              onResetBudget={handleResetBudget}
            />
          </div>
          <div className="xl:col-span-7">
            <ImportanceEditor
              destinations={MOCK_DESTINATIONS}
              destinationWeights={destinationWeights}
              onWeightChange={handleWeightChange}
              onResetWeights={handleResetWeights}
            />
          </div>
        </section>

        {/* Compact Recommendation Budget Timeline (Optional Bonus) */}
        {isValid && (
          <BudgetTimeline
            timelineSegments={timelineSegments}
            currentBudget={budget}
            onSelectBudget={setBudget}
          />
        )}

        {/* Schematic City Map & Hotel Inspection Panel */}
        <section
          aria-label="Schematic City Map and Inspector"
          className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch"
        >
          <div className="xl:col-span-7">
            <SchematicCityMap
              hotels={MOCK_HOTELS}
              destinations={MOCK_DESTINATIONS}
              inspectedHotel={inspectedHotel}
              contributions={contributions}
              budget={budget}
              isValid={isValid}
              onSelectHotel={handleSelectHotel}
            />
          </div>
          <div className="xl:col-span-5">
            <HotelInspectionPanel
              hotel={inspectedHotel}
              budget={budget}
              contributions={contributions}
              onScrollToTable={scrollToTable}
            />
          </div>
        </section>

        {/* Ranked Hotels & 15 Route Analytical Breakdown Table */}
        <section
          aria-label="Rankings and Route Contributions"
          className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start"
        >
          <div className="xl:col-span-4 xl:sticky xl:top-20">
            <HotelRankingCards
              evaluatedHotels={evaluatedHotels}
              inspectedHotelId={inspectedHotel?.id || ''}
              budget={budget}
              onSelectHotel={handleSelectHotel}
            />
          </div>
          <div className="xl:col-span-8 scroll-mt-24" ref={tableRef}>
            <ContributionTable
              hotel={inspectedHotel}
              contributions={contributions}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] py-5 text-xs text-ink-400 bg-ink-950/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hotel Base-Camp Comparator</span>
          <span>Aethelgard Bay · 10 Base-Camps · 15 Wishlist Places · 150 Constant Corridors</span>
        </div>
      </footer>
    </div>
  );
}

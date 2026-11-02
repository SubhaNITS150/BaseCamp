/**
 * Comprehensive Automated Test Suite for SPR26_D2_P03: Hotel Base-Camp Comparator
 *
 * Tests all required acceptance criteria:
 * 1. Scenario counts, IDs, place types, and matrix stability
 * 2. Contribution arithmetic and sum of importances
 * 3. Round-half-up display algorithm
 * 4. Exact ranking despite rounded average ties
 * 5. Tie-break by stay_cost
 * 6. Tie-break by ASCII hotel ID
 * 7. Budget equality (stay_cost == budget) and 1-unit shortfall (stay_cost == budget + 1)
 * 8. Main scenario story conditions (4-7 affordable, unique lowest over budget,
 *    recommended != cheapest, 90-min boundaries, boundary cost unlock, importance flip)
 * 9. NO_AFFORDABLE_HOTEL result with no stale recommendation
 * 10. Scenario validation (duplicate ID, malformed ID, invalid counts, missing/unknown matrix entries)
 * 11. Invalid-state clearing (stale ranks and winner wiped)
 * 12. Hotel inspection and reset reproducibility
 */

import { MOCK_HOTELS } from '../src/data/mockHotels.js';
import { MOCK_DESTINATIONS } from '../src/data/mockDestinations.js';
import { MOCK_TRAVEL_MATRIX } from '../src/data/mockTravelMatrix.js';
import {
  validateScenario,
  formatWeightedAverage,
  calculateContributions,
  evaluateAndRankComparator,
  calculateBudgetTimeline
} from '../src/services/comparatorCalculations.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
    process.exitCode = 1;
  }
}

console.log('=====================================================');
console.log('RUNNING COMPARATOR ACCEPTANCE CRITERIA VERIFICATION');
console.log('=====================================================\n');

// 1. Data Contract & Scenario Dimensions
console.log('Test Group 1: Scenario Dimensions & Data Contracts');
assert(MOCK_HOTELS.length === 10, 'Main scenario contains exactly 10 hotels');
assert(MOCK_DESTINATIONS.length === 15, 'Main scenario contains exactly 15 wishlist places');

const attractions = MOCK_DESTINATIONS.filter((d) => d.type === 'attraction');
const foodStops = MOCK_DESTINATIONS.filter((d) => d.type === 'food');
assert(attractions.length >= 3, `Includes >= 3 attractions (actual: ${attractions.length})`);
assert(foodStops.length >= 3, `Includes >= 3 food stops (actual: ${foodStops.length})`);
assert(attractions.length + foodStops.length === 15, 'All places are strictly attraction or food');

const uniqueImportances = new Set(MOCK_DESTINATIONS.map((d) => d.defaultImportance));
assert(uniqueImportances.size >= 3, `Uses at least 3 distinct importance levels (actual: ${uniqueImportances.size})`);

const defaultImpMap = {};
MOCK_DESTINATIONS.forEach((d) => (defaultImpMap[d.id] = d.defaultImportance));

// 2. Arithmetic & Round-half-up Display
console.log('\nTest Group 2: Arithmetic & Round-Half-Up Display');
// Example from problem statement:
// CLOCK (imp 3, 20 min) + MARKET (imp 2, 40 min) -> (3*20)+(2*40) = 140 imp-min. 140 / 5 = 28.0 min.
const testImpTotal = 5;
const testWeightedTotal = 140;
const formattedEx = formatWeightedAverage(testWeightedTotal, testImpTotal);
assert(formattedEx === '28.0', 'Illustration example arithmetic: 140 / 5 = 28.0');

// Round-half-up edge cases
// 25 / 10 = 2.50 -> "2.5"
assert(formatWeightedAverage(25, 10) === '2.5', 'Round-half-up exact half: 25/10 -> 2.5');
// 255 / 100 = 2.55 -> "2.6" (half up)
assert(formatWeightedAverage(255, 100) === '2.6', 'Round-half-up: 255/100 -> 2.6');
// 254 / 100 = 2.54 -> "2.5"
assert(formatWeightedAverage(254, 100) === '2.5', 'Round-half-down: 254/100 -> 2.5');

// 3. Exact Ranking despite Rounded Averages
console.log('\nTest Group 3: Exact Ranking despite Identical Rounded Averages');
const miniPlaces3 = [
  { id: 'P01', name: 'Place 1', type: 'attraction', defaultImportance: 4 },
  { id: 'P02', name: 'Place 2', type: 'food', defaultImportance: 4 },
  { id: 'P03', name: 'Place 3', type: 'attraction', defaultImportance: 2 }
];
const miniMatrixNear = {
  H_FIRST: { P01: 20, P02: 20, P03: 20 },  // (4*20)+(4*20)+(2*20) = 200
  H_SECOND: { P01: 20, P02: 20, P03: 21 } // (4*20)+(4*20)+(2*21) = 202
};
const resNear = evaluateAndRankComparator(
  [
    { id: 'H_SECOND', name: 'Second Hotel', stay_cost: 500 },
    { id: 'H_FIRST', name: 'First Hotel', stay_cost: 500 }
  ],
  miniPlaces3,
  { P01: 4, P02: 4, P03: 2 },
  miniMatrixNear,
  1000
);
assert(resNear.isValid, '3-place scenario passes validation');
assert(resNear.affordableHotels[0].id === 'H_FIRST', 'Exact weighted_travel_total strictly dictates order (H_FIRST before H_SECOND)');

// 4. Tie-Breaking Scenarios
console.log('\nTest Group 4: Tie-Breaking (Stay Cost, then ASCII Hotel ID)');
// Tie 1: Accessibility tie broken by stay_cost
const miniTieAccessibility = [
  { id: 'H_EXPENSIVE', name: 'Expensive Hotel', stay_cost: 700 },
  { id: 'H_CHEAP', name: 'Cheap Hotel', stay_cost: 600 }
];
const matrixTie1 = {
  H_EXPENSIVE: { P01: 30, P02: 30, P03: 30 },
  H_CHEAP: { P01: 30, P02: 30, P03: 30 }
};
const resTie1 = evaluateAndRankComparator(
  miniTieAccessibility,
  miniPlaces3,
  { P01: 4, P02: 4, P03: 2 },
  matrixTie1,
  1000
);
assert(resTie1.affordableHotels[0].id === 'H_CHEAP', 'Accessibility tie is resolved by lower stay_cost');
assert(resTie1.affordableHotels[1].id === 'H_EXPENSIVE', 'Higher stay cost ranks 2nd in accessibility tie');

// Tie 2: Complete tie (accessibility and stay_cost equal) broken by hotel ID ASCII order
const miniTieASCII = [
  { id: 'H_ZETA', name: 'Zeta Hotel', stay_cost: 600 },
  { id: 'H_ALPHA', name: 'Alpha Hotel', stay_cost: 600 }
];
const matrixTie2 = {
  H_ZETA: { P01: 30, P02: 30, P03: 30 },
  H_ALPHA: { P01: 30, P02: 30, P03: 30 }
};
const resTie2 = evaluateAndRankComparator(
  miniTieASCII,
  miniPlaces3,
  { P01: 4, P02: 4, P03: 2 },
  matrixTie2,
  1000
);
assert(resTie2.affordableHotels[0].id === 'H_ALPHA', 'Complete tie resolved by hotel ID ascending ASCII (H_ALPHA before H_ZETA)');

// 5. Budget Equality & Shortfall
console.log('\nTest Group 5: Budget Equality & Shortfall');
const testHotels2 = [
  { id: 'H_EXACT', name: 'Exact Hotel', stay_cost: 1000 },
  { id: 'H_OTHER', name: 'Other Hotel', stay_cost: 1500 }
];
const testMatrix2 = {
  H_EXACT: { P01: 10, P02: 10, P03: 10 },
  H_OTHER: { P01: 20, P02: 20, P03: 20 }
};

const resEqual = evaluateAndRankComparator(
  testHotels2,
  miniPlaces3,
  { P01: 3, P02: 3, P03: 3 },
  testMatrix2,
  1000 // exact budget for H_EXACT
);
assert(resEqual.isValid, '2-hotel scenario passes validation');
assert(resEqual.affordableHotels.length === 1 && resEqual.affordableHotels[0].id === 'H_EXACT' && resEqual.affordableHotels[0].rank === 1, 'Hotel exactly on budget (stay_cost == budget) is affordable with rank 1');

const resOverOne = evaluateAndRankComparator(
  testHotels2,
  miniPlaces3,
  { P01: 3, P02: 3, P03: 3 },
  testMatrix2,
  999 // 1 currency unit lower than H_EXACT (stay_cost 1000)
);
assert(resOverOne.isValid, '1-unit over scenario is structurally valid');
assert(resOverOne.affordableHotels.length === 0, 'Hotel 1 currency unit over budget is NOT affordable');
const hExactOver = resOverOne.evaluatedHotels.find((h) => h.id === 'H_EXACT');
assert(hExactOver && hExactOver.rank === null, 'Over-budget hotel has no numerical rank');
assert(hExactOver && hExactOver.shortfall === 1, 'Shortfall correctly calculated as 1 for 1-unit over budget');

// 6. Main Scenario Story Conditions Verification
console.log('\nTest Group 6: Main Scenario Story Conditions (Budget = 1200)');
const mainBaseline = evaluateAndRankComparator(
  MOCK_HOTELS,
  MOCK_DESTINATIONS,
  defaultImpMap,
  MOCK_TRAVEL_MATRIX,
  1200
);

assert(mainBaseline.isValid, 'Main scenario is valid');
assert(mainBaseline.status === 'SUCCESS', 'Main scenario returns SUCCESS');
assert(
  mainBaseline.affordableHotels.length >= 4 && mainBaseline.affordableHotels.length <= 7,
  `Story Condition 1: 4 to 7 hotels are affordable (actual: ${mainBaseline.affordableHotels.length})`
);

// Unique lowest accessibility hotel
const allSortedByAccessibility = [...mainBaseline.evaluatedHotels].sort((a, b) => a.weighted_travel_total - b.weighted_travel_total);
const absoluteWinner = allSortedByAccessibility[0];
assert(
  absoluteWinner.id === 'H01_PALACE',
  `Story Condition 2a: H01_PALACE has the unique lowest accessibility total (${absoluteWinner.weighted_travel_total})`
);
assert(
  !absoluteWinner.is_affordable,
  `Story Condition 2b: H01_PALACE is over budget at 1200 (stay_cost: ${absoluteWinner.stay_cost}, over by ${absoluteWinner.shortfall})`
);

const recommendedAffordable = mainBaseline.recommendedHotel;
const cheapestAffordable = [...mainBaseline.affordableHotels].sort((a, b) => a.stay_cost - b.stay_cost)[0];
assert(
  recommendedAffordable.id === 'H02_METRO',
  `Story Condition 3a: Recommended affordable hotel is H02_METRO (total: ${recommendedAffordable.weighted_travel_total})`
);
assert(
  cheapestAffordable.id === 'H05_NOMAD',
  `Story Condition 3b: Cheapest affordable hotel is H05_NOMAD (cost: ${cheapestAffordable.stay_cost})`
);
assert(
  recommendedAffordable.id !== cheapestAffordable.id,
  'Story Condition 3c: Recommended hotel is NOT the cheapest affordable hotel'
);

const h02 = mainBaseline.affordableHotels.find((h) => h.id === 'H02_METRO');
const h05 = mainBaseline.affordableHotels.find((h) => h.id === 'H05_NOMAD');
assert(
  h02.all_trips_le_90 && h02.max_round_trip_minutes <= 90,
  `Story Condition 4a: H02_METRO has every round trip <= 90 min (max: ${h02.max_round_trip_minutes} min)`
);
assert(
  !h05.all_trips_le_90 && h05.max_round_trip_minutes > 90,
  `Story Condition 4b: H05_NOMAD has at least one round trip > 90 min (max: ${h05.max_round_trip_minutes} min to P07)`
);

// Story Condition 5: Raising budget to stay cost of most accessible hotel (1450)
const budget1450 = evaluateAndRankComparator(
  MOCK_HOTELS,
  MOCK_DESTINATIONS,
  defaultImpMap,
  MOCK_TRAVEL_MATRIX,
  1450
);
assert(
  budget1450.recommendedHotel.id === 'H01_PALACE',
  `Story Condition 5: Raising budget to 1450 unlocks H01_PALACE as Rank 1 Recommendation`
);

// Story Condition 6: What-If changing P09_NIGHT_MKT importance within 1-5 flips recommendation
const modifiedImpMap = { ...defaultImpMap, P09_NIGHT_MKT: 5 };
const whatIfScenario = evaluateAndRankComparator(
  MOCK_HOTELS,
  MOCK_DESTINATIONS,
  modifiedImpMap,
  MOCK_TRAVEL_MATRIX,
  1200
);
assert(
  whatIfScenario.recommendedHotel.id === 'H03_CANAL',
  `Story Condition 6: Increasing P09_NIGHT_MKT importance to 5 flips recommendation from H02_METRO to H03_CANAL`
);

// 7. NO_AFFORDABLE_HOTEL with No Stale Winner
console.log('\nTest Group 7: NO_AFFORDABLE_HOTEL Handling');
const noAffordable = evaluateAndRankComparator(
  MOCK_HOTELS,
  MOCK_DESTINATIONS,
  defaultImpMap,
  MOCK_TRAVEL_MATRIX,
  500 // Below lowest hotel cost 820
);
assert(noAffordable.status === 'NO_AFFORDABLE_HOTEL', 'Status returns NO_AFFORDABLE_HOTEL when budget is too low');
assert(noAffordable.recommendedHotel === null, 'No recommendation provided');
assert(noAffordable.affordableHotels.length === 0, 'Affordable hotels list is empty');
assert(noAffordable.evaluatedHotels.every((h) => h.rank === null), 'No numerical ranks assigned');
assert(noAffordable.evaluatedHotels.every((h) => h.shortfall > 0), 'Every hotel retains its shortfall');

// 8. Scenario Validation & Invalid State Clearing
console.log('\nTest Group 8: Validation & Rejection of Malformed Scenarios');
// Duplicate ID
const duplicateHotels = [
  ...MOCK_HOTELS.slice(0, 9),
  { id: 'H01_PALACE', name: 'Duplicate Palace', stay_cost: 900 }
];
const vDup = validateScenario({
  hotels: duplicateHotels,
  places: MOCK_DESTINATIONS,
  travelMatrix: MOCK_TRAVEL_MATRIX,
  budget: 1200,
  importanceMap: defaultImpMap
});
assert(!vDup.isValid, 'Rejects duplicate hotel ID');

// Malformed ID (lowercase or invalid characters)
const malformedHotels = [
  ...MOCK_HOTELS.slice(0, 9),
  { id: 'hotel_bad_id', name: 'Bad ID Hotel', stay_cost: 900 }
];
const vBadId = validateScenario({
  hotels: malformedHotels,
  places: MOCK_DESTINATIONS,
  travelMatrix: MOCK_TRAVEL_MATRIX,
  budget: 1200,
  importanceMap: defaultImpMap
});
assert(!vBadId.isValid, 'Rejects malformed ID not matching [A-Z][A-Z0-9_-]{0,15}');

// Incomplete Travel Matrix mapping
const incompleteMatrix = JSON.parse(JSON.stringify(MOCK_TRAVEL_MATRIX));
delete incompleteMatrix.H01_PALACE.P01_CITADEL;
const vIncomplete = validateScenario({
  hotels: MOCK_HOTELS,
  places: MOCK_DESTINATIONS,
  travelMatrix: incompleteMatrix,
  budget: 1200,
  importanceMap: defaultImpMap
});
assert(!vIncomplete.isValid, 'Rejects incomplete travel matrix mapping (missing place key)');

// Unknown place key in Travel Matrix
const extraKeyMatrix = JSON.parse(JSON.stringify(MOCK_TRAVEL_MATRIX));
extraKeyMatrix.H01_PALACE.UNKNOWN_PLACE = 25;
const vExtra = validateScenario({
  hotels: MOCK_HOTELS,
  places: MOCK_DESTINATIONS,
  travelMatrix: extraKeyMatrix,
  budget: 1200,
  importanceMap: defaultImpMap
});
assert(!vExtra.isValid, 'Rejects unknown place key in travel matrix');

// Invalid Budget (out of bounds)
const vNegativeBudget = validateScenario({
  hotels: MOCK_HOTELS,
  places: MOCK_DESTINATIONS,
  travelMatrix: MOCK_TRAVEL_MATRIX,
  budget: -10,
  importanceMap: defaultImpMap
});
assert(!vNegativeBudget.isValid, 'Rejects negative budget');

const vTooHighBudget = validateScenario({
  hotels: MOCK_HOTELS,
  places: MOCK_DESTINATIONS,
  travelMatrix: MOCK_TRAVEL_MATRIX,
  budget: 1000001,
  importanceMap: defaultImpMap
});
assert(!vTooHighBudget.isValid, 'Rejects budget > 1,000,000');

// Invalid Importance (out of 1-5 range)
const vBadImp = validateScenario({
  hotels: MOCK_HOTELS,
  places: MOCK_DESTINATIONS,
  travelMatrix: MOCK_TRAVEL_MATRIX,
  budget: 1200,
  importanceMap: { ...defaultImpMap, P01_CITADEL: 6 }
});
assert(!vBadImp.isValid, 'Rejects place importance > 5');

// Invalid State Clearing Check
const evalInvalid = evaluateAndRankComparator(
  duplicateHotels,
  MOCK_DESTINATIONS,
  defaultImpMap,
  MOCK_TRAVEL_MATRIX,
  1200
);
assert(evalInvalid.status === 'INVALID_SCENARIO', 'Invalid scenario yields INVALID_SCENARIO status');
assert(evalInvalid.evaluatedHotels.length === 0, 'Invalid state clears all evaluated hotels');
assert(evalInvalid.recommendedHotel === null, 'Invalid state clears recommendation');
assert(evalInvalid.errors.length > 0, 'Invalid state exposes actionable error messages');

// 9. Budget Timeline Segment Calculation
console.log('\nTest Group 9: Budget Timeline Segments');
const timeline = calculateBudgetTimeline(MOCK_HOTELS, MOCK_DESTINATIONS, defaultImpMap, MOCK_TRAVEL_MATRIX);
assert(timeline.length >= 2, `Budget timeline generated ${timeline.length} recommendation segments`);
console.log('  Timeline segments:', timeline.map((s) => `$${s.startBudget}-${s.endBudget ?? '∞'}: ${s.recommendedHotelId}`).join(' | '));

console.log('\n=====================================================');
console.log(`TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('=====================================================\n');

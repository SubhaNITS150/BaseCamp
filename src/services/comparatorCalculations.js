/**
 * Core Calculation and Scenario Validation Engine for Hotel Base-Camp Comparator
 * SPR26_D2_P03 Specification Compliant.
 *
 * All functions are pure, deterministic, and isolated from presentation / UI layers.
 */

export const ID_REGEX = /^[A-Z][A-Z0-9_-]{0,15}$/;

/**
 * Validates the complete scenario against specification contracts.
 *
 * @param {{
 *   hotels: Array<{ id: string, name: string, stay_cost: number }>,
 *   places: Array<{ id: string, name: string, type: string, defaultImportance?: number }>,
 *   travelMatrix: Record<string, Record<string, number>>,
 *   budget: number,
 *   importanceMap: Record<string, number>
 * }} params
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateScenario({ hotels, places, travelMatrix, budget, importanceMap }) {
  const errors = [];

  // 1. Budget validation: whole-number from 0 through 1,000,000
  if (
    typeof budget !== 'number' ||
    !Number.isInteger(budget) ||
    budget < 0 ||
    budget > 1000000
  ) {
    errors.push(`Budget must be a whole-number integer between 0 and 1,000,000. Received: ${budget}`);
  }

  // 2. Count validations: 2-10 hotels, 3-15 wishlist places
  if (!Array.isArray(hotels) || hotels.length < 2 || hotels.length > 10) {
    errors.push(`Hotel count must be between 2 and 10. Received: ${hotels ? hotels.length : 0}`);
  }

  if (!Array.isArray(places) || places.length < 3 || places.length > 15) {
    errors.push(`Wishlist places count must be between 3 and 15. Received: ${places ? places.length : 0}`);
  }

  // 3. ID uniqueness across complete scenario (hotels + places)
  const seenIds = new Set();
  const duplicateIds = new Set();

  if (Array.isArray(hotels)) {
    hotels.forEach((h, idx) => {
      if (!h || typeof h.id !== 'string' || !ID_REGEX.test(h.id)) {
        errors.push(`Hotel at index ${idx} has invalid ID '${h?.id}'. Must match [A-Z][A-Z0-9_-]{0,15}.`);
      } else {
        if (seenIds.has(h.id)) duplicateIds.add(h.id);
        seenIds.add(h.id);
      }

      if (!h || typeof h.name !== 'string' || h.name.trim().length === 0) {
        errors.push(`Hotel '${h?.id || idx}' has an empty display name.`);
      }

      if (
        typeof h?.stay_cost !== 'number' ||
        !Number.isInteger(h.stay_cost) ||
        h.stay_cost < 1 ||
        h.stay_cost > 1000000
      ) {
        errors.push(`Hotel '${h?.id || idx}' has invalid stay_cost '${h?.stay_cost}'. Must be integer 1 to 1,000,000.`);
      }
    });
  }

  const placeIdSet = new Set();
  if (Array.isArray(places)) {
    places.forEach((p, idx) => {
      if (!p || typeof p.id !== 'string' || !ID_REGEX.test(p.id)) {
        errors.push(`Place at index ${idx} has invalid ID '${p?.id}'. Must match [A-Z][A-Z0-9_-]{0,15}.`);
      } else {
        if (seenIds.has(p.id)) duplicateIds.add(p.id);
        seenIds.add(p.id);
        placeIdSet.add(p.id);
      }

      if (!p || typeof p.name !== 'string' || p.name.trim().length === 0) {
        errors.push(`Place '${p?.id || idx}' has an empty display name.`);
      }

      if (p?.type !== 'attraction' && p?.type !== 'food') {
        errors.push(`Place '${p?.id || idx}' has unsupported type '${p?.type}'. Must be 'attraction' or 'food'.`);
      }

      const imp = importanceMap ? importanceMap[p?.id] : p?.defaultImportance;
      if (
        typeof imp !== 'number' ||
        !Number.isInteger(imp) ||
        imp < 1 ||
        imp > 5
      ) {
        errors.push(`Place '${p?.id || idx}' has invalid importance '${imp}'. Must be integer 1 through 5.`);
      }
    });
  }

  if (duplicateIds.size > 0) {
    errors.push(`Duplicate IDs detected across scenario: ${Array.from(duplicateIds).join(', ')}`);
  }

  // 4. Travel matrix mapping integrity
  if (!travelMatrix || typeof travelMatrix !== 'object') {
    errors.push('Travel matrix must be a valid mapping object.');
  } else if (Array.isArray(hotels) && Array.isArray(places) && placeIdSet.size === places.length) {
    hotels.forEach((h) => {
      const hotelTimes = travelMatrix[h.id];
      if (!hotelTimes || typeof hotelTimes !== 'object') {
        errors.push(`Missing travel times mapping for hotel '${h.id}'.`);
        return;
      }

      const matrixKeys = Object.keys(hotelTimes);

      // Check for missing place IDs
      placeIdSet.forEach((pid) => {
        if (!(pid in hotelTimes)) {
          errors.push(`Hotel '${h.id}' is missing travel time for place '${pid}'.`);
        }
      });

      // Check for unknown or extra place IDs
      matrixKeys.forEach((key) => {
        if (!placeIdSet.has(key)) {
          errors.push(`Hotel '${h.id}' contains unknown place key '${key}' in travel matrix.`);
        } else {
          const time = hotelTimes[key];
          if (typeof time !== 'number' || !Number.isInteger(time) || time < 1 || time > 600) {
            errors.push(`Hotel '${h.id}' to place '${key}' has invalid round_trip_minutes '${time}'. Must be integer 1 to 600.`);
          }
        }
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculates round-half-up integer display tenths for non-negative values.
 * Contract: rounded_tenths = floor((20 * weighted_travel_total + importance_total) / (2 * importance_total))
 * Display: rounded_tenths / 10
 *
 * @param {number} weightedTotal
 * @param {number} importanceTotal
 * @returns {string} e.g. "27.7"
 */
export function formatWeightedAverage(weightedTotal, importanceTotal) {
  if (importanceTotal <= 0) return '0.0';
  const roundedTenths = Math.floor((20 * weightedTotal + importanceTotal) / (2 * importanceTotal));
  return (roundedTenths / 10).toFixed(1);
}

/**
 * Calculates per-route travel contributions for a specific hotel.
 * contribution(h, p) = importance(p) * round_trip_minutes(h, p)
 *
 * @param {string} hotelId
 * @param {Record<string, number>} importanceMap
 * @param {Record<string, Record<string, number>>} travelMatrix
 * @param {Array<any>} places
 * @returns {Array<any>}
 */
export function calculateContributions(hotelId, importanceMap, travelMatrix, places) {
  if (!hotelId || !places || !travelMatrix || !travelMatrix[hotelId]) return [];

  const hotelTimes = travelMatrix[hotelId];
  const items = places.map((place) => {
    const rawTravelTime = hotelTimes[place.id] ?? 0;
    const importance = importanceMap[place.id] ?? place.defaultImportance ?? 1;
    const contribution = importance * rawTravelTime;

    return {
      destinationId: place.id,
      destinationName: place.name,
      type: place.type,
      categoryLabel: place.categoryLabel,
      coordinates: place.coordinates,
      icon: place.icon,
      importance,
      rawTravelTime,
      contribution
    };
  });

  const totalContribution = items.reduce((sum, item) => sum + item.contribution, 0);

  return items.map((item) => ({
    ...item,
    sharePercent: totalContribution > 0
      ? Number(((item.contribution / totalContribution) * 100).toFixed(1))
      : 0
  }));
}

/**
 * Evaluates and ranks all hotels based on the strict comparator rules.
 *
 * @param {Array<any>} hotels
 * @param {Array<any>} places
 * @param {Record<string, number>} importanceMap
 * @param {Record<string, Record<string, number>>} travelMatrix
 * @param {number} budget
 * @returns {{
 *   isValid: boolean,
 *   errors: string[],
 *   evaluatedHotels: Array<any>,
 *   affordableHotels: Array<any>,
 *   recommendedHotel: any | null,
 *   importanceTotal: number,
 *   status: 'SUCCESS' | 'NO_AFFORDABLE_HOTEL' | 'INVALID_SCENARIO'
 * }}
 */
export function evaluateAndRankComparator(hotels, places, importanceMap, travelMatrix, budget) {
  // Step 1: Validate entire scenario before ranking
  const validation = validateScenario({ hotels, places, travelMatrix, budget, importanceMap });

  if (!validation.isValid) {
    return {
      isValid: false,
      errors: validation.errors,
      evaluatedHotels: [],
      affordableHotels: [],
      recommendedHotel: null,
      importanceTotal: 0,
      status: 'INVALID_SCENARIO'
    };
  }

  // Step 2: Calculate sum of all place importance values
  const importanceTotal = places.reduce((sum, p) => {
    return sum + (importanceMap[p.id] ?? p.defaultImportance ?? 1);
  }, 0);

  // Step 3: Evaluate each hotel
  const evaluatedHotels = hotels.map((hotel) => {
    const hotelTimes = travelMatrix[hotel.id];
    let weightedTravelTotal = 0;
    let totalRawMinutes = 0;
    let maxRoundTripMinutes = 0;

    places.forEach((place) => {
      const imp = importanceMap[place.id] ?? place.defaultImportance ?? 1;
      const tripTime = hotelTimes[place.id];
      const contribution = imp * tripTime;
      weightedTravelTotal += contribution;
      totalRawMinutes += tripTime;
      if (tripTime > maxRoundTripMinutes) {
        maxRoundTripMinutes = tripTime;
      }
    });

    const displayAverage = formatWeightedAverage(weightedTravelTotal, importanceTotal);
    const weightedAverageExact = weightedTravelTotal / importanceTotal;
    const isAffordable = hotel.stay_cost <= budget;
    const remainingBudget = budget - hotel.stay_cost;
    const shortfall = Math.max(0, hotel.stay_cost - budget);

    return {
      ...hotel,
      weighted_travel_total: weightedTravelTotal,
      weighted_average_minutes: weightedAverageExact,
      display_average: displayAverage,
      is_affordable: isAffordable,
      remaining_budget: remainingBudget,
      shortfall: shortfall,
      total_raw_minutes: totalRawMinutes,
      max_round_trip_minutes: maxRoundTripMinutes,
      all_trips_le_90: maxRoundTripMinutes <= 90,
      rank: null,
      is_recommended: false
    };
  });

  // Step 4: Filter affordable hotels and sort by exact contracts
  // Tie breaking:
  // 1. exact weighted_travel_total ascending
  // 2. stay_cost ascending
  // 3. hotel ID ascending ASCII
  const affordableHotels = evaluatedHotels
    .filter((h) => h.is_affordable)
    .sort((a, b) => {
      if (a.weighted_travel_total !== b.weighted_travel_total) {
        return a.weighted_travel_total - b.weighted_travel_total;
      }
      if (a.stay_cost !== b.stay_cost) {
        return a.stay_cost - b.stay_cost;
      }
      return a.id.localeCompare(b.id);
    });

  // Assign unique ranks 1, 2, 3... without gaps
  affordableHotels.forEach((hotel, index) => {
    hotel.rank = index + 1;
    hotel.is_recommended = index === 0;
  });

  // Over-budget hotels have no numerical rank and are never recommended
  // For UI display, we keep all hotels sorted with affordable ranked ones first,
  // followed by unranked over-budget hotels sorted by weighted_travel_total
  const overBudgetHotels = evaluatedHotels
    .filter((h) => !h.is_affordable)
    .sort((a, b) => {
      if (a.weighted_travel_total !== b.weighted_travel_total) {
        return a.weighted_travel_total - b.weighted_travel_total;
      }
      if (a.stay_cost !== b.stay_cost) {
        return a.stay_cost - b.stay_cost;
      }
      return a.id.localeCompare(b.id);
    });

  const allDisplayHotels = [...affordableHotels, ...overBudgetHotels];
  const recommendedHotel = affordableHotels.length > 0 ? affordableHotels[0] : null;

  return {
    isValid: true,
    errors: [],
    evaluatedHotels: allDisplayHotels,
    affordableHotels,
    recommendedHotel,
    importanceTotal,
    status: affordableHotels.length > 0 ? 'SUCCESS' : 'NO_AFFORDABLE_HOTEL'
  };
}

/**
 * Computes a compact budget timeline showing the exact amounts at which the recommendation changes.
 * Preserves the exact same affordability and ranking rules.
 *
 * @param {Array<any>} hotels
 * @param {Array<any>} places
 * @param {Record<string, number>} importanceMap
 * @param {Record<string, Record<string, number>>} travelMatrix
 * @returns {Array<{ minBudget: number, maxBudget: number | null, recommendedHotel: any }>}
 */
export function calculateBudgetTimeline(hotels, places, importanceMap, travelMatrix) {
  // Collect all unique stay costs sorted ascending
  const uniqueCosts = Array.from(new Set(hotels.map((h) => h.stay_cost))).sort((a, b) => a - b);
  const segments = [];

  let currentRecId = null;
  let currentStartBudget = null;

  uniqueCosts.forEach((cost) => {
    const res = evaluateAndRankComparator(hotels, places, importanceMap, travelMatrix, cost);
    const rec = res.recommendedHotel;
    const recId = rec ? rec.id : null;

    if (recId !== currentRecId) {
      if (currentRecId !== null) {
        segments.push({
          startBudget: currentStartBudget,
          endBudget: cost - 1,
          recommendedHotelId: currentRecId,
          hotelName: hotels.find((h) => h.id === currentRecId)?.name || currentRecId
        });
      }
      currentRecId = recId;
      currentStartBudget = cost;
    }
  });

  if (currentRecId !== null) {
    segments.push({
      startBudget: currentStartBudget,
      endBudget: null, // open ended
      recommendedHotelId: currentRecId,
      hotelName: hotels.find((h) => h.id === currentRecId)?.name || currentRecId
    });
  }

  return segments;
}

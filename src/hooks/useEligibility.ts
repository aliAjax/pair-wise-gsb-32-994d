import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import type { EligibilityReport } from '../types';
import type { Trip } from '../models/trip';
import { checkTravelEligibility } from '../utils/eligibility';

// 日期或同行人改动后自动重新核对
export function useEligibility(tripRef: MaybeRefOrGetter<Trip | undefined | null>) {
  return computed<EligibilityReport | null>(() => {
    const trip = toValue(tripRef);
    return trip ? checkTravelEligibility(trip) : null;
  });
}

import dayjs from 'dayjs';
import type { Trip } from '../models/trip';
import type { Traveler } from '../models/traveler';
import { messages } from '../constants/messages';

export type EligibilityIssueCode =
  | 'passport_missing'
  | 'passport_expired'
  | 'stay_missing'
  | 'stay_exceeded';

export interface TravelerEligibility {
  traveler: Traveler;
  passed: boolean;
  issues: { code: EligibilityIssueCode; text: string }[];
}

export interface TripEligibility {
  passed: boolean;
  plannedStayDays: number;
  results: TravelerEligibility[];
}

/** 计划停留天数：出发日到行程结束日，首尾均计 1 天 */
export function plannedStayDays(startDate: string, endDate: string): number {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) return 0;
  return end.diff(start, 'day') + 1;
}

export function checkTraveler(traveler: Traveler, trip: Trip, plannedDays: number): TravelerEligibility {
  const issues: TravelerEligibility['issues'] = [];

  if (!traveler.passport_expiry) {
    issues.push({ code: 'passport_missing', text: messages.passportMissing(traveler.name) });
  } else {
    const expiry = dayjs(traveler.passport_expiry);
    // 行程结束日晚于护照到期日即不匹配
    if (expiry.isValid() && dayjs(trip.end_date).isAfter(expiry, 'day')) {
      issues.push({
        code: 'passport_expired',
        text: messages.passportExpired(traveler.name, traveler.passport_expiry, trip.end_date),
      });
    }
  }

  if (traveler.allowed_stay_days === null || traveler.allowed_stay_days === undefined) {
    issues.push({ code: 'stay_missing', text: messages.stayMissing(traveler.name) });
  } else if (plannedDays > traveler.allowed_stay_days) {
    issues.push({
      code: 'stay_exceeded',
      text: messages.stayExceeded(traveler.name, plannedDays, traveler.allowed_stay_days),
    });
  }

  return { traveler, passed: issues.length === 0, issues };
}

/** 出行资格核对：逐名同行人检查护照到期日与允许停留天数 */
export function checkTripEligibility(trip: Trip): TripEligibility {
  const plannedDays = plannedStayDays(trip.start_date, trip.end_date);
  const results = (trip.travelers || []).map((traveler) => checkTraveler(traveler, trip, plannedDays));
  return { passed: results.length > 0 && results.every((result) => result.passed), plannedStayDays: plannedDays, results };
}

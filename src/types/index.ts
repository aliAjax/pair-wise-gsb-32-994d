import { EligibilityIssueType } from '../constants/travelEligibility';
import type { TravelMember } from '../models/trip';

export type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'JPY';
export interface PersistedPayload<T> { version: string; data: T; updatedAt: string }

export type EligibilityTarget = TravelMember['id'] | 'trip';

export interface EligibilityIssue {
  type: EligibilityIssueType;
  target: EligibilityTarget; // member id，或 'trip' 表示行程本身
  memberName: string;
  message: string; // 直接点出具体人员与缺口
}

export interface EligibilityReport {
  passed: boolean;
  issues: EligibilityIssue[];
  plannedStayDays: number; // 计划停留天数（含首尾）
  members: Array<TravelMember & { ok: boolean }>; // 核对后的名单
}

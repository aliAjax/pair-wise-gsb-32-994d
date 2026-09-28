import dayjs from 'dayjs';
import type { EligibilityReport, EligibilityIssue } from '../types';
import type { Trip } from '../models/trip';
import { EligibilityIssueType } from '../constants/travelEligibility';

export const memberDisplayName = (name: string, index: number) =>
  name.trim() || `未命名同行人 ${index + 1}`;

// 计划停留天数：含出发日与结束日（首尾都算）
export function plannedStayDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) return 0;
  return end.diff(start, 'day') + 1;
}

// 出行资格核对：护照到期日 / 允许停留天数 / 行程日期任一处不匹配都会点出具体人员与缺口。
// 该规则同时被 EligibilityPanel、TripCard、Share 与 tripStore.confirmTrip 引用，
// 修改核对口径需要同步这几处的展示与拦截。
export function checkTravelEligibility(trip: Pick<Trip, 'start_date' | 'end_date' | 'members'>): EligibilityReport {
  const stayDays = plannedStayDays(trip.start_date, trip.end_date);
  const issues: EligibilityIssue[] = [];

  if (!stayDays) {
    issues.push({
      type: EligibilityIssueType.DATES_INVALID,
      target: 'trip',
      memberName: '',
      message: `行程日期不完整或结束日（${trip.end_date || '未填'}）早于开始日（${trip.start_date || '未填'}），暂无法核对出行资格。`,
    });
  }

  const members = trip.members.map((member, index) => {
    const displayName = memberDisplayName(member.name, index);
    const memberIssues: EligibilityIssue[] = [];
    const missingFields: string[] = [];
    if (!member.passport_expiry) missingFields.push('护照到期日');
    if (member.allowed_stay_days === null || member.allowed_stay_days === undefined) missingFields.push('允许停留天数');

    if (missingFields.length) {
      memberIssues.push({
        type: EligibilityIssueType.INFO_MISSING,
        target: member.id,
        memberName: displayName,
        message: `${displayName}：未登记${missingFields.join('与')}，无法完成核对。`,
      });
    }

    if (stayDays && member.passport_expiry && dayjs(trip.end_date).isAfter(dayjs(member.passport_expiry), 'day')) {
      memberIssues.push({
        type: EligibilityIssueType.PASSPORT_EXPIRED,
        target: member.id,
        memberName: displayName,
        message: `${displayName}：护照 ${member.passport_expiry} 到期，行程结束日 ${trip.end_date} 晚于到期日，请在出发前换发护照。`,
      });
    }

    if (stayDays && member.allowed_stay_days !== null && member.allowed_stay_days !== undefined && stayDays > member.allowed_stay_days) {
      memberIssues.push({
        type: EligibilityIssueType.STAY_EXCEEDED,
        target: member.id,
        memberName: displayName,
        message: `${displayName}：计划停留 ${stayDays} 天，超过本次允许停留 ${member.allowed_stay_days} 天，缺口 ${stayDays - member.allowed_stay_days} 天。`,
      });
    }

    issues.push(...memberIssues);
    return { ...member, name: displayName, ok: memberIssues.length === 0 && stayDays > 0 };
  });

  return { passed: issues.length === 0, issues, plannedStayDays: stayDays, members };
}

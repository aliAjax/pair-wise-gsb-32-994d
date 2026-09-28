import dayjs from 'dayjs';
import { SpotCategory } from '../constants/spot';
import { TripStatus } from '../constants/trip';
import { EligibilityIssueType } from '../constants/travelEligibility';

export const spotCategoryText: Record<SpotCategory, string> = {
  [SpotCategory.NATURE]: '自然风光',
  [SpotCategory.CULTURE]: '人文历史',
  [SpotCategory.FOOD]: '美食购物',
  [SpotCategory.ENTERTAINMENT]: '娱乐休闲',
};
export const tripStatusText: Record<TripStatus, string> = {
  [TripStatus.PLANNING]: '规划中',
  [TripStatus.ONGOING]: '进行中',
  [TripStatus.FINISHED]: '已结束',
};
// 资格核对缺口类型文本：新增缺口类型时需同步 constants/travelEligibility.ts
// 与 EligibilityPanel.vue
export const eligibilityIssueTypeText: Record<EligibilityIssueType, string> = {
  [EligibilityIssueType.PASSPORT_EXPIRED]: '护照到期日早于行程结束日',
  [EligibilityIssueType.STAY_EXCEEDED]: '计划停留超过许可',
  [EligibilityIssueType.INFO_MISSING]: '证件信息未登记',
  [EligibilityIssueType.DATES_INVALID]: '行程日期无效',
};
export const transportText: Record<string, string> = { walk: '步行', metro: '地铁', taxi: '出租', train: '火车' };
export const formatDate = (value: string) => dayjs(value).format('YYYY-MM-DD');
export const formatCurrency = (value: number, currency = 'CNY') => new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(value);

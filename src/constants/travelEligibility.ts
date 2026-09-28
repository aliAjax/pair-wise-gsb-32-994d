// 出行资格核对相关枚举：新增缺口类型时，需同步 utils/eligibility.ts、
// EligibilityPanel.vue、Share.vue、formatters 等多处展示逻辑
export enum EligibilityIssueType {
  PASSPORT_EXPIRED = 'passport_expired_before_return',
  STAY_EXCEEDED = 'stay_exceeded',
  INFO_MISSING = 'travel_doc_missing',
  DATES_INVALID = 'trip_dates_invalid',
}

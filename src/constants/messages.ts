export const messages = {
  tripCreated: '旅行计划已创建',
  tripDeleted: '旅行计划已删除',
  tripSaved: '草稿已保存',
  spotAdded: '景点已加入当天行程',
  emptyTrips: '还没有旅行计划，先创建一次出发。',
  emptySpots: '没有符合条件的景点。',
  budgetExceeded: '预算可能超支，请调整景点或交通方式',
  storageRecovered: '本地数据已恢复',
  // 出行资格核对
  eligibilityPassed: '全部同行人资格核对通过，可以确认出行',
  eligibilityBlocking: '资格核对未通过，已挡住“确认出行”，仍可保存草稿',
  passportExpired: (name: string, expiry: string, endDate: string) =>
    `${name} 的护照 ${expiry} 到期，早于行程结束日 ${endDate}`,
  stayExceeded: (name: string, planned: number, allowed: number) =>
    `${name} 计划停留 ${planned} 天，超过允许停留 ${allowed} 天，缺口 ${planned - allowed} 天`,
  stayMissing: (name: string) => `${name} 尚未登记本次允许停留天数`,
  passportMissing: (name: string) => `${name} 尚未登记护照到期日`,
  travelerRemoved: '同行人已移除',
  travelerAdded: '同行人已添加',
  confirmBlocked: '仍有同行人未通过资格核对，无法确认出行',
  confirmSuccess: '出行已确认，祝旅途顺利',
  eligibilityRechecked: '日期或同行人已变更，资格核对结果已刷新',
};

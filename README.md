# TripWeaver 旅游行程规划助手

## 快速启动

```bash
pnpm install
pnpm dev
```

访问地址：http://localhost:18417

TripWeaver 是一款纯前端旅行规划应用，支持创建旅行、探索景点、编排每日行程、预算统计和分享预览。

## 主要功能

- 我的旅行：创建、筛选、删除旅行计划，卡片直接显示出行资格核对结果与待处理人员。
- 行程详情：查看每日行程、预算图表和共享时间线；编辑行程日期、为每名同行人登记护照到期日与本次允许停留天数。
- 出行资格核对：行程结束日晚于护照到期日，或计划停留天数（首尾各算 1 天）超过许可时，点出具体人员与缺口并挡住“确认出行”；日期或同行人改动后自动重新核对，未通过的草稿仍可保存。
- 景点探索：按 SpotCategory 搜索和筛选，收藏并加入行程。
- 行程编排：SortableJS 拖拽排序，实时影响预算计算。
- 分享预览：生成可复制的行程文本，展示核对后的名单与每人核对结论。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端 | Vue 3 + TypeScript |
| 构建 | Vite |
| UI | Element Plus + ECharts |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 持久化 | localStorage + Dexie.js |
| 交互 | sortablejs |

## 目录结构

```
src/
├── api/
├── stores/
├── models/
├── types/
├── components/common/
├── hooks/
├── pages/
├── router/
├── utils/
├── config/
└── constants/
```

## 出行资格核对规则

每名同行人（`TravelMember`）登记 `passport_expiry`（护照到期日）与 `allowed_stay_days`（本次允许停留天数）。计划停留天数按行程开始日至结束日首尾各算 1 天计算。以下任一情况判定为缺口并挡住“确认出行”：

- 行程结束日晚于护照到期日；
- 计划停留天数超过允许停留天数（提示超出天数）；
- 护照到期日或允许停留天数未登记；
- 行程日期不完整或结束日早于开始日。

核对逻辑集中在 `src/utils/eligibility.ts`，经 `src/hooks/useEligibility.ts` 暴露为响应式结果，被 `TripDetail.vue`、`EligibilityPanel.vue`、`TripCard.vue`、`Share.vue` 与 `tripStore.confirmTrip` 共用；旧版 `members: string[]` 草稿由 `api/tripApi.ts` 读取时自动迁移，未通过核对的草稿仍可保存。

## 数据持久化

本地数据通过 `utils/storage.ts` 统一写入 localStorage，并保留 Dexie 数据库对象用于后续 IndexedDB 扩展。版本键来自 `constants/storageVersion.ts`。

## 环境变量

`VITE_AMAP_KEY`：高德地图 key。未配置时使用 demo-key，地图主题配置同时出现在 `config/map.ts`、`SpotCard`、`DayTimeline`、`Planner` 相关逻辑中。

## 枚举出现位置清单

SpotCategory：
- `src/constants/spot.ts`
- `src/models/spot.ts`
- `src/stores/spotStore.ts`
- `src/components/common/CategoryFilter.vue`
- `src/components/common/SpotCard.vue`
- `src/pages/Spots.vue`
- `src/pages/TripDetail.vue`
- `src/utils/formatters.ts`
- `src/router/guards.ts`

TripStatus：
- `src/constants/trip.ts`
- `src/models/trip.ts`
- `src/stores/tripStore.ts`
- `src/components/common/TripCard.vue`
- `src/pages/Trips.vue`
- `src/utils/formatters.ts`
- `src/router/guards.ts`

## License

MIT


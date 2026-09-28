<template>
  <main class="page">
    <template v-if="trip && eligibility">
      <TripHeader :trip="trip" />
      <EligibilityPanel :report="eligibility" :trip="trip" variant="roster" />
      <DayTimeline
        v-for="day in dayPlanStore.dayPlans.filter((day) => day.trip_id === trip.id)"
        :key="day.id"
        :day="day"
        :spots="spotStore.spots"
      />
      <el-button type="primary" @click="copyText">复制行程文本</el-button>
    </template>
    <EmptyState v-else title="暂无可分享的旅行" description="请先在“我的旅行”中创建旅行计划。" />
  </main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { useEligibility } from '../hooks/useEligibility';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import EligibilityPanel from '../components/common/EligibilityPanel.vue';
import EmptyState from '../components/common/EmptyState.vue';
import { toast } from '../utils/message';

const route = useRoute();
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const trip = computed(() => {
  const id = route.query.id as string | undefined;
  return tripStore.trips.find((item) => item.id === id) || tripStore.trips[0];
});
const eligibility = useEligibility(trip);

function copyText() {
  if (!trip.value || !eligibility.value) return;
  const roster = eligibility.value.members
    .map((member) => `${member.ok ? '✓' : '✗'} ${member.name}（护照 ${member.passport_expiry || '未登记'}，许可 ${member.allowed_stay_days ?? '未登记'} 天）`)
    .join('\n');
  const text = [
    `TripWeaver 行程单：${trip.value.title}`,
    `${trip.value.destination} · ${trip.value.start_date} 至 ${trip.value.end_date}`,
    `出行资格：${eligibility.value.passed ? '核对通过' : `未通过（${eligibility.value.issues.length} 项缺口）`}`,
    '核对后的名单：',
    roster,
  ].join('\n');
  navigator.clipboard?.writeText(text);
  toast.ok('行程文本已复制，含核对后的名单');
}
</script>

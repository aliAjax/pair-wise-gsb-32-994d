<template>
  <main class="page">
    <template v-if="trip && eligibility">
      <TripHeader :trip="trip" />
      <el-tag :type="eligibility.passed ? 'success' : 'danger'" class="share-status">
        {{ eligibility.passed ? '出行资格核对通过' : '出行资格核对未通过' }}
      </el-tag>
      <!-- 分享预览：展示核对后的名单 -->
      <EligibilityPanel :trip="trip" mode="preview" />
      <DayTimeline v-for="day in tripDays" :key="day.id" :day="day" :spots="spotStore.spots" />
      <el-button @click="copyText">复制行程文本</el-button>
    </template>
    <EmptyState v-else title="暂无可分享的旅行" description="请先在“我的旅行”中创建行程。" />
  </main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { checkTripEligibility } from '../utils/eligibility';
import TripHeader from '../components/common/TripHeader.vue';
import EligibilityPanel from '../components/common/EligibilityPanel.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import EmptyState from '../components/common/EmptyState.vue';
const route = useRoute();
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const trip = computed(() => {
  const id = route.params.id as string | undefined;
  return tripStore.trips.find((item) => item.id === id) || tripStore.trips[0];
});
const tripDays = computed(() => trip.value ? dayPlanStore.dayPlans.filter((day) => day.trip_id === trip.value!.id) : []);
const eligibility = computed(() => (trip.value ? checkTripEligibility(trip.value) : null));
function copyText() {
  if (!trip.value || !eligibility.value) return;
  const roster = eligibility.value.results
    .map((result) => `${result.traveler.name}：${result.passed ? '通过' : '不通过'}`)
    .join('；');
  navigator.clipboard?.writeText(`TripWeaver 行程单：${trip.value.title}\n出行资格核对：${roster}`);
}
</script>
<style scoped>
.share-status { margin: 12px 0; }
</style>

<template>
  <main class="page" v-if="trip">
    <TripHeader :trip="trip" />
    <div class="toolbar">
      <el-button type="primary" @click="router.push('/spots')">添加景点</el-button>
      <el-button @click="router.push('/planner/' + trip.id + '/1')">编排第 1 天</el-button>
      <el-button @click="router.push('/share?id=' + trip.id)">分享预览</el-button>
      <el-button @click="openMemberDialog">登记同行人证件</el-button>
    </div>

    <section class="band">
      <div class="date-row">
        <strong>行程日期</strong>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="出发日"
          end-placeholder="结束日"
        />
        <span class="muted">改动日期后将自动重新核对（当前计划停留 {{ eligibility?.plannedStayDays || 0 }} 天）</span>
      </div>
      <div class="toolbar confirm-row">
        <el-button type="success" :disabled="!eligibility?.passed" @click="handleConfirm">
          确认出行
        </el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <span v-if="eligibility && !eligibility.passed" class="muted">核对未通过，草稿仍可保存；“确认出行”已被挡住。</span>
        <span v-else-if="eligibility?.passed" class="muted">全员核对通过，可以确认出行。</span>
      </div>
    </section>

    <EligibilityPanel v-if="eligibility" :report="eligibility" :trip="trip" />

    <section class="grid">
      <BudgetChart :spent="stats.value.budget.spent" :remaining="stats.value.budget.remaining" />
      <div class="band"><strong>统计</strong><p>天数 {{ stats.value.days }} · 景点 {{ stats.value.spotCount }}</p><p class="muted">{{ stats.value.budget.warning }}</p></div>
    </section>
    <DayTimeline v-for="day in tripDays" :key="day.id" :day="day" :spots="spotStore.spots" />

    <el-dialog v-model="memberDialogVisible" title="同行人证件登记" width="720px">
      <p class="muted">每名同行人都需登记护照到期日与本次允许停留天数；改动保存后立即重新核对。</p>
      <el-table :data="memberDraft" size="small">
        <el-table-column label="姓名" min-width="120">
          <template #default="{ row }"><el-input v-model="row.name" placeholder="姓名" /></template>
        </el-table-column>
        <el-table-column label="护照到期日" min-width="160">
          <template #default="{ row }">
            <el-date-picker v-model="row.passport_expiry" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" />
          </template>
        </el-table-column>
        <el-table-column label="允许停留（天）" min-width="130">
          <template #default="{ row }"><el-input-number v-model="row.allowed_stay_days" :min="1" :max="365" controls-position="right" placeholder="天数" /></template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="{ $index }"><el-button link type="danger" @click="memberDraft.splice($index, 1)">移除</el-button></template>
        </el-table-column>
      </el-table>
      <el-button class="add-member-btn" @click="addDraftMember">添加同行人</el-button>
      <template #footer>
        <el-button @click="memberDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMembers">保存并重新核对</el-button>
      </template>
    </el-dialog>
  </main>
  <main v-else class="page"><EmptyState title="旅行不存在" /></main>
</template>
<script setup lang="ts">
import { computed, ref, type WritableComputedOptions } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { useTripStats } from '../hooks/useTripStats';
import { useEligibility } from '../hooks/useEligibility';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import BudgetChart from '../components/common/BudgetChart.vue';
import EmptyState from '../components/common/EmptyState.vue';
import EligibilityPanel from '../components/common/EligibilityPanel.vue';
import type { TravelMember } from '../models/trip';

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const trip = computed(() => tripStore.trips.find((item) => item.id === route.params.id));
const tripDays = computed(() => dayPlanStore.dayPlans.filter((day) => day.trip_id === route.params.id));
const stats = computed(() => trip.value ? useTripStats(trip.value, dayPlanStore.dayPlans, spotStore.spots) : { value: { days: 0, spotCount: 0, budget: { spent: 0, remaining: 0, warning: '' } } });
const eligibility = useEligibility(trip);

type DateRange = [string, string] | null;
const dateRangeOptions: WritableComputedOptions<DateRange> = {
  get: () => (trip.value && trip.value.start_date && trip.value.end_date ? [trip.value.start_date, trip.value.end_date] : null),
  set: (value) => {
    if (trip.value && value) tripStore.updateTripDates(trip.value.id, { start_date: value[0], end_date: value[1] });
  },
};
const dateRange = computed(dateRangeOptions);

const memberDialogVisible = ref(false);
const memberDraft = ref<TravelMember[]>([]);
function openMemberDialog() {
  if (!trip.value) return;
  memberDraft.value = trip.value.members.map((member) => ({ ...member }));
  memberDialogVisible.value = true;
}
function addDraftMember() {
  memberDraft.value.push({ id: crypto.randomUUID(), name: '', passport_expiry: '', allowed_stay_days: null });
}
function saveMembers() {
  if (!trip.value) return;
  tripStore.replaceMembers(trip.value.id, memberDraft.value);
  memberDialogVisible.value = false;
}

function handleConfirm() {
  if (trip.value) tripStore.confirmTrip(trip.value.id);
}
function handleSaveDraft() {
  if (trip.value) tripStore.saveDraft(trip.value.id);
}
</script>
<style scoped>
.date-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.confirm-row { margin-bottom: 0; }
.add-member-btn { margin-top: 12px; }
</style>

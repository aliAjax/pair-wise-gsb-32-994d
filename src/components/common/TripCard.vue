<template>
  <article class="trip-card">
    <div>
      <strong>{{ trip.title }}</strong>
      <p class="muted">{{ trip.destination }} · {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}</p>
    </div>
    <div class="tag-row">
      <el-tag>{{ tripStatusText[trip.status] }}</el-tag>
      <el-tag :type="eligibility.passed ? 'success' : 'danger'">
        {{ eligibility.passed ? '资格通过' : '资格待核对' }}
      </el-tag>
      <el-tag v-if="trip.confirmed" type="success">已确认出行</el-tag>
    </div>
    <p>预算 {{ formatCurrency(trip.budget, trip.currency) }} · 同行 {{ trip.members.join('、') }}</p>
    <p v-if="!eligibility.passed" class="blocking">
      {{ failedNames }} 共 {{ failedCount }} 人未通过核对（计划停留 {{ eligibility.plannedStayDays }} 天）
    </p>
    <div class="toolbar">
      <el-button type="primary" @click="$emit('open', trip.id)">进入详情</el-button>
      <el-button @click="$emit('remove', trip.id)">删除</el-button>
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { Trip } from '../../models/trip';
import { formatCurrency, formatDate, tripStatusText } from '../../utils/formatters';
import { checkTripEligibility } from '../../utils/eligibility';
const props = defineProps<{ trip: Trip }>();
defineEmits<{ open: [id: string]; remove: [id: string] }>();
const eligibility = computed(() => checkTripEligibility(props.trip));
const failedResults = computed(() => eligibility.value.results.filter((result) => !result.passed));
const failedCount = computed(() => failedResults.value.length);
const failedNames = computed(() => failedResults.value.map((result) => result.traveler.name).join('、'));
</script>
<style scoped>
.trip-card { background: #fff; border: 1px solid #dbe7cf; border-radius: 8px; padding: 18px; }
.tag-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
.blocking { color: #c0392b; font-size: 13px; }
</style>

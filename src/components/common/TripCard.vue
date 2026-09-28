<template>
  <article class="trip-card">
    <div>
      <strong>{{ trip.title }}</strong>
      <p class="muted">{{ trip.destination }} · {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}</p>
    </div>
    <div class="tag-row">
      <el-tag>{{ tripStatusText[trip.status] }}</el-tag>
      <el-tag v-if="eligibility.passed" type="success">资格核对通过</el-tag>
      <el-tag v-else type="danger">资格 {{ eligibility.issues.length }} 项缺口</el-tag>
    </div>
    <p>预算 {{ formatCurrency(trip.budget, trip.currency) }} · 同行 {{ trip.members.length }} 人{{ blockedNames }}</p>
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
import { checkTravelEligibility } from '../../utils/eligibility';

const props = defineProps<{ trip: Trip }>();
defineEmits<{ open: [id: string]; remove: [id: string] }>();

const eligibility = computed(() => checkTravelEligibility(props.trip));
const blockedNames = computed(() => {
  const names = eligibility.value.members.filter((member) => !member.ok).map((member) => member.name);
  return names.length ? `（待处理：${names.join('、')}）` : '';
});
</script>
<style scoped>
.trip-card { background: #fff; border: 1px solid #dbe7cf; border-radius: 8px; padding: 18px; }
.tag-row { display: flex; gap: 8px; margin: 6px 0; flex-wrap: wrap; }
</style>

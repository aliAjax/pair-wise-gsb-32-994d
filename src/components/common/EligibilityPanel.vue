<template>
  <section class="eligibility" :class="{ 'is-blocking': !eligibility.passed, 'is-passed': eligibility.passed && mode === 'edit' }">
    <header class="eligibility-head">
      <h2>出行资格核对</h2>
      <el-tag :type="eligibility.passed ? 'success' : 'danger'">
        {{ eligibility.passed ? '核对通过' : '核对未通过' }}
      </el-tag>
    </header>

    <!-- 编辑模式：行程日期改动后自动重新核对 -->
    <div v-if="mode === 'edit'" class="toolbar">
      <el-date-picker
        :model-value="trip.start_date"
        type="date"
        value-format="YYYY-MM-DD"
        label="出发日期"
        @update:model-value="(value: string) => emitDate(value, trip.end_date)"
      />
      <el-date-picker
        :model-value="trip.end_date"
        type="date"
        value-format="YYYY-MM-DD"
        label="行程结束日"
        @update:model-value="(value: string) => emitDate(trip.start_date, value)"
      />
      <span class="muted">计划停留 {{ eligibility.plannedStayDays }} 天</span>
    </div>

    <ul class="traveler-list">
      <li v-for="result in eligibility.results" :key="result.traveler.id" class="traveler-row" :class="{ failed: !result.passed }">
        <template v-if="mode === 'edit'">
          <el-input
            :model-value="result.traveler.name"
            class="name-input"
            @update:model-value="(value: string) => emit('traveler-update', result.traveler.id, { name: value })"
          />
          <el-date-picker
            :model-value="result.traveler.passport_expiry || undefined"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="护照到期日"
            class="passport-input"
            @update:model-value="(value: string) => emit('traveler-update', result.traveler.id, { passport_expiry: value || '' })"
          />
          <el-input-number
            :model-value="result.traveler.allowed_stay_days"
            :min="0"
            placeholder="允许停留天数"
            class="stay-input"
            @update:model-value="(value?: number) => emit('traveler-update', result.traveler.id, { allowed_stay_days: value ?? null })"
          />
          <el-button text type="danger" @click="emit('traveler-remove', result.traveler.id)">移除</el-button>
        </template>
        <template v-else>
          <strong class="preview-name">{{ result.traveler.name }}</strong>
          <span class="muted">护照到期 {{ result.traveler.passport_expiry || '未登记' }}</span>
          <span class="muted">允许停留 {{ result.traveler.allowed_stay_days ?? '未登记' }} 天</span>
        </template>
        <el-tag :type="result.passed ? 'success' : 'danger'" size="small">
          {{ result.passed ? '通过' : '不通过' }}
        </el-tag>
        <ul v-if="!result.passed" class="issue-list">
          <li v-for="issue in result.issues" :key="issue.code">{{ issue.text }}</li>
        </ul>
      </li>
    </ul>

    <p v-if="!eligibility.results.length" class="muted">尚未登记任何同行人。</p>

    <!-- 编辑模式：新增同行人 -->
    <div v-if="mode === 'edit'" class="toolbar">
      <el-input v-model="newTravelerName" placeholder="新增同行人姓名" class="add-input" @keyup.enter="addTraveler" />
      <el-button @click="addTraveler">添加同行人</el-button>
    </div>

    <!-- 编辑模式：草稿可保存；核对未通过挡住“确认出行” -->
    <div v-if="mode === 'edit'" class="toolbar actions">
      <el-button @click="emit('save-draft')">保存草稿</el-button>
      <el-tooltip :disabled="eligibility.passed" :content="messages.confirmBlocked" placement="top">
        <span>
          <el-button
            type="primary"
            :disabled="!eligibility.passed"
            @click="emit('confirm')"
          >{{ trip.confirmed ? '已确认出行' : '确认出行' }}</el-button>
        </span>
      </el-tooltip>
      <span v-if="eligibility.passed" class="passed-text">{{ messages.eligibilityPassed }}</span>
      <span v-else class="blocking-text">{{ messages.eligibilityBlocking }}</span>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Trip } from '../../models/trip';
import type { Traveler } from '../../models/traveler';
import { checkTripEligibility } from '../../utils/eligibility';
import { messages } from '../../constants/messages';

const props = defineProps<{ trip: Trip; mode?: 'edit' | 'preview' }>();
const emit = defineEmits<{
  'date-change': [patch: Pick<Trip, 'start_date' | 'end_date'>];
  'traveler-add': [name: string];
  'traveler-update': [travelerId: string, patch: Partial<Omit<Traveler, 'id'>>];
  'traveler-remove': [travelerId: string];
  'save-draft': [];
  confirm: [];
}>();

const mode = computed(() => props.mode || 'edit');
// trip 来自 store 的响应式对象，日期或同行人改动后这里自动重新核对
const eligibility = computed(() => checkTripEligibility(props.trip));
const newTravelerName = ref('');

function emitDate(start: string | undefined, end: string | undefined) {
  emit('date-change', { start_date: start || props.trip.start_date, end_date: end || props.trip.end_date });
}
function addTraveler() {
  const name = newTravelerName.value.trim();
  if (!name) return;
  emit('traveler-add', name);
  newTravelerName.value = '';
}
</script>
<style scoped>
.eligibility { background: #fff; border: 1px solid #dbe7cf; border-radius: 8px; padding: 20px; margin: 16px 0; }
.eligibility-head { display: flex; align-items: center; justify-content: space-between; }
.eligibility-head h2 { margin: 0 0 8px; font-size: 18px; }
.eligibility.is-blocking { border-color: #e6a23c; background: #fffaf0; }
.eligibility.is-passed { border-color: #67c23a; }
.traveler-list { list-style: none; padding: 0; margin: 12px 0; display: grid; gap: 10px; }
.traveler-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 10px; border: 1px solid #e4eadf; border-radius: 6px; background: #fff; }
.traveler-row.failed { border-color: #f5b7b1; background: #fef6f5; }
.name-input { width: 120px; }
.passport-input { width: 160px; }
.stay-input { width: 150px; }
.add-input { max-width: 220px; }
.issue-list { flex-basis: 100%; margin: 4px 0 0; padding-left: 18px; color: #c0392b; font-size: 13px; }
.preview-name { min-width: 72px; }
.actions { margin-top: 8px; }
.passed-text { color: #2d7a46; font-size: 13px; }
.blocking-text { color: #b26a00; font-size: 13px; }
</style>

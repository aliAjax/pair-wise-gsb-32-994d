<template>
  <section class="band eligibility-panel" :class="{ 'is-roster': variant === 'roster' }">
    <div class="eligibility-head">
      <h3>出行资格核对</h3>
      <el-tag v-if="report.passed" type="success">核对通过</el-tag>
      <el-tag v-else type="danger">核对未通过 · {{ report.issues.length }} 项缺口</el-tag>
    </div>
    <p class="muted">
      计划停留 <strong>{{ report.plannedStayDays || '—' }}</strong> 天
      <template v-if="trip">（{{ trip.start_date || '未填' }} 至 {{ trip.end_date || '未填' }}，首尾各算 1 天）</template>
    </p>

    <el-alert
      v-if="!report.passed"
      :title="variant === 'roster' ? '以下同行人暂不具备出行资格：' : '以下人员存在缺口，已挡住“确认出行”：'"
      type="error"
      :closable="false"
      show-icon
    >
      <ul class="issue-list">
        <li v-for="issue in report.issues" :key="issue.type + issue.target">
          <el-tag size="small" type="danger">{{ eligibilityIssueTypeText[issue.type] }}</el-tag>
          <span>{{ issue.message }}</span>
        </li>
      </ul>
    </el-alert>
    <el-alert v-else title="全部同行人护照与停留许可核对通过。" type="success" :closable="false" show-icon />

    <h4>核对后的名单（共 {{ report.members.length }} 人）</h4>
    <el-table :data="report.members" size="small" border>
      <el-table-column label="同行人" prop="name" min-width="110" />
      <el-table-column label="护照到期日" min-width="120">
        <template #default="{ row }">{{ row.passport_expiry || '未登记' }}</template>
      </el-table-column>
      <el-table-column label="允许停留（天）" min-width="110">
        <template #default="{ row }">{{ row.allowed_stay_days ?? '未登记' }}</template>
      </el-table-column>
      <el-table-column label="计划停留（天）" min-width="110">
        <template #default>{{ report.plannedStayDays || '—' }}</template>
      </el-table-column>
      <el-table-column label="核对结果" min-width="100">
        <template #default="{ row }">
          <el-tag v-if="row.ok" type="success" size="small">通过</el-tag>
          <el-tag v-else type="danger" size="small">有缺口</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>
<script setup lang="ts">
import type { EligibilityReport } from '../../types';
import type { Trip } from '../../models/trip';
import { eligibilityIssueTypeText } from '../../utils/formatters';

defineProps<{ report: EligibilityReport; trip?: Trip; variant?: 'full' | 'roster' }>();
</script>
<style scoped>
.eligibility-head { display: flex; align-items: center; justify-content: space-between; }
.issue-list { margin: 8px 0 0; padding-left: 18px; }
.issue-list li { display: flex; gap: 8px; align-items: baseline; margin: 4px 0; }
h4 { margin: 14px 0 8px; }
.is-roster :deep(.el-table) { background: transparent; }
</style>

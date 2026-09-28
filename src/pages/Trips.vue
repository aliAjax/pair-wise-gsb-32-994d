<template>
  <main class="page">
    <h1>我的旅行</h1>
    <div class="toolbar">
      <el-button type="primary" @click="create">新建旅行</el-button>
      <el-select v-model="tripStore.statusFilter" style="width: 160px">
        <el-option label="全部状态" value="all" />
        <el-option v-for="item in TRIP_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <EmptyState v-if="!tripStore.filteredTrips.length" title="还没有旅行计划" :description="messages.emptyTrips" />
    <p v-else class="muted">卡片显示每名同行人的出行资格核对结果；有缺口时进入详情登记护照到期日与允许停留天数。</p>
    <section class="grid">
      <TripCard v-for="trip in tripStore.filteredTrips" :key="trip.id" :trip="trip" @open="open" @remove="tripStore.removeTrip" />
    </section>
  </main>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import TripCard from '../components/common/TripCard.vue';
import EmptyState from '../components/common/EmptyState.vue';
import { useTripStore } from '../stores/tripStore';
import { TRIP_STATUS_OPTIONS } from '../constants/trip';
import { messages } from '../constants/messages';
const router = useRouter();
const tripStore = useTripStore();
function create() { router.push('/trip/' + tripStore.createTrip()); }
function open(id: string) { router.push('/trip/' + id); }
</script>


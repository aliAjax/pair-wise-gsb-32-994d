import { defineStore } from 'pinia';
import { TripStatus } from '../constants/trip';
import type { Trip } from '../models/trip';
import type { Traveler } from '../models/traveler';
import { tripApi } from '../api/tripApi';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';
import { checkTripEligibility } from '../utils/eligibility';

/** 历史草稿只有 members 字符串数组，这里补齐每名同行人的证件登记信息 */
function migrateTravelers(trip: Trip): Traveler[] {
  if (Array.isArray(trip.travelers)) return trip.travelers;
  return (trip.members || []).map((name) => ({
    id: crypto.randomUUID(),
    name,
    passport_expiry: '',
    allowed_stay_days: null,
  }));
}

export const useTripStore = defineStore('trip', {
  state: () => ({ trips: tripApi.list().map((trip) => ({ ...trip, travelers: migrateTravelers(trip), confirmed: trip.confirmed ?? false })) as Trip[], statusFilter: 'all' as TripStatus | 'all' }),
  getters: {
    filteredTrips: (state) => state.statusFilter === 'all' ? state.trips : state.trips.filter((trip) => trip.status === state.statusFilter),
  },
  actions: {
    persist() {
      tripApi.save(this.trips);
    },
    createTrip(title = '杭州周末慢旅行') {
      const start = new Date().toISOString().slice(0, 10);
      const end = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);
      const travelers: Traveler[] = ['我', '朋友'].map((name) => ({
        id: crypto.randomUUID(),
        name,
        passport_expiry: '',
        allowed_stay_days: null,
      }));
      const trip: Trip = {
        id: crypto.randomUUID(),
        title,
        destination: '杭州',
        start_date: start,
        end_date: end,
        budget: 3200,
        currency: 'CNY',
        members: travelers.map((item) => item.name),
        travelers,
        confirmed: false,
        status: TripStatus.PLANNING,
        created_at: new Date().toISOString(),
      };
      this.trips.unshift(trip);
      this.persist();
      toast.ok(messages.tripCreated);
      return trip.id;
    },
    removeTrip(id: string) {
      this.trips = this.trips.filter((trip) => trip.id !== id);
      this.persist();
      toast.ok(messages.tripDeleted);
    },
    /** 日期改动后持久化并重新核对；未通过时撤回“已确认”状态 */
    updateTripDates(id: string, patch: Pick<Trip, 'start_date' | 'end_date'>) {
      const trip = this.trips.find((item) => item.id === id);
      if (!trip) return;
      trip.start_date = patch.start_date;
      trip.end_date = patch.end_date;
      this.refreshConfirmation(trip);
      this.persist();
    },
    addTraveler(id: string, name: string) {
      const trip = this.trips.find((item) => item.id === id);
      const trimmed = name.trim();
      if (!trip || !trimmed) return;
      const traveler: Traveler = { id: crypto.randomUUID(), name: trimmed, passport_expiry: '', allowed_stay_days: null };
      trip.travelers.push(traveler);
      trip.members.push(trimmed);
      this.refreshConfirmation(trip);
      this.persist();
      toast.ok(messages.travelerAdded);
    },
    updateTraveler(id: string, travelerId: string, patch: Partial<Omit<Traveler, 'id'>>) {
      const trip = this.trips.find((item) => item.id === id);
      const traveler = trip?.travelers.find((item) => item.id === travelerId);
      if (!trip || !traveler) return;
      const previousName = traveler.name;
      Object.assign(traveler, patch);
      if (patch.name !== undefined) {
        const index = trip.members.indexOf(previousName);
        if (index >= 0) trip.members[index] = patch.name;
      }
      this.refreshConfirmation(trip);
      this.persist();
    },
    removeTraveler(id: string, travelerId: string) {
      const trip = this.trips.find((item) => item.id === id);
      if (!trip) return;
      const traveler = trip.travelers.find((item) => item.id === travelerId);
      trip.travelers = trip.travelers.filter((item) => item.id !== travelerId);
      if (traveler) trip.members = trip.members.filter((name) => name !== traveler.name);
      this.refreshConfirmation(trip);
      this.persist();
      toast.ok(messages.travelerRemoved);
    },
    refreshConfirmation(trip: Trip) {
      // 日期或同行人改动后重新核对，未通过即不可保留“已确认”
      if (trip.confirmed && !checkTripEligibility(trip).passed) trip.confirmed = false;
    },
    /** 未通过核对的草稿仍可保存 */
    saveDraft(id: string) {
      this.persist();
      toast.ok(messages.tripSaved);
    },
    /** 挡住“确认出行”：核对未通过时返回 false */
    confirmTrip(id: string): boolean {
      const trip = this.trips.find((item) => item.id === id);
      if (!trip) return false;
      const eligibility = checkTripEligibility(trip);
      if (!eligibility.passed) {
        toast.fail(messages.confirmBlocked);
        return false;
      }
      trip.confirmed = true;
      this.persist();
      toast.ok(messages.confirmSuccess);
      return true;
    },
  },
});

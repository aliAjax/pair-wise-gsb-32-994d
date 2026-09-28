import { defineStore } from 'pinia';
import { TripStatus } from '../constants/trip';
import type { Trip, TravelMember } from '../models/trip';
import { tripApi } from '../api/tripApi';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';
import { checkTravelEligibility } from '../utils/eligibility';

const isoDay = (offsetDays: number) => new Date(Date.now() + 86400000 * offsetDays).toISOString().slice(0, 10);

export const useTripStore = defineStore('trip', {
  state: () => ({ trips: tripApi.list() as Trip[], statusFilter: 'all' as TripStatus | 'all' }),
  getters: {
    filteredTrips: (state) => state.statusFilter === 'all' ? state.trips : state.trips.filter((trip) => trip.status === state.statusFilter),
  },
  actions: {
    createTrip(title = '清迈初夏 7 日行') {
      const trip: Trip = {
        id: crypto.randomUUID(),
        title,
        destination: '清迈',
        start_date: isoDay(30),
        end_date: isoDay(36),
        budget: 3200,
        currency: 'CNY',
        // 演示数据：两人都带缺口——护照到期日早于返程、许可停留不足，便于在机场前暴露问题
        members: [
          { id: crypto.randomUUID(), name: '我', passport_expiry: isoDay(33), allowed_stay_days: 30 },
          { id: crypto.randomUUID(), name: '朋友', passport_expiry: isoDay(120), allowed_stay_days: 5 },
        ],
        status: TripStatus.PLANNING,
        created_at: new Date().toISOString(),
      };
      this.trips.unshift(trip);
      tripApi.save(this.trips);
      toast.ok(messages.tripCreated);
      return trip.id;
    },
    removeTrip(id: string) {
      this.trips = this.trips.filter((trip) => trip.id !== id);
      tripApi.save(this.trips);
      toast.ok(messages.tripDeleted);
    },
    // 未通过资格核对的草稿仍然可以保存
    saveDraft(id: string) {
      const trip = this.trips.find((item) => item.id === id);
      if (!trip) return;
      tripApi.save(this.trips);
      const report = checkTravelEligibility(trip);
      report.passed ? toast.ok(messages.draftSaved) : toast.warn(messages.draftSaved);
    },
    updateTripDates(id: string, patch: Pick<Trip, 'start_date' | 'end_date'>) {
      const trip = this.trips.find((item) => item.id === id);
      if (!trip) return;
      trip.start_date = patch.start_date;
      trip.end_date = patch.end_date;
      tripApi.save(this.trips);
      toast.ok(messages.tripDatesUpdated);
    },
    addMember(id: string) {
      const trip = this.trips.find((item) => item.id === id);
      if (!trip) return;
      trip.members.push({ id: crypto.randomUUID(), name: '', passport_expiry: '', allowed_stay_days: null });
      tripApi.save(this.trips);
      toast.ok(messages.memberAdded);
    },
    replaceMembers(tripId: string, members: TravelMember[]) {
      const trip = this.trips.find((item) => item.id === tripId);
      if (!trip) return;
      trip.members = members.map((member) => ({
        ...member,
        id: member.id || crypto.randomUUID(),
        allowed_stay_days: member.allowed_stay_days === null || Number.isNaN(member.allowed_stay_days as number) ? null : Number(member.allowed_stay_days),
      }));
      tripApi.save(this.trips);
    },
    updateMember(tripId: string, memberId: string, patch: Partial<Omit<TravelMember, 'id'>>) {
      const trip = this.trips.find((item) => item.id === tripId);
      const member = trip?.members.find((item) => item.id === memberId);
      if (!trip || !member) return;
      Object.assign(member, patch);
      tripApi.save(this.trips);
    },
    removeMember(tripId: string, memberId: string) {
      const trip = this.trips.find((item) => item.id === tripId);
      if (!trip) return;
      trip.members = trip.members.filter((item) => item.id !== memberId);
      tripApi.save(this.trips);
      toast.ok(messages.memberRemoved);
    },
    // 确认出行：核对不通过（含证件缺口）时挡住
    confirmTrip(id: string) {
      const trip = this.trips.find((item) => item.id === id);
      if (!trip) return false;
      const report = checkTravelEligibility(trip);
      if (!report.passed) {
        toast.fail(messages.confirmBlocked);
        return false;
      }
      trip.status = TripStatus.ONGOING;
      tripApi.save(this.trips);
      toast.ok(messages.tripConfirmed);
      return true;
    },
  },
});

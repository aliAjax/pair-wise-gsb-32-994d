import type { Trip, TravelMember } from '../models/trip';
import { STORAGE_KEYS } from '../constants/storageVersion';
import { loadLocal, saveLocal } from '../utils/storage';

// 旧版草稿的 members 是 string[]，读取时迁移为带护照信息的 TravelMember[]，
// 迁移后的字段留空，由资格核对提示补登。
function migrateTrip(raw: Trip): Trip {
  const members: TravelMember[] = Array.isArray(raw.members)
    ? raw.members.map((member) =>
      typeof member === 'string'
        ? { id: crypto.randomUUID(), name: member, passport_expiry: '', allowed_stay_days: null }
        : member,
    )
    : [];
  return { ...raw, members };
}

export const tripApi = {
  list: () => loadLocal<Trip[]>(STORAGE_KEYS.trips, []).map(migrateTrip),
  save: (trips: Trip[]) => saveLocal(STORAGE_KEYS.trips, trips),
};

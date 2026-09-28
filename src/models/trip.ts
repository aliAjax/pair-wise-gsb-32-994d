import { TripStatus } from '../constants/trip';

// 每名同行人都需要登记护照到期日与本次目的地允许停留天数
export interface TravelMember {
  id: string;
  name: string;
  passport_expiry: string; // YYYY-MM-DD，空串表示未登记
  allowed_stay_days: number | null; // 本次允许停留天数，null 表示未登记
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  members: TravelMember[];
  status: TripStatus;
  created_at: string;
}

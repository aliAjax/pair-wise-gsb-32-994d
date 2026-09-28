import { TripStatus } from '../constants/trip';
import type { Traveler } from './traveler';

export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  members: string[];
  /** 每名同行人的护照到期日与本次允许停留天数（出行资格核对） */
  travelers: Traveler[];
  /** 草稿可保存；仅资格核对全部通过后才可“确认出行” */
  confirmed: boolean;
  status: TripStatus;
  created_at: string;
}

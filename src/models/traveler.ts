export interface Traveler {
  id: string;
  name: string;
  passport_expiry: string; // 护照到期日 YYYY-MM-DD
  allowed_stay_days: number | null; // 本次目的地允许停留天数
}

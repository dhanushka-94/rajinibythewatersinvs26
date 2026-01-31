export interface RateType {
  id: string;
  name: string;
  displayOrder: number;
}

export interface RoomRate {
  id: string;
  roomId: string;
  rateTypeId: string;
  ratePerNight: number;
  currency: string;
}

export interface RoomRateUpsert {
  rateTypeId: string;
  ratePerNight: number;
  currency?: string;
}

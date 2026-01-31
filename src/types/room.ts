export type RoomStatus = "available" | "maintenance" | "disabled";

export interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  ratePerNight: number;
  currency: string;
  capacity: number;
  status: RoomStatus;
  floor?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomCreate {
  roomNumber: string;
  roomType: string;
  ratePerNight: number;
  currency?: string;
  capacity?: number;
  status?: RoomStatus;
  floor?: string;
  notes?: string;
}

export interface RoomUpdate {
  roomNumber?: string;
  roomType?: string;
  ratePerNight?: number;
  currency?: string;
  capacity?: number;
  status?: RoomStatus;
  floor?: string;
  notes?: string;
}

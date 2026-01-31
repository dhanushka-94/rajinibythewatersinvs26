export interface Offer {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OfferCreate {
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface OfferUpdate {
  name?: string;
  description?: string;
  displayOrder?: number;
}

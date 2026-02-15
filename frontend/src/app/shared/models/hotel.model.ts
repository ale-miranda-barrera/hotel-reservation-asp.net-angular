export interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  pricePerNight: number;
  imageUrl: string;
  rating: number;
}

export interface CreateHotelDto {
  name: string;
  city: string;
  address: string;
  phone: string;
  pricePerNight: number;
}

export interface Reservation {
  id: number;
  hotelId: number;
  hotelName?: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber: number;
  pricePerNight: number;
  status: string;       // 'Pending' | 'Confirmed' | 'Cancelled'
  totalPrice: number;
  createdAt: string;
}

export interface CreateReservationDto {
  hotelId: number;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber: number;
  pricePerNight?: number;
}

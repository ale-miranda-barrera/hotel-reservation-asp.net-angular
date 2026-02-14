// src/app/shared/models/reservation.model.ts
//
// Dates are typed as string (not Date) because the backend returns ISO 8601
// strings. Keeping them as string avoids silent deserialization issues when
// passing values directly to Angular date pipes or date inputs.

export interface Reservation {
  id: number;
  hotelId: number;
  hotelName?: string;   // optional — included when the backend eagerly loads the hotel
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber: number;
  pricePerNight: number;
  status: string;       // 'Pending' | 'Confirmed' | 'Cancelled' — kept as string for flexibility
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
  pricePerNight?: number; // optional — the backend can calculate it from hotel data
}

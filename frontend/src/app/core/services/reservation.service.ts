import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, CreateReservationDto } from '../../shared/models/reservation.model';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly apiUrl = `${environment.apiUrl}/Reservations`;

  constructor(private http: HttpClient) {}

  createReservation(reservation: CreateReservationDto): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }

  getReservationsByEmail(email: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}`);
  }

  getReservationsByHotel(hotelId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/hotel/${hotelId}`);
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

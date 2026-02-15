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

  getPendingReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/pending`);
  }

  getReservationsByEmail(email: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}`);
  }

  getReservationsByHotel(hotelId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/hotel/${hotelId}`);
  }

  updateStatus(id: number, status: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

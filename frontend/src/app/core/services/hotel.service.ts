import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Hotel, CreateHotelDto } from '../../shared/models/hotel.model';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly apiUrl = `${environment.apiUrl}/Hotels`;

  constructor(private http: HttpClient) {}

  getHotels(): Observable<Hotel[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(hotels => hotels.map(h => this.mapHotelResponse(h)))
    );
  }

  getHotelById(id: number): Observable<Hotel> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(h => this.mapHotelResponse(h))
    );
  }

  createHotel(hotel: CreateHotelDto): Observable<Hotel> {
    return this.http.post<Hotel>(this.apiUrl, hotel);
  }

  updateHotel(id: number, hotel: CreateHotelDto): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.apiUrl}/${id}`, hotel);
  }

  deleteHotel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // The backend Hotel entity doesn't have pricePerNight, imageUrl, or rating yet.
  // Generate deterministic fallback values based on the hotel ID.
  private mapHotelResponse(apiHotel: any): Hotel {
    const images = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80'
    ];
    return {
      id: apiHotel.id,
      name: apiHotel.name,
      city: apiHotel.city,
      address: apiHotel.address,
      phone: apiHotel.phone,
      pricePerNight: apiHotel.pricePerNight ?? (100 + (apiHotel.id * 15) % 300),
      rating: apiHotel.rating ?? (3 + (apiHotel.id % 3)),
      imageUrl: apiHotel.imageUrl ?? images[apiHotel.id % images.length]
    };
  }
}

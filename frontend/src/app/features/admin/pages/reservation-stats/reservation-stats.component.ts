import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../core/services/hotel.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { Hotel } from '../../../../shared/models/hotel.model';
import { Reservation } from '../../../../shared/models/reservation.model';

@Component({
  selector: 'app-reservation-stats',
  standalone: true,
  imports: [FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="stats-page">
      <div class="page-header">
        <h1 class="page-title">Panel de Administracion</h1>
        <p class="page-subtitle">Estadisticas de Reservas por Hotel</p>
      </div>

      <div class="selector-section">
        <label class="selector-label" for="hotelSelect">Seleccionar Hotel</label>
        <select
          id="hotelSelect"
          class="hotel-select"
          [ngModel]="selectedHotelId()"
          (ngModelChange)="onHotelChange($event)"
        >
          <option [ngValue]="null" disabled>-- Elige un hotel --</option>
          @for (hotel of hotels(); track hotel.id) {
            <option [ngValue]="hotel.id">{{ hotel.name }} — {{ hotel.city }}</option>
          }
        </select>
      </div>

      @if (selectedHotelId() === null) {
        <div class="empty-state">
          <div class="empty-icon">&#127970;</div>
          <p class="empty-title">Selecciona un hotel para ver sus estadisticas</p>
          <p class="empty-subtitle">Los datos de reservas apareceran aqui</p>
        </div>
      }

      @if (selectedHotelId() !== null) {
        <div class="stats-grid">
          <div class="stat-card card-navy">
            <span class="stat-label">Total Reservas</span>
            <span class="stat-value">{{ totalReservations() }}</span>
          </div>
          <div class="stat-card card-teal">
            <span class="stat-label">Ingresos Totales</span>
            <span class="stat-value">{{ totalRevenue() | currency:'USD':'symbol':'1.2-2' }}</span>
          </div>
          <div class="stat-card card-gold">
            <span class="stat-label">Precio Promedio</span>
            <span class="stat-value">{{ averagePrice() | currency:'USD':'symbol':'1.2-2' }}</span>
          </div>
        </div>

        @if (reservations().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">&#128203;</div>
            <p class="empty-title">Este hotel no tiene reservas registradas</p>
          </div>
        }

        @if (reservations().length > 0) {
          <div class="table-wrapper">
            <table class="reservations-table">
              <thead>
                <tr>
                  <th>Huesped</th>
                  <th>Email</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Habitacion</th>
                  <th>Estado</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                @for (r of reservations(); track r.id) {
                  <tr class="table-row">
                    <td class="td-name">{{ r.guestName }}</td>
                    <td class="td-email">{{ r.guestEmail }}</td>
                    <td>{{ r.checkInDate | date:'dd/MM/yyyy' }}</td>
                    <td>{{ r.checkOutDate | date:'dd/MM/yyyy' }}</td>
                    <td class="td-center">{{ r.roomNumber }}</td>
                    <td>
                      <span [class]="'badge badge-' + getStatusClass(r.status)">
                        {{ r.status }}
                      </span>
                    </td>
                    <td class="td-price">{{ r.totalPrice | currency:'USD':'symbol':'1.2-2' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .stats-page {
      min-height: calc(100vh - 64px);
      background: #f8f9fa;
      padding: 2rem 1.5rem 3rem;
    }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.8rem; font-weight: 700; color: #1f2937; margin: 0 0 0.25rem; }
    .page-subtitle { font-size: 0.95rem; color: #6b7280; margin: 0; }

    .selector-section {
      background: #fff;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.06);
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .selector-label { font-weight: 600; color: #1f2937; font-size: 0.95rem; white-space: nowrap; }
    .hotel-select {
      flex: 1;
      min-width: 220px;
      padding: 0.65rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.95rem;
      color: #1f2937;
      background: #fff;
      cursor: pointer;
      outline: none;
    }
    .hotel-select:focus { border-color: #c9a84c; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr; } }

    .stat-card {
      border-radius: 12px;
      padding: 1.5rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      color: #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    }
    .stat-label { font-size: 0.82rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; }
    .stat-value { font-size: 2rem; font-weight: 800; line-height: 1.1; }
    .card-navy { background: #1a1a2e; }
    .card-teal { background: #0f766e; }
    .card-gold { background: #b8962f; }

    .table-wrapper {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.06);
      overflow: hidden;
      overflow-x: auto;
    }
    .reservations-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .reservations-table thead tr { background: #1a1a2e; }
    .reservations-table th {
      color: #fff;
      font-weight: 600;
      text-align: left;
      padding: 1rem 1.1rem;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }
    .table-row:nth-child(even) { background: #f9fafb; }
    .table-row:hover { background: #f0f1f5; }
    .reservations-table td {
      padding: 0.85rem 1.1rem;
      color: #374151;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
    }
    .td-name { font-weight: 600; color: #1f2937; }
    .td-email { color: #6b7280; font-size: 0.85rem; }
    .td-center { text-align: center; }
    .td-price { font-weight: 700; color: #0f766e; white-space: nowrap; }

    .badge {
      display: inline-block;
      padding: 0.28rem 0.75rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-confirmed { background: #d1fae5; color: #065f46; }
    .badge-cancelled { background: #fee2e2; color: #991b1b; }

    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.06);
    }
    .empty-icon { font-size: 3rem; margin-bottom: 0.75rem; }
    .empty-title { font-size: 1.05rem; font-weight: 600; color: #1f2937; margin: 0 0 0.4rem; }
    .empty-subtitle { font-size: 0.88rem; color: #9ca3af; margin: 0; }
  `]
})
export class ReservationStatsComponent implements OnInit {
  private readonly hotelService = inject(HotelService);
  private readonly reservationService = inject(ReservationService);

  hotels = signal<Hotel[]>([]);
  reservations = signal<Reservation[]>([]);
  selectedHotelId = signal<number | null>(null);

  totalReservations = computed(() => this.reservations().length);
  totalRevenue = computed(() => this.reservations().reduce((sum, r) => sum + r.totalPrice, 0));
  averagePrice = computed(() => {
    const len = this.reservations().length;
    return len === 0 ? 0 : this.totalRevenue() / len;
  });

  ngOnInit(): void {
    this.hotelService.getHotels().subscribe({
      next: (hotels) => this.hotels.set(hotels),
      error: (err) => console.error('Error loading hotels:', err)
    });
  }

  onHotelChange(hotelId: number | null): void {
    this.selectedHotelId.set(hotelId);
    if (hotelId === null) {
      this.reservations.set([]);
      return;
    }
    this.reservations.set([]);
    this.reservationService.getReservationsByHotel(hotelId).subscribe({
      next: (reservations) => this.reservations.set(reservations),
      error: (err) => console.error('Error loading reservations:', err)
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Confirmed': return 'confirmed';
      case 'Cancelled': return 'cancelled';
      default: return 'pending';
    }
  }
}

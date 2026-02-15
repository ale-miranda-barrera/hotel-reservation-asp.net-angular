import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../core/services/hotel.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { Hotel } from '../../../../shared/models/hotel.model';
import { Reservation } from '../../../../shared/models/reservation.model';

@Component({
  selector: 'app-reservation-stats',
  standalone: true,
  imports: [FormsModule, DatePipe, CurrencyPipe, NgClass],
  template: `
    <div class="stats-page">
      <div class="page-header">
        <h1 class="page-title">Panel de Administracion</h1>
        <p class="page-subtitle">Estadísticas de Reservas y Gestión Global</p>
      </div>

      <!-- Feedback Notification -->
      @if (feedback()) {
        <div class="feedback-toast" [ngClass]="{ 'error': feedback()?.isError }">
          <span class="feedback-icon">{{ feedback()?.isError ? '✕' : '✓' }}</span>
          <span class="feedback-text">{{ feedback()?.text }}</span>
          <button class="feedback-close" (click)="clearFeedback()">✕</button>
        </div>
      }

      <!-- Pending Reservations Section -->
      @if (pendingReservations().length > 0) {
        <div class="pending-section">
          <h2 class="section-title">Reservas Pendientes</h2>
          <div class="pending-grid">
            @for (reservation of pendingReservations(); track reservation.id) {
              <div class="pending-card">
                <div class="card-header">
                  <div class="hotel-info">
                    <h3 class="hotel-name">{{ reservation.hotelName || 'Hotel' }}</h3>
                    <span class="badge badge-pending">Pendiente</span>
                  </div>
                </div>
                <div class="card-body">
                  <div class="info-row">
                    <span class="info-label">Huésped:</span>
                    <span class="info-value">{{ reservation.guestName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{ reservation.guestEmail }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Check-in:</span>
                    <span class="info-value">{{ reservation.checkInDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Check-out:</span>
                    <span class="info-value">{{ reservation.checkOutDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Habitación:</span>
                    <span class="info-value">{{ reservation.roomNumber }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Total:</span>
                    <span class="info-value price">{{ reservation.totalPrice | currency:'USD':'symbol':'1.2-2' }}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="btn btn-confirm" (click)="confirmReservation(reservation.id)">
                    ✓ Confirmar
                  </button>
                  <button class="btn btn-cancel" (click)="cancelReservation(reservation.id)">
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Latest Global Reservations Section -->
      @if (latestReservations().length > 0) {
        <div class="latest-section">
          <h2 class="section-title">Últimas Reservas Globales</h2>
          <div class="latest-list">
            @for (r of latestReservations(); track r.id) {
              <div class="latest-item">
                <div class="item-status">
                  <span [class]="'dot dot-' + getStatusClass(r.status)"></span>
                </div>
                <div class="item-info">
                  <span class="item-hotel">{{ r.hotelName || 'Hotel' }}</span>
                  <span class="item-guest">{{ r.guestName }}</span>
                </div>
                <div class="item-dates">
                  {{ r.checkInDate | date:'dd/MM' }} - {{ r.checkOutDate | date:'dd/MM' }}
                </div>
                <div class="item-price">
                  {{ r.totalPrice | currency:'USD':'symbol':'1.0-0' }}
                </div>
              </div>
            }
          </div>
        </div>
      }

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

      <div class="admin-actions">
        <div class="action-card">
          <div class="action-icon">🏨</div>
          <div class="action-content">
            <h3 class="action-title">Nuevo Hotel</h3>
            <p class="action-desc">Registra una nueva propiedad en el sistema</p>
          </div>
          <button class="btn btn-primary" (click)="isCreatingHotel.set(true)">
            + Registrar Hotel
          </button>
        </div>
      </div>

      @if (isCreatingHotel()) {
        <div class="modal-overlay">
          <div class="modal-card">
            <div class="modal-header">
              <h2>Registrar Nuevo Hotel</h2>
              <button class="modal-close-btn" (click)="isCreatingHotel.set(false)">✕</button>
            </div>
            <div class="modal-body">
              <form #hotelForm="ngForm" class="hotel-form">
                <div class="form-group">
                  <label>Nombre del Hotel</label>
                  <input type="text" [(ngModel)]="newHotel().name" name="name" required placeholder="Ej: Hilton Garden Inn">
                </div>
                <div class="form-group">
                  <label>Ciudad</label>
                  <input type="text" [(ngModel)]="newHotel().city" name="city" required placeholder="Ej: Medellín">
                </div>
                <div class="form-group">
                  <label>Dirección</label>
                  <input type="text" [(ngModel)]="newHotel().address" name="address" required placeholder="Ej: Cra 43 # 10-10">
                </div>
                <div class="form-group">
                  <label>Teléfono</label>
                  <input type="text" [(ngModel)]="newHotel().phone" name="phone" required placeholder="Ej: 6041234567">
                </div>
                <div class="form-group">
                  <label>Precio por Noche</label>
                  <input type="number" [(ngModel)]="newHotel().pricePerNight" name="price" required min="1">
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="isCreatingHotel.set(false)">Cancelar</button>
              <button class="btn btn-confirm" [disabled]="!hotelForm.form.valid" (click)="saveHotel()">
                Guardar Hotel
              </button>
            </div>
          </div>
        </div>
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

    /* Pending Reservations Section */
    .pending-section {
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 1.25rem;
    }
    .pending-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .pending-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .pending-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.1);
    }
    .card-header {
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
      padding: 1.25rem 1.5rem;
    }
    .hotel-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .hotel-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
      flex: 1;
    }
    .card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .info-value {
      font-size: 0.95rem;
      font-weight: 500;
      color: #1f2937;
    }
    .info-value.price {
      font-size: 1.1rem;
      font-weight: 700;
      color: #0f766e;
    }
    .card-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    .btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .btn-confirm {
      background: #10b981;
      color: #fff;
    }
    .btn-confirm:hover {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .btn-cancel {
      background: #ef4444;
      color: #fff;
    }
    .btn-cancel:hover {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    /* Feedback Notification */
    .feedback-toast {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      background: #10b981;
      color: #fff;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }
    .feedback-toast.error { background: #ef4444; }
    .feedback-icon { font-size: 1.2rem; font-weight: bold; }
    .feedback-text { font-weight: 500; font-size: 0.95rem; }
    .feedback-close {
      background: none;
      border: none;
      color: #fff;
      cursor: pointer;
      opacity: 0.7;
      padding: 0.2rem;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    /* Latest Section */
    .latest-section { margin-bottom: 2rem; }
    .latest-list {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.06);
      padding: 0.5rem;
    }
    .latest-item {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #f3f4f6;
      transition: background 0.2s;
    }
    .latest-item:last-child { border-bottom: none; }
    .latest-item:hover { background: #f9fafb; }
    .item-status .dot {
      display: block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .dot-pending { background: #f59e0b; }
    .dot-confirmed { background: #10b981; }
    .dot-cancelled { background: #ef4444; }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-hotel { font-weight: 700; color: #1f2937; font-size: 0.95rem; }
    .item-guest { font-size: 0.85rem; color: #6b7280; }
    .item-dates { font-size: 0.88rem; color: #374151; font-weight: 500; }
    .item-price { font-weight: 700; color: #0f766e; min-width: 80px; text-align: right; }

    /* Admin Actions */
    .admin-actions { margin-top: 3rem; }
    .action-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem 2rem;
      display: flex;
      align-items: center;
      gap: 2rem;
      border: 2px dashed #e5e7eb;
      transition: all 0.3s;
    }
    .action-card:hover { border-color: #1a1a2e; background: #fafafa; }
    .action-icon { font-size: 2.5rem; }
    .action-content { flex: 1; }
    .action-title { margin: 0 0 0.25rem; font-size: 1.15rem; color: #1f2937; }
    .action-desc { margin: 0; font-size: 0.9rem; color: #6b7280; }
    .btn-primary {
      background: #1a1a2e;
      color: #fff;
      padding: 0.85rem 2rem;
      font-size: 1rem;
    }
    .btn-primary:hover {
      background: #2d2d44;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(26, 26, 46, 0.3);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1rem;
    }
    .modal-card {
      background: #fff;
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      animation: modalSlide 0.3s ease-out;
      overflow: hidden;
    }
    @keyframes modalSlide {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .modal-header {
      padding: 1.5rem;
      background: #1a1a2e;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h2 { margin: 0; font-size: 1.25rem; }
    .modal-close-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0.8;
    }
    .modal-body { padding: 2rem; }
    .hotel-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: #4b5563; }
    .form-group input {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.95rem;
      outline: none;
    }
    .form-group input:focus { border-color: #1a1a2e; box-shadow: 0 0 0 2px rgba(26,26,46,0.1); }
    .modal-footer {
      padding: 1.25rem 2rem;
      background: #f9fafb;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      border-top: 1px solid #e5e7eb;
    }
    .btn-secondary { background: #e5e7eb; color: #1f2937; }
    .btn-secondary:hover { background: #d1d5db; }

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
  pendingReservations = signal<Reservation[]>([]);
  latestReservations = signal<Reservation[]>([]);
  selectedHotelId = signal<number | null>(null);
  feedback = signal<{ text: string; isError?: boolean } | null>(null);

  isCreatingHotel = signal(false);
  newHotel = signal<any>({ name: '', city: '', address: '', phone: '', pricePerNight: 0 });

  totalReservations = computed(() => this.reservations().filter(r => r.status !== 'Cancelled').length);
  totalRevenue = computed(() => this.reservations()
    .filter(r => r.status !== 'Cancelled')
    .reduce((sum, r) => sum + r.totalPrice, 0)
  );
  averagePrice = computed(() => {
    const count = this.totalReservations();
    return count === 0 ? 0 : this.totalRevenue() / count;
  });

  ngOnInit(): void {
    this.hotelService.getHotels().subscribe({
      next: (hotels) => {
        this.hotels.set(hotels);
        const medellinId = hotels.find(h => h.city.toLowerCase().includes('medellin'))?.id;
        if (medellinId) {
          this.onHotelChange(medellinId);
        } else if (hotels.length > 0) {
          this.onHotelChange(hotels[0].id);
        }
      },
      error: (err) => console.error('Error loading hotels:', err)
    });
    this.loadPendingReservations();
    this.loadLatestReservations();
  }

  loadPendingReservations(): void {
    this.reservationService.getPendingReservations().subscribe({
      next: (reservations) => this.pendingReservations.set(reservations),
      error: (err) => console.error('Error loading pending reservations:', err)
    });
  }

  loadLatestReservations(): void {
    if (this.selectedHotelId()) {
      this.reservationService.getReservationsByHotel(this.selectedHotelId()!).subscribe({
        next: (reservations) => {
          const sorted = [...reservations].sort((a, b) =>
            new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
          );
          this.latestReservations.set(sorted.slice(0, 5));
        },
        error: (err) => console.error('Error loading latest reservations:', err)
      });
    }
  }

  showFeedback(text: string, isError = false): void {
    this.feedback.set({ text, isError });
    setTimeout(() => this.feedback.set(null), 5000);
  }

  clearFeedback(): void {
    this.feedback.set(null);
  }

  confirmReservation(id: number): void {
    this.reservationService.updateStatus(id, '2').subscribe({
      next: () => {
        this.showFeedback('¡Reserva confirmada con éxito!');
        this.loadPendingReservations();
        this.loadLatestReservations();
        if (this.selectedHotelId()) {
          this.onHotelChange(this.selectedHotelId());
        }
      },
      error: (err) => {
        this.showFeedback('Error al confirmar la reserva', true);
        console.error('Error confirming reservation:', err);
      }
    });
  }

  cancelReservation(id: number): void {
    this.reservationService.updateStatus(id, '3').subscribe({
      next: () => {
        this.showFeedback('La reserva ha sido cancelada correctamente.');
        this.loadPendingReservations();
        this.loadLatestReservations();
        if (this.selectedHotelId()) {
          this.onHotelChange(this.selectedHotelId());
        }
      },
      error: (err) => {
        this.showFeedback('Error al cancelar la reserva', true);
        console.error('Error cancelling reservation:', err);
      }
    });
  }

  saveHotel(): void {
    const data = this.newHotel();
    this.hotelService.createHotel(data).subscribe({
      next: (hotel) => {
        this.showFeedback(`Hotel "${hotel.name}" registrado correctamente.`);
        this.isCreatingHotel.set(false);
        this.newHotel.set({ name: '', city: '', address: '', phone: '', pricePerNight: 0 });
        this.hotelService.getHotels().subscribe(h => this.hotels.set(h));
      },
      error: (err) => {
        this.showFeedback('Error al registrar el hotel', true);
        console.error('Error creating hotel:', err);
      }
    });
  }

  onHotelChange(hotelId: number | null): void {
    this.selectedHotelId.set(hotelId);
    if (hotelId === null) {
      this.reservations.set([]);
      this.latestReservations.set([]);
      return;
    }
    this.reservations.set([]);
    this.reservationService.getReservationsByHotel(hotelId).subscribe({
      next: (reservations) => {
        this.reservations.set(reservations);
        this.loadLatestReservations();
      },
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

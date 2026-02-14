import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { HotelService } from '../../../../core/services/hotel.service';
import { ReservationService } from '../../../../core/services/reservation.service';
import { Hotel } from '../../../../shared/models/hotel.model';
import { CreateReservationDto } from '../../../../shared/models/reservation.model';

function checkOutAfterCheckIn(group: AbstractControl): ValidationErrors | null {
  const checkIn = group.get('checkInDate')?.value;
  const checkOut = group.get('checkOutDate')?.value;
  if (!checkIn || !checkOut) return null;
  return checkOut > checkIn ? null : { checkOutBeforeCheckIn: true };
}

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  template: `
    @if (successMessage()) {
      <div class="toast toast--success">{{ successMessage() }}</div>
    }
    @if (errorMessage()) {
      <div class="toast toast--error">{{ errorMessage() }}</div>
    }

    <div class="page">
      <!-- Hero -->
      <header class="hero" [style.background-image]="heroImage()">
        <div class="hero-overlay"></div>
        <div class="hero-inner">
          <a routerLink="/hotels" class="back-link">&larr; Volver</a>
          @if (hotel(); as h) {
            <div class="hero-badges">
              <span class="badge-star">&#9733; {{ h.rating }} Estrellas</span>
              <span class="badge-price">{{ h.pricePerNight | currency:'USD':'symbol':'1.0-0' }} / noche</span>
            </div>
            <h1 class="hero-title">{{ h.name }}</h1>
            <p class="hero-location">&#128205; {{ h.city }}</p>
          }
        </div>
      </header>

      <div class="layout">
        <!-- Left Column -->
        <div class="info-col">
          <section class="card">
            <h2 class="card-title">Sobre este hotel</h2>
            @if (hotel(); as h) {
              <p class="card-text">
                Disfruta de una estadia inolvidable en {{ h.name }}.
                Ubicado en el corazon de {{ h.city }}, este hotel ofrece
                la combinacion perfecta de lujo, confort y servicio de clase mundial.
              </p>
            }
          </section>

          <section class="card">
            <h2 class="card-title">Informacion y Servicios</h2>
            @if (hotel(); as h) {
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-icon">&#128205;</span>
                  <div>
                    <span class="info-label">Direccion</span>
                    <p class="info-value">{{ h.address }}</p>
                  </div>
                </div>
                <div class="info-item">
                  <span class="info-icon">&#128222;</span>
                  <div>
                    <span class="info-label">Telefono</span>
                    <p class="info-value">{{ h.phone }}</p>
                  </div>
                </div>
              </div>
            }
            <div class="divider"></div>
            <h3 class="sub-title">Lo que ofrece este lugar</h3>
            <ul class="amenities">
              <li>&#10003; Wi-Fi de alta velocidad</li>
              <li>&#10003; Piscina climatizada</li>
              <li>&#10003; Spa &amp; Wellness</li>
              <li>&#10003; Restaurante Gourmet</li>
              <li>&#10003; Gimnasio 24/7</li>
              <li>&#10003; Servicio a la habitacion</li>
              <li>&#10003; Parking privado</li>
              <li>&#10003; Bar en la terraza</li>
            </ul>
          </section>
        </div>

        <!-- Right Column: Booking -->
        <div class="booking-col">
          <div class="booking-card">
            <h3 class="booking-title">Reserva tu estadia</h3>
            @if (hotel(); as h) {
              <p class="booking-price">{{ h.pricePerNight | currency:'USD':'symbol':'1.0-0' }} <span>/ noche</span></p>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
              <div class="form-row">
                <div class="field">
                  <label>Llegada</label>
                  <input type="date" formControlName="checkInDate" [min]="todayStr">
                </div>
                <div class="field">
                  <label>Salida</label>
                  <input type="date" formControlName="checkOutDate" [min]="todayStr">
                </div>
              </div>

              @if (form.hasError('checkOutBeforeCheckIn') && form.get('checkOutDate')?.touched) {
                <div class="field-error">La fecha de salida debe ser despues de la llegada.</div>
              }

              <div class="field">
                <label>Nombre completo</label>
                <input type="text" formControlName="guestName" placeholder="Tu nombre">
              </div>

              <div class="field">
                <label>Email</label>
                <input type="email" formControlName="guestEmail" placeholder="tu&#64;email.com">
              </div>

              <div class="field">
                <label>Habitacion</label>
                <input type="number" formControlName="roomNumber" placeholder="No. de habitacion" min="1">
              </div>

              @if (totalNights() > 0 && hotel(); as h) {
                <div class="price-summary">
                  <div class="price-row">
                    <span>{{ h.pricePerNight | currency:'USD':'symbol':'1.0-0' }} x {{ totalNights() }} noches</span>
                    <span>{{ calculatedTotal() | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                  <div class="price-total">
                    <span>Total</span>
                    <span>{{ calculatedTotal() | currency:'USD':'symbol':'1.0-0' }}</span>
                  </div>
                </div>
              }

              <button type="submit" class="btn-reserve" [disabled]="form.invalid || isSubmitting() || !hotel()">
                {{ isSubmitting() ? 'Confirmando...' : 'Reservar Ahora' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #f8f9fa; min-height: 100vh; }
    .page { padding-bottom: 60px; }

    /* Hero */
    .hero {
      height: 380px;
      position: relative;
      background-size: cover;
      background-position: center;
      background-color: #1a1a2e;
      display: flex;
      align-items: flex-end;
      color: #fff;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.75));
    }
    .hero-inner {
      position: relative;
      z-index: 2;
      max-width: 1140px;
      margin: 0 auto;
      width: 100%;
      padding: 32px 20px;
    }
    .back-link {
      position: absolute;
      top: -140px;
      left: 20px;
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      background: rgba(0,0,0,0.35);
      padding: 8px 16px;
      border-radius: 8px;
      backdrop-filter: blur(4px);
    }
    .hero-badges { display: flex; gap: 10px; margin-bottom: 12px; }
    .badge-star, .badge-price {
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 700;
    }
    .badge-star { background: #c9a84c; color: #1a1a2e; }
    .badge-price { background: rgba(255,255,255,0.95); color: #1a1a2e; }
    .hero-title { font-size: 2.5rem; font-weight: 800; margin: 0 0 6px; }
    .hero-location { font-size: 1.05rem; opacity: 0.85; margin: 0; }

    /* Layout */
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 28px;
      max-width: 1140px;
      margin: -32px auto 0;
      padding: 0 20px;
      position: relative;
      z-index: 10;
    }
    @media (min-width: 900px) { .layout { grid-template-columns: 5fr 4fr; } }

    /* Cards */
    .card {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.06);
      padding: 28px;
      margin-bottom: 24px;
    }
    .card-title {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0f0f0;
    }
    .card-text { line-height: 1.8; color: #4b5563; }
    .sub-title { font-size: 1rem; font-weight: 700; color: #1f2937; margin: 0 0 14px; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item { display: flex; gap: 10px; align-items: center; }
    .info-icon { font-size: 1.3rem; }
    .info-label { font-size: 0.75rem; text-transform: uppercase; color: #9ca3af; font-weight: 600; letter-spacing: 0.05em; }
    .info-value { margin: 2px 0 0; font-weight: 500; color: #374151; font-size: 0.95rem; }
    .divider { height: 1px; background: #f0f0f0; margin: 24px 0; }

    .amenities {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 10px;
    }
    .amenities li { color: #374151; font-size: 0.9rem; }

    /* Booking */
    .booking-card {
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.06);
      padding: 28px;
      position: sticky;
      top: 84px;
      border: 1px solid #e5e7eb;
    }
    .booking-title { font-size: 1.3rem; font-weight: 700; color: #1f2937; margin: 0 0 4px; }
    .booking-price { font-size: 1.1rem; font-weight: 800; color: #1a1a2e; margin: 0 0 20px; }
    .booking-price span { font-weight: 400; font-size: 0.85rem; color: #9ca3af; }

    .field { margin-bottom: 14px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    label { display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px; color: #374151; }
    input {
      width: 100%;
      padding: 11px 14px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      box-sizing: border-box;
      font-size: 0.95rem;
      transition: border-color 0.2s;
    }
    input:focus { border-color: #c9a84c; outline: none; box-shadow: 0 0 0 3px rgba(201,168,76,0.12); }

    .field-error {
      background: #fef2f2;
      color: #dc2626;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 14px;
    }

    .price-summary {
      background: #f8f9fa;
      padding: 14px;
      border-radius: 8px;
      margin-top: 16px;
      border: 1px solid #e5e7eb;
    }
    .price-row { display: flex; justify-content: space-between; color: #6b7280; font-size: 0.9rem; margin-bottom: 8px; }
    .price-total { display: flex; justify-content: space-between; font-weight: 800; font-size: 1.05rem; color: #1f2937; border-top: 1px solid #d1d5db; padding-top: 8px; }

    .btn-reserve {
      width: 100%;
      background: #1a1a2e;
      color: #fff;
      padding: 14px;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 18px;
      transition: background 0.2s;
    }
    .btn-reserve:hover:not(:disabled) { background: #c9a84c; color: #1a1a2e; }
    .btn-reserve:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Toasts */
    .toast {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      padding: 12px 28px;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      font-size: 0.95rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }
    .toast--success { background: #16a34a; }
    .toast--error { background: #dc2626; }
  `]
})
export class HotelDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private hotelService = inject(HotelService);
  private reservationService = inject(ReservationService);
  private fb = inject(FormBuilder);

  hotel = signal<Hotel | null>(null);
  heroImage = computed(() => {
    const h = this.hotel();
    return h ? "url('" + h.imageUrl + "')" : '';
  });
  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  totalNights = signal(0);
  calculatedTotal = signal(0);

  readonly todayStr = new Date().toISOString().split('T')[0];

  readonly form = this.fb.group({
    guestName: ['', [Validators.required, Validators.minLength(2)]],
    guestEmail: ['', [Validators.required, Validators.email]],
    checkInDate: ['', Validators.required],
    checkOutDate: ['', Validators.required],
    roomNumber: [null as number | null, [Validators.required, Validators.min(1)]]
  }, { validators: checkOutAfterCheckIn });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.errorMessage.set('ID de hotel invalido');
      return;
    }

    this.hotelService.getHotelById(id).subscribe({
      next: (hotel) => this.hotel.set(hotel),
      error: () => this.errorMessage.set('No se pudo cargar el hotel')
    });

    this.form.get('checkInDate')!.valueChanges.subscribe(() => this.recalcPrice());
    this.form.get('checkOutDate')!.valueChanges.subscribe(() => this.recalcPrice());
  }

  private recalcPrice(): void {
    const checkIn = this.form.get('checkInDate')!.value;
    const checkOut = this.form.get('checkOutDate')!.value;
    const h = this.hotel();
    if (!checkIn || !checkOut || !h) {
      this.totalNights.set(0);
      this.calculatedTotal.set(0);
      return;
    }
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
    if (days > 0) {
      this.totalNights.set(days);
      this.calculatedTotal.set(days * h.pricePerNight);
    } else {
      this.totalNights.set(0);
      this.calculatedTotal.set(0);
    }
  }

  onSubmit(): void {
    const h = this.hotel();
    if (this.form.invalid || !h) return;

    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const v = this.form.getRawValue();
    const dto: CreateReservationDto = {
      hotelId: h.id,
      guestName: v.guestName!,
      guestEmail: v.guestEmail!,
      checkInDate: v.checkInDate + 'T00:00:00Z',
      checkOutDate: v.checkOutDate + 'T00:00:00Z',
      roomNumber: v.roomNumber!,
      pricePerNight: h.pricePerNight
    };

    this.reservationService.createReservation(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Reserva confirmada con exito!');
        setTimeout(() => this.router.navigate(['/hotels']), 2500);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Error al procesar la reserva. Intenta de nuevo.');
      }
    });
  }
}

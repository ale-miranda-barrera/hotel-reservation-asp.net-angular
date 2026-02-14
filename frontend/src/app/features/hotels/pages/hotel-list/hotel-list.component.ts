import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../../core/services/hotel.service';
import { Hotel } from '../../../../shared/models/hotel.model';

@Component({
  selector: 'app-hotel-list',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    <div class="page">
      <section class="hero">
        <div class="hero-inner">
          <h1 class="hero-title">Hoteles San Bernardo</h1>
          <p class="hero-subtitle">Encuentra el alojamiento perfecto para tu proxima estadia</p>
          <div class="search-wrapper">
            <span class="search-icon">&#128269;</span>
            <input
              #searchInput
              type="text"
              placeholder="Buscar por nombre o ciudad..."
              (input)="searchQuery.set(searchInput.value)"
              class="search-input"
            >
          </div>
        </div>
      </section>

      <section class="content">
        @if (filteredHotels().length === 0 && allHotels().length > 0) {
          <p class="no-results">No se encontraron hoteles para esa busqueda.</p>
        }

        <div class="grid">
          @for (hotel of filteredHotels(); track hotel.id) {
            <a [routerLink]="['/hotels', hotel.id]" class="card">
              <div class="card-img" [style.background-image]="'url(' + hotel.imageUrl + ')'">
                <span class="card-badge">{{ hotel.rating }} &#9733;</span>
              </div>
              <div class="card-body">
                <h3 class="card-name">{{ hotel.name }}</h3>
                <p class="card-city">&#128205; {{ hotel.city }}</p>
                <div class="card-divider"></div>
                <div class="card-footer">
                  <span class="card-price">{{ hotel.pricePerNight | currency:'USD':'symbol':'1.0-0' }}</span>
                  <span class="card-night">/ noche</span>
                </div>
              </div>
            </a>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #f8f9fa; }

    .hero {
      background: #1a1a2e;
      padding: 56px 20px 72px;
      text-align: center;
      color: #fff;
    }
    .hero-inner { max-width: 640px; margin: 0 auto; }
    .hero-title {
      font-family: 'Georgia', serif;
      font-size: 2.4rem;
      font-weight: 700;
      margin: 0 0 8px;
      letter-spacing: -0.5px;
      color: #c9a84c;
    }
    .hero-subtitle {
      font-size: 1.05rem;
      font-weight: 400;
      opacity: 0.8;
      margin: 0 0 32px;
    }

    .search-wrapper {
      position: relative;
      max-width: 520px;
      margin: 0 auto;
    }
    .search-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.1rem;
      opacity: 0.5;
    }
    .search-input {
      width: 100%;
      padding: 16px 20px 16px 50px;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      background: #fff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      outline: none;
    }
    .search-input:focus {
      box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 0 3px rgba(201,168,76,0.3);
    }

    .content {
      max-width: 1140px;
      margin: -36px auto 40px;
      padding: 0 20px;
      position: relative;
      z-index: 10;
    }

    .no-results {
      text-align: center;
      color: #6b7280;
      padding: 40px 0;
      font-size: 1rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .card {
      display: flex;
      flex-direction: column;
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.06);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      text-decoration: none;
      color: inherit;
    }
    .card:hover {
      transform: translateY(-6px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.1);
    }

    .card-img {
      height: 200px;
      background-size: cover;
      background-position: center;
      background-color: #e5e7eb;
      position: relative;
    }
    .card-badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: #fff;
      color: #1a1a2e;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    }

    .card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .card-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 6px;
    }
    .card-city {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0;
    }
    .card-divider {
      height: 1px;
      background: #f0f0f0;
      margin: 16px 0;
    }
    .card-footer { margin-top: auto; display: flex; align-items: baseline; gap: 4px; }
    .card-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1a1a2e;
    }
    .card-night {
      font-size: 0.85rem;
      color: #9ca3af;
      font-weight: 400;
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 1.8rem; }
      .content { margin-top: -24px; }
    }
  `]
})
export class HotelListComponent implements OnInit {
  private hotelService = inject(HotelService);

  allHotels = signal<Hotel[]>([]);
  searchQuery = signal('');

  filteredHotels = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const hotels = this.allHotels();
    if (!q) return hotels;
    return hotels.filter(h =>
      h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.hotelService.getHotels().subscribe({
      next: (hotels) => this.allHotels.set(hotels),
      error: (err) => console.error('Failed to load hotels', err)
    });
  }
}

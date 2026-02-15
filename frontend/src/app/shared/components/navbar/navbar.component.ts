import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-container">

        <!-- Brand / Logo -->
        <a class="navbar-brand" routerLink="/hotels">
          <span class="brand-name">Hoteles San Bernardo</span>
        </a>

        <!-- Navigation links -->
        <ul class="navbar-links">
          <li>
            <a
              routerLink="/hotels"
              routerLinkActive="active"
              class="nav-link"
            >
              Hoteles
            </a>
          </li>

          @if (isAdmin$ | async) {
            <li>
              <a
                routerLink="/admin/stats"
                routerLinkActive="active"
                class="nav-link"
              >
                Estadísticas
              </a>
            </li>
          }
        </ul>

        <!-- Admin toggle -->
        <div class="navbar-actions">
          @if (isAdmin$ | async) {
            <span class="admin-badge">Admin</span>
          }
          <button
            class="toggle-btn"
            [class.toggle-btn--admin]="isAdmin$ | async"
            (click)="toggleAdmin()"
            type="button"
          >
            {{ (isAdmin$ | async) ? 'Modo Usuario' : 'Modo Admin' }}
          </button>
        </div>

      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background-color: #1a1a2e;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
      height: 64px;
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      height: 100%;
    }


    .navbar-brand {
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-name {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #c9a84c;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }


    .navbar-links {
      display: flex;
      align-items: center;
      gap: 8px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-link {
      display: inline-block;
      padding: 8px 16px;
      color: #c0c0d0;
      text-decoration: none;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.3px;
      border-radius: 4px;
      transition: color 0.2s ease, background-color 0.2s ease;
    }

    .nav-link:hover {
      color: #ffffff;
      background-color: rgba(201, 168, 76, 0.12);
    }

    .nav-link.active {
      color: #c9a84c;
      background-color: rgba(201, 168, 76, 0.15);
    }

  
    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .admin-badge {
      display: inline-block;
      padding: 3px 10px;
      background-color: rgba(201, 168, 76, 0.2);
      color: #c9a84c;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-radius: 12px;
      border: 1px solid rgba(201, 168, 76, 0.4);
    }

    /* Toggle button — base state (user mode) */
    .toggle-btn {
      padding: 8px 18px;
      border: 1px solid rgba(192, 192, 208, 0.35);
      border-radius: 6px;
      background-color: transparent;
      color: #c0c0d0;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      transition:
        color 0.25s ease,
        border-color 0.25s ease,
        background-color 0.25s ease,
        box-shadow 0.25s ease;
      white-space: nowrap;
    }

    .toggle-btn:hover {
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.5);
      background-color: rgba(255, 255, 255, 0.06);
    }

    /* Toggle button — admin mode active */
    .toggle-btn--admin {
      color: #c9a84c;
      border-color: rgba(201, 168, 76, 0.6);
      background-color: rgba(201, 168, 76, 0.08);
    }

    .toggle-btn--admin:hover {
      color: #d4a853;
      border-color: #c9a84c;
      background-color: rgba(201, 168, 76, 0.15);
      box-shadow: 0 0 8px rgba(201, 168, 76, 0.2);
    }
  `]
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  readonly isAdmin$ = this.authService.isAdmin$;
  toggleAdmin(): void {
    this.authService.toggleAdminMode();
  }
}

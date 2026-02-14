// src/app/app.routes.ts
//
// Route configuration — all routes are lazily loaded (loadComponent).
//
// Architecture decisions:
//  - Lazy loading: each loadComponent() creates a separate JS chunk.
//    Angular only downloads the component code when the user navigates there,
//    keeping the initial bundle small.
//    React analogy: React.lazy() + Suspense.
//
//  - MainLayoutComponent wraps all routes as a parent.
//    Its <router-outlet /> renders the active child route.
//    This means Navbar is always visible on every page without repeating it
//    in each feature component.
//
//  - The admin route uses a functional guard via dynamic import.
//    This avoids eagerly loading the guard file — it is only evaluated
//    when the router tries to activate /admin/*.
//    The pattern `() => import(...).then(m => m.authGuard)` is the
//    Angular 17+ recommended way for lazy guards.
//
//  - pathMatch: 'full' on the '' redirect is required because '' matches
//    every path as a prefix without it.

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // Shell layout — renders Navbar + <router-outlet> for children
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      // Default redirect: / → /hotels
      {
        path: '',
        redirectTo: 'hotels',
        pathMatch: 'full'
      },

      // --- Public hotel routes ---
      {
        path: 'hotels',
        children: [
          {
            path: '',
            // Smart page: fetches hotel list, passes to dumb HotelCardList
            loadComponent: () =>
              import(
                './features/hotels/pages/hotel-list/hotel-list.component'
              ).then((m) => m.HotelListComponent)
          },
          {
            path: ':id',
            // Smart page: fetches single hotel by route param, shows reservation form
            loadComponent: () =>
              import(
                './features/hotels/pages/hotel-detail/hotel-detail.component'
              ).then((m) => m.HotelDetailComponent)
          }
        ]
      },

      // --- Protected admin routes ---
      {
        path: 'admin',
        // Guard is also lazy-loaded — only evaluated on navigation attempt
        canActivate: [
          () =>
            import('./core/guards/auth.guard').then((m) => m.authGuard)
        ],
        children: [
          {
            path: 'stats',
            // Admin-only stats page: all reservations across all hotels
            loadComponent: () =>
              import(
                './features/admin/pages/reservation-stats/reservation-stats.component'
              ).then((m) => m.ReservationStatsComponent)
          }
        ]
      }
    ]
  }
];

// src/app/core/services/auth.service.ts
//
// Lightweight admin-mode toggle using BehaviorSubject.
// React analogy: BehaviorSubject = useState + Context combined.
//   - isAdmin$ (Observable) = the reactive value you subscribe to in templates
//   - isAdmin() (method) = a synchronous snapshot read, used inside guards
//     where we don't need a stream — just a boolean at the moment of navigation.
//
// This is intentionally simple: there is no real authentication in this
// project. A single "toggle admin" action unlocks admin routes.
// If real auth is added later, only this service changes — the guard and
// components remain untouched (Open/Closed principle).

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isAdminSubject = new BehaviorSubject<boolean>(false);

  // Public observable — components subscribe via | async pipe.
  // Using asObservable() prevents external code from calling .next() directly,
  // enforcing encapsulation.
  readonly isAdmin$ = this.isAdminSubject.asObservable();

  // Synchronous read — used by guards that need an immediate boolean
  isAdmin(): boolean {
    return this.isAdminSubject.value;
  }

  // Flip admin mode on/off — exposed to a toggle button in the navbar
  toggleAdminMode(): void {
    this.isAdminSubject.next(!this.isAdminSubject.value);
  }
}

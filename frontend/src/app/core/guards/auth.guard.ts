// src/app/core/guards/auth.guard.ts
//
// Functional guard (CanActivateFn) — the Angular 15+ / 18 preferred pattern.
// React analogy: this is like a <PrivateRoute> wrapper that redirects to /hotels
// when the user is not in admin mode.
//
// Using inject() here instead of constructor injection because functional
// guards are plain functions, not classes. inject() works in any injection
// context (guard, factory, constructor).
//
// Architecture decision: the guard only reads state from AuthService.
// It never modifies state. That keeps it pure and easily testable —
// you can test it by simply controlling what AuthService.isAdmin() returns.

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Not in admin mode — redirect to the public hotel list
  router.navigate(['/hotels']);
  return false;
};

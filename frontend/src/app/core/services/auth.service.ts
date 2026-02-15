// This is intentionally simple: there is no real authentication in this

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isAdminSubject = new BehaviorSubject<boolean>(false);

  readonly isAdmin$ = this.isAdminSubject.asObservable();

  isAdmin(): boolean {
    return this.isAdminSubject.value;
  }

  toggleAdminMode(): void {
    this.isAdminSubject.next(!this.isAdminSubject.value);
  }
}

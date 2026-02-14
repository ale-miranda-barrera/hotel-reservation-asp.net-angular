// src/app/layout/main-layout/main-layout.component.ts
//
// MainLayoutComponent — structural shell that wraps every page in the app.
//
// Architecture decisions:
//  - Single Responsibility: this component's ONLY job is page structure.
//    It knows nothing about business data, services, or feature logic.
//  - It acts as the parent route component in app.routes.ts, rendering
//    child routes via <router-outlet />.
//  - NavbarComponent is composed here — it is always visible on every page.
//  - The padding-top on .main-content compensates for the fixed navbar
//    (64px height defined in NavbarComponent) so page content is not hidden.
//
// React analogy: this is equivalent to a React Layout component that wraps
// all pages with a shared header, like:
//   <Navbar />
//   <main>{children}</main>

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    /* Push page content below the fixed navbar (64px tall) */
    .main-content {
      padding-top: 64px;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f7;
    }
  `]
})
export class MainLayoutComponent {}

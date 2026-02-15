// Layout component that wraps
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
    .main-content {
      padding-top: 64px;
      min-height: calc(100vh - 64px);
      background-color: #f5f5f7;
    }
  `]
})
export class MainLayoutComponent { }

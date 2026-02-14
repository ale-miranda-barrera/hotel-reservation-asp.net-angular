// src/app/app.ts
//
// Root component — minimal bootstrap entry point.
// Its only job is to render the <router-outlet /> which the Angular router
// uses to mount the appropriate route component tree.
//
// All layout (Navbar, main wrapper) is handled by MainLayoutComponent,
// which is the parent route for all application routes.
// This keeps the root component clean and free of any business logic.
//
// React analogy: this is equivalent to the root <App> component that
// just renders <BrowserRouter><Routes>...</Routes></BrowserRouter>.

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html'
})
export class App {}

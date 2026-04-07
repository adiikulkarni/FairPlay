import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-logout-page',
  imports: [CommonModule, MatCardModule],
  template: `
    <section class="auth-shell">
      <mat-card appearance="outlined" class="auth-card">
        <mat-card-header>
          <mat-card-title>Signing out</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Your session has been cleared.</p>
        </mat-card-content>
      </mat-card>
    </section>
  `
})
export class LogoutPageComponent {
  private readonly store = inject(FairplayStore);
  private readonly router = inject(Router);

  constructor() {
    this.store.logout();
    void this.router.navigateByUrl('/login');
  }
}

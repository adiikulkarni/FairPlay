import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FairplayStore } from './services/fairplay-store.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly store = inject(FairplayStore);

  protected readonly currentUser = this.store.currentUser;
  protected readonly bootstrapError = this.store.bootstrapError;
  protected readonly navItems = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return [
        { label: 'Explore', path: '/', exact: true },
        { label: 'Host', path: '/register', exact: false },
        { label: 'Activity', path: '/login', exact: false }
      ];
    }

    return [
      { label: 'Explore', path: '/', exact: true },
      ...(user.role === 'OWNER'
        ? [{ label: 'Host', path: '/owner', exact: false }]
        : [{ label: 'Host', path: '/venues', exact: false }]),
      { label: 'Activity', path: '/activities', exact: false },
      { label: 'Bookings', path: '/venues', exact: false }
    ];
  });

  protected readonly sessionLabel = computed(() => {
    const user = this.currentUser();
    return user ? `${user.name} (${user.role})` : 'Guest';
  });
}

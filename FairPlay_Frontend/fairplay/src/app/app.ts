import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
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
    MatBadgeModule,
    MatButtonModule,
    MatChipsModule,
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
        { label: 'Home', path: '/', exact: true, icon: 'home' },
        { label: 'Login', path: '/login', exact: false, icon: 'login' },
        { label: 'Register', path: '/register', exact: false, icon: 'person_add' }
      ];
    }

    if (user.role === 'OWNER') {
      return [
        { label: 'Home', path: '/', exact: true, icon: 'home' },
        { label: 'Bookings', path: '/bookings', exact: false, icon: 'event' },
        { label: 'Owner Hub', path: '/owner', exact: false, icon: 'dashboard_customize' },
        { label: 'Profile', path: '/profile', exact: false, icon: 'manage_accounts' }
      ];
    }

    return [
      { label: 'Home', path: '/', exact: true, icon: 'home' },
      { label: 'Bookings', path: '/bookings', exact: false, icon: 'event' },
      { label: 'Venues', path: '/venues', exact: false, icon: 'stadium' },
      { label: 'Activities', path: '/activities', exact: false, icon: 'groups' },
      { label: 'Profile', path: '/profile', exact: false, icon: 'person' }
    ];
  });

  protected readonly sessionLabel = computed(() => {
    const user = this.currentUser();
    return user ? `${user.name} (${user.role})` : 'Guest';
  });

  protected readonly roleLabel = computed(() => (this.currentUser()?.role === 'OWNER' ? 'Owner' : 'Player'));
}

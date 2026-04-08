import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { sportPlaceholder } from '../placeholder-images';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    DecimalPipe,
  ],
  template: `
    <section class="page-grid">
      <section class="hero-copy-grid">
        <div class="hero-panel page-grid dashboard-hero-panel">
          <div class="headline">
            <div>
              <span class="inline-label">{{
                currentUser() ? roleTitle() : 'FairPlay platform'
              }}</span>
              <h1>{{ heroTitle() }}</h1>
              <p>{{ heroText() }}</p>
            </div>
          </div>

          <div class="actions">
            <a mat-flat-button color="primary" [routerLink]="primaryAction().link">{{
              primaryAction().label
            }}</a>
            <a mat-stroked-button [routerLink]="secondaryAction().link">{{
              secondaryAction().label
            }}</a>
          </div>

        </div>

        <div class="media-banner">
          <img [src]="heroImage()" alt="FairPlay hero banner" />
          <div class="media-banner-copy muted-grid">
            <mat-chip-set>
              <mat-chip>{{ currentUser()?.role ?? 'Guest' }}</mat-chip>
            </mat-chip-set>
            <strong>{{ heroHighlightTitle() }}</strong>
            <p>{{ heroHighlightText() }}</p>
          </div>
        </div>
      </section>

      <section class="metrics-grid">
        @for (item of stats(); track item.label) {
          <mat-card class="dashboard-stat muted-grid">
            <div class="info-row">
              <div class="stat-label">{{ item.label }}</div>
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <div class="stat-value">{{ item.value }}</div>
            <p>{{ item.caption }}</p>
          </mat-card>
        }
      </section>

      <section class="role-panels">
        <mat-card class="role-card muted-grid">
          <span class="inline-label">Player space</span>
          <h2>Bookings and activities stay focused for users.</h2>
          <p>
            Venue discovery, joining games, and personal bookings now live in a distinct player
            flow.
          </p>
          <div class="actions">
            <a mat-button routerLink="/venues">Browse venues</a>
            <a mat-button routerLink="/activities">Community games</a>
          </div>
        </mat-card>

        <mat-card class="role-card muted-grid">
          <span class="inline-label">Owner space</span>
          <h2>Owner tools stay separate from player actions.</h2>
          <p>
            Venue publishing, revenue metrics, and dashboard actions remain contained in the owner
            workspace.
          </p>
          <div class="actions">
            <a mat-button routerLink="/owner">Owner dashboard</a>
            <a mat-button routerLink="/profile">Account settings</a>
          </div>
        </mat-card>
      </section>

      <section class="section-card">
        <div class="section-header">
          <div class="muted-grid">
            <h2>Featured venues</h2>
            <p>Venue cards pull live pricing and sport labels from the backend.</p>
          </div>
        </div>

        <div class="tile-grid">
          @for (venue of featuredVenues(); track venue.id) {
            <mat-card class="venue-card">
              <div class="card-media">
                <img [src]="venueImage(venue.sportType)" [alt]="venue.name" />
              </div>
              <div class="card-body muted-grid">
                <strong>{{ venue.name }}</strong>
                <p>{{ venue.location }}</p>
                <div class="actions">
                  <mat-chip-set>
                    <mat-chip>{{ venue.sportType }}</mat-chip>
                    <mat-chip>Rs {{ venue.pricePerHour | number: '1.0-0' }}/hr</mat-chip>
                  </mat-chip-set>
                </div>
                <a mat-flat-button color="primary" routerLink="/venues">Open venue</a>
              </div>
            </mat-card>
          } @empty {
            <div class="empty-state">
              <p>No venues have loaded yet. Start the backend and refresh to see live cards.</p>
            </div>
          }
        </div>
      </section>

      <section class="quick-links-grid">
        @for (item of quickLinks(); track item.title) {
          <mat-card class="quick-link-card muted-grid">
            <div class="info-row">
              <strong>{{ item.title }}</strong>
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <p>{{ item.copy }}</p>
            <a mat-button [routerLink]="item.link">{{ item.action }}</a>
          </mat-card>
        }
      </section>
    </section>
  `,
})
export class DashboardPageComponent {
  private readonly store = inject(FairplayStore);

  protected readonly currentUser = this.store.currentUser;

  protected readonly stats = computed(() => {
    const user = this.currentUser();
    const base = [
      {
        label: 'Live Venues',
        value: String(this.store.venues().length),
        icon: 'stadium',
        caption: 'Connected to venue inventory',
      },
      {
        label: 'Open Activities',
        value: String(this.store.activities().length),
        icon: 'groups',
        caption: 'Community matches available',
      },
      {
        label: user?.role === 'OWNER' ? 'Managed Bookings' : 'Your Bookings',
        value: String(this.store.bookings().length),
        icon: 'confirmation_number',
        caption:
          user?.role === 'OWNER' ? 'Owner dashboard reservations' : 'Personal booking history',
      },
    ];

    if (user?.role === 'OWNER') {
      base.push({
        label: 'Revenue',
        value: `Rs ${this.store.ownerDashboard()?.totalEarnings ?? 0}`,
        icon: 'payments',
        caption: 'Live dashboard earnings',
      });
    } else {
      base.push({
        label: 'Role',
        value: user ? 'Player' : 'Guest',
        icon: 'badge',
        caption: user ? 'User workspace enabled' : 'Login to unlock actions',
      });
    }

    return base;
  });

  protected readonly featuredVenues = computed(() => this.store.venues().slice(0, 3));

  protected readonly quickLinks = computed(() => {
    const user = this.currentUser();
    if (user?.role === 'OWNER') {
      return [
        {
          title: 'Publish venues',
          copy: 'Add new courts and spaces from the owner dashboard.',
          icon: 'add_business',
          link: '/owner',
          action: 'Manage venues',
        },
        {
          title: 'Monitor revenue',
          copy: 'Track booking performance without mixing it into user flows.',
          icon: 'monitoring',
          link: '/owner',
          action: 'View metrics',
        },
        {
          title: 'Update account',
          copy: 'Keep owner contact details current.',
          icon: 'manage_accounts',
          link: '/profile',
          action: 'Edit profile',
        },
      ];
    }

    return [
      {
        title: 'Find venues',
        copy: 'Search by location and sport before booking.',
        icon: 'travel_explore',
        link: '/venues',
        action: 'Explore venues',
      },
      {
        title: 'Join activities',
        copy: 'Browse player-hosted games and join quickly.',
        icon: 'sports',
        link: '/activities',
        action: 'Browse activities',
      },
      {
        title: 'Create account',
        copy: 'Register as a player or owner with separate role paths.',
        icon: 'person_add',
        link: user ? '/profile' : '/register',
        action: user ? 'View profile' : 'Register now',
      },
    ];
  });

  protected readonly primaryAction = computed(() =>
    this.currentUser()?.role === 'OWNER'
      ? { label: 'Open owner dashboard', link: '/owner' }
      : {
          label: this.currentUser() ? 'Browse venues' : 'Create account',
          link: this.currentUser() ? '/venues' : '/register',
        },
  );

  protected readonly secondaryAction = computed(() =>
    this.currentUser()?.role === 'OWNER'
      ? { label: 'Review profile', link: '/profile' }
      : {
          label: this.currentUser() ? 'Browse activities' : 'Login',
          link: this.currentUser() ? '/activities' : '/login',
        },
  );

  protected readonly roleTitle = computed(() =>
    this.currentUser()?.role === 'OWNER' ? 'Owner workspace' : 'Player workspace',
  );

  protected readonly heroTitle = computed(() => {
    if (this.currentUser()?.role === 'OWNER') {
      return 'Manage your venues with a cleaner owner dashboard.';
    }
    if (this.currentUser()) {
      return 'Play More. Wait Less.';
    }
    return 'Discover sports spaces, activities, and separate role journeys backed by live services.';
  });

  protected readonly heroText = computed(() => {
    if (this.currentUser()?.role === 'OWNER') {
      return '';
    }
    if (this.currentUser()) {
      return '';
    }
    return 'Browse venues and activities coming from the live services. Host or book to populate your account.';
  });

  protected readonly heroHighlightTitle = computed(() =>
    this.currentUser()?.role === 'OWNER' ? 'Owner tools' : 'Player discovery',
  );

  protected readonly heroHighlightText = computed(() =>
    this.currentUser()?.role === 'OWNER'
      ? 'Venue operations and revenue cards stay grouped in the owner space.'
      : 'Venue discovery, community games, and profile management use a cleaner Material layout.',
  );

  protected readonly heroImage = computed(() => '/sports-tools.jpg');

  protected venueImage(_: string): string {
    return '/venue-placeholder.jpeg';
  }
}

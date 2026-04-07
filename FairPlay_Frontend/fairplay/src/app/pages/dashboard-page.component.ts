import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, DecimalPipe],
  template: `
    <section class="page-grid">
      <section class="split-layout">
        <div class="headline">
          <div>
            <span class="inline-label">Premium sports booking</span>
            <h1>Play More.<br /><br/>Wait Less.</h1>
            <p>
              Browse venues, join upcoming activities, and manage your bookings with the live FairPlay gateway flows.
            </p>
          </div>
          <div class="actions">
            <a mat-flat-button color="primary" routerLink="/venues">
              {{ currentUser() ? 'Book now' : 'Explore venues' }}
            </a>
            <a mat-button routerLink="/activities">
              {{ currentUser() ? 'Browse activities' : 'See activities' }}
            </a>
          </div>
        </div>

        <div class="hero-panel">
          <div class="surface-note">
            {{ currentUser()
              ? 'Signed in and ready to play.'
              : 'Login to unlock bookings, profile updates, and owner tools.' }}
          </div>
        </div>
      </section>

      <section class="media-grid">
        <div class="hero-media">
          <img [src]="heroImage" alt="Indoor badminton court" />
        </div>

        @for (sport of sportTiles; track sport.name) {
          <div>
            <img [src]="sport.image" [alt]="sport.name" />
            <div class="media-label">
              <strong>{{ sport.name }}</strong>
              <p>{{ sport.subtitle }}</p>
            </div>
          </div>
        }
      </section>

      <section class="stats-grid app-stats">
        @for (item of stats(); track item.label) {
          <mat-card>
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </mat-card>
        }
      </section>

      <section class="headline">
        <div>
          <h2>Featured Venues</h2>
          <p>Top live venues pulled from your backend inventory.</p>
        </div>
      </section>

      <section class="feature-grid">
        @for (venue of featuredVenues(); track venue.id) {
          <mat-card class="venue-card">
            <div class="card-media">
              <img [src]="venueImage(venue.sportType)" [alt]="venue.name" />
            </div>
            <div class="card-body muted-grid">
              <strong>{{ venue.name }}</strong>
              <p>{{ venue.location }}</p>
              <div class="actions">
                <span class="pill-chip active">{{ venue.sportType }}</span>
                <span class="pill-chip">
                  Rs {{ venue.pricePerHour | number: '1.0-0' }}/hr
                </span>
              </div>
              <a mat-button routerLink="/venues">Book now</a>
            </div>
          </mat-card>
        }
      </section>

      <section class="feature-grid">
        <mat-card class="feature-card muted-grid">
          <strong>Discover</strong>
          <p>Search venues based on location and schedule.</p>
        </mat-card>

        <mat-card class="feature-card muted-grid">
          <strong>Join</strong>
          <p>Find and join community sports activities.</p>
        </mat-card>

        <mat-card class="feature-card muted-grid">
          <strong>Book</strong>
          <p>Reserve venue slots instantly.</p>
        </mat-card>
      </section>
    </section>
  `
})
export class DashboardPageComponent {
  private readonly store = inject(FairplayStore);

  protected readonly currentUser = this.store.currentUser;

  protected readonly stats = computed((): { label: string; value: string }[] => {
    const baseStats = [
      { label: 'Venues', value: String(this.store.venues().length) },
      { label: 'Activities', value: String(this.store.activities().length) },
      { label: 'Bookings', value: String(this.store.bookings().length) }
    ];

    if (this.currentUser()?.role === 'OWNER') {
      baseStats.push({
        label: 'Owner revenue',
        value: this.store.ownerDashboard()
          ? `Rs ${this.store.ownerDashboard()!.totalEarnings}`
          : 'Rs 0'
      });
    }

    return baseStats;
  });

  protected readonly featuredVenues = computed(() =>
    this.store.venues().slice(0, 3)
  );

  protected readonly heroImage =
    'https://placehold.co/1200x600?text=Sports+Venue';

  protected readonly sportTiles = [
    {
      name: 'Football',
      subtitle: 'Turf and open grounds',
      image: 'https://placehold.co/300x200?text=Football'
    },
    {
      name: 'Cricket',
      subtitle: 'Practice nets and fields',
      image: 'https://placehold.co/300x200?text=Cricket'
    },
    {
      name: 'Swimming',
      subtitle: 'Aquatic venues',
      image: 'https://placehold.co/300x200?text=Swimming'
    },
    {
      name: 'Basketball',
      subtitle: 'Indoor courts',
      image: 'https://placehold.co/300x200?text=Basketball'
    }
  ];

  protected venueImage(sportType: string): string {
    const sport = sportType.toLowerCase();

    if (sport.includes('badminton') || sport.includes('tennis')) {
      return 'https://placehold.co/600x400?text=Badminton';
    }
    if (sport.includes('football')) {
      return 'https://placehold.co/600x400?text=Football';
    }
    if (sport.includes('cricket')) {
      return 'https://placehold.co/600x400?text=Cricket';
    }
    if (sport.includes('swim')) {
      return 'https://placehold.co/600x400?text=Swimming';
    }

    return 'https://placehold.co/600x400?text=Venue';
  }
}

import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { placeholderImage, sportPlaceholder } from '../placeholder-images';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-venues-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DecimalPipe,
    DatePipe
  ],
  template: `
    <section class="page-grid">
      <section class="hero-copy-grid">
        <div class="section-card page-grid">
          <div class="headline">
            <div>
              <span class="inline-label">Player booking zone</span>
              <h1>{{ selectedVenueName() }}</h1>
              <p>{{ selectedVenueLocation() }}</p>
            </div>
          </div>

          <form [formGroup]="filterForm" (ngSubmit)="search()" class="form-grid-two">
            <mat-form-field appearance="outline">
              <mat-label>Location</mat-label>
              <input matInput formControlName="location" placeholder="City or area" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Sport type</mat-label>
              <input matInput formControlName="sportType" placeholder="Badminton, football..." />
            </mat-form-field>
            <div class="wide-form-actions">
              <button mat-flat-button color="primary" type="submit">Search venues</button>
              <button mat-stroked-button type="button" (click)="resetFilters()">Clear filters</button>
            </div>
          </form>

          <div class="cta-grid">
            @for (item of highlights; track item.title) {
              <mat-card class="cta-card muted-grid">
                <div class="info-row">
                  <strong>{{ item.title }}</strong>
                  <mat-icon>{{ item.icon }}</mat-icon>
                </div>
                <p>{{ item.caption }}</p>
              </mat-card>
            }
          </div>
        </div>

        <div class="media-banner">
          <img [src]="selectedVenueImage()" [alt]="selectedVenueName()" />
          <div class="media-banner-copy muted-grid">
            <mat-chip-set>
              <mat-chip>{{ selectedVenueSport() }}</mat-chip>
              <mat-chip>Rs {{ selectedVenuePrice() | number: '1.0-0' }}/hr</mat-chip>
            </mat-chip-set>
            <strong>{{ selectedVenueName() }}</strong>
            <p>{{ selectedVenue() ? 'Placeholder venue image ready to replace later.' : 'Live venue details will appear here once loaded.' }}</p>
          </div>
        </div>
      </section>

      <section class="split-layout">
        <div class="page-grid">
          <section class="section-card">
            <div class="section-header">
              <div class="muted-grid">
                <h2>Available venues</h2>
                <p>Each venue card now uses a dummy image until you replace it with real photography.</p>
              </div>
              <mat-chip-set>
                <mat-chip>{{ venues().length }} venues</mat-chip>
              </mat-chip-set>
            </div>

            <div class="centered" *ngIf="loadingVenues()">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <div class="tile-grid" *ngIf="!loadingVenues()">
              @for (venue of venues(); track venue.id) {
                <mat-card class="venue-card">
                  <div class="card-media">
                    <img [src]="venueImage(venue.sportType)" [alt]="venue.name" />
                  </div>
                  <div class="card-body muted-grid">
                    <div class="info-row">
                      <strong>{{ venue.name }}</strong>
                      <mat-chip-set>
                        <mat-chip>{{ venue.sportType }}</mat-chip>
                      </mat-chip-set>
                    </div>
                    <p>{{ venue.location }}</p>
                    <p>Rs {{ venue.pricePerHour | number: '1.0-0' }}/hour</p>
                    <div class="actions">
                      <button mat-stroked-button type="button" (click)="selectVenue(venue.id)">Select</button>
                    </div>
                  </div>
                </mat-card>
              } @empty {
                <div class="empty-state">
                  <p>No venues found for the current filters.</p>
                </div>
              }
            </div>
          </section>

          <section class="section-card">
            <div class="section-header">
              <div class="muted-grid">
                <h2>Your bookings</h2>
                <p>Player bookings are kept separate from owner management.</p>
              </div>
            </div>

            <div class="table-list">
              @for (booking of bookings(); track booking.id) {
                <div class="table-row">
                  <div class="muted-grid">
                    <strong>{{ venueNameFor(booking.venueId) }}</strong>
                    <p>{{ booking.slotTime | date: 'medium' }}</p>
                  </div>
                  <div class="muted-grid">
                    <mat-chip-set>
                      <mat-chip class="status-chip">{{ booking.status }}</mat-chip>
                    </mat-chip-set>
                    <p>Rs {{ booking.totalPrice | number: '1.0-0' }}</p>
                  </div>
                  <div class="actions">
                    <button mat-button type="button" (click)="cancelBooking(booking.id)" *ngIf="booking.status === 'BOOKED'">
                      Cancel
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <p>No bookings yet. Pick a venue and create your first slot.</p>
                </div>
              }
            </div>
          </section>
        </div>

        <aside class="booking-sidebar">
          <div class="muted-grid">
            <span class="inline-label">Quick booking</span>
            <h2>{{ selectedVenueName('No venue selected') }}</h2>
            <p>Price: Rs {{ selectedVenuePrice() | number: '1.0-0' }}/hour</p>
          </div>

          <form [formGroup]="bookingForm" (ngSubmit)="createBooking()" class="page-grid">
            <mat-form-field appearance="outline">
              <mat-label>Select date and time</mat-label>
              <input matInput type="datetime-local" formControlName="slotTime" />
            </mat-form-field>

            <div class="muted-grid">
              <strong>Duration</strong>
              <mat-chip-set>
                @for (hours of durationChoices; track hours) {
                  <mat-chip-option
                    [selected]="bookingForm.controls.durationHours.getRawValue() === hours"
                    (click)="bookingForm.patchValue({ durationHours: hours })"
                  >
                    {{ hours }} hr
                  </mat-chip-option>
                }
              </mat-chip-set>
            </div>

            <p class="form-error" *ngIf="message()">{{ message() }}</p>
            <button mat-flat-button color="primary" type="submit">Book selected venue</button>
          </form>
        </aside>
      </section>
    </section>
  `
})
export class VenuesPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FairplayStore);

  protected readonly venues = this.store.venues;
  protected readonly bookings = this.store.bookings;
  protected readonly loadingVenues = this.store.loadingVenues;
  protected readonly message = signal('');
  protected readonly selectedVenueId = signal<number | null>(null);
  protected readonly durationChoices = [1, 2, 3];
  protected readonly highlights = [
    { title: 'Search quickly', caption: 'Filter venues by location and sport type.', icon: 'search' },
    { title: 'Book faster', caption: 'Create bookings from the selected venue card.', icon: 'bolt' },
    { title: 'Swap images later', caption: 'All cards use placeholder images for now.', icon: 'image' },
    { title: 'Player-only flow', caption: 'This page is designed for user bookings, not owner management.', icon: 'person' }
  ];

  protected readonly filterForm = this.fb.nonNullable.group({
    location: [''],
    sportType: ['']
  });

  protected readonly bookingForm = this.fb.nonNullable.group({
    venueId: [0, [Validators.required, Validators.min(1)]],
    slotTime: ['', Validators.required],
    durationHours: [1, [Validators.required, Validators.min(1), Validators.max(12)]]
  });

  protected readonly selectedVenue = computed(() => {
    const selectedId = this.selectedVenueId();
    return this.venues().find((venue) => venue.id === selectedId) ?? this.venues()[0] ?? null;
  });

  constructor() {
    const user = this.store.currentUser();
    this.selectedVenueId.set(this.venues()[0]?.id ?? null);
    this.syncSelectedVenue();
    if (user) {
      void this.store.loadBookings(user.id).catch(() => undefined);
    }
  }

  protected async search(): Promise<void> {
    try {
      await this.store.loadVenues(this.filterForm.getRawValue());
      this.selectedVenueId.set(this.venues()[0]?.id ?? null);
      this.syncSelectedVenue();
      this.message.set('');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Search failed.');
    }
  }

  protected async resetFilters(): Promise<void> {
    this.filterForm.reset({ location: '', sportType: '' });
    try {
      await this.store.loadVenues();
      this.selectedVenueId.set(this.venues()[0]?.id ?? null);
      this.syncSelectedVenue();
      this.message.set('');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Reset failed.');
    }
  }

  protected selectVenue(venueId: number): void {
    this.selectedVenueId.set(venueId);
    this.syncSelectedVenue();
  }

  protected async createBooking(): Promise<void> {
    this.syncSelectedVenue();
    if (this.bookingForm.invalid) {
      this.message.set('Choose venue, time, and duration.');
      return;
    }
    try {
      await this.store.createBooking({
        venueId: this.bookingForm.controls.venueId.getRawValue(),
        slotTime: this.bookingForm.controls.slotTime.getRawValue(),
        durationHours: this.bookingForm.controls.durationHours.getRawValue()
      });
      this.message.set('Booking created.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Booking failed.');
    }
  }

  protected async cancelBooking(bookingId: number): Promise<void> {
    try {
      await this.store.cancelBooking(bookingId);
      this.message.set('Booking cancelled.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Cancel failed.');
    }
  }

  protected venueNameFor(venueId: number): string {
    return this.venues().find((venue) => venue.id === venueId)?.name ?? `Venue #${venueId}`;
  }

  protected selectedVenueImage(): string {
    return this.selectedVenue() ? this.venueImage(this.selectedVenue()!.sportType) : placeholderImage(1200, 800, 'Select Venue');
  }

  protected selectedVenueName(fallback = 'Explore venues'): string {
    return this.selectedVenue()?.name ?? fallback;
  }

  protected selectedVenueLocation(): string {
    return this.selectedVenue()?.location ?? 'Use the filters to browse available venues and book a slot.';
  }

  protected selectedVenueSport(): string {
    return this.selectedVenue()?.sportType ?? 'Venue';
  }

  protected selectedVenuePrice(): number {
    return this.selectedVenue()?.pricePerHour ?? 0;
  }

  protected venueImage(sportType: string): string {
    return sportPlaceholder(sportType || 'Venue', 900, 600);
  }

  private syncSelectedVenue(): void {
    const venueId = this.selectedVenueId() ?? this.selectedVenue()?.id ?? 0;
    if (venueId > 0) {
      this.bookingForm.patchValue({ venueId });
    }
  }
}

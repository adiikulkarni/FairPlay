import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { sportPlaceholder } from '../placeholder-images';
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
    MatDatepickerModule,
    MatTimepickerModule,
    DecimalPipe,
    DatePipe
  ],
  template: `
    <section class="page-grid">
      <section class="split-layout venues-dashboard-layout">
        <div class="page-grid venues-main-column">
          <section class="section-card page-grid venues-hero-card">
            <div class="headline">
              <div>
                <span class="inline-label">Player booking zone</span>
                <h1 class="venueH1">Find and book venues</h1>
                <p>Search by location and sport, then pick a venue to create a slot.</p>
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
          </section>

          <section class="section-card">
            <div class="section-header">
              <div class="muted-grid">
                <h2>Available venues</h2>
                <p>Cards show live venue names, pricing, and sport types from the service.</p>
              </div>
              <mat-chip-set>
                <mat-chip>{{ venues().length }} venues</mat-chip>
              </mat-chip-set>
            </div>

            <div class="centered" *ngIf="loadingVenues()">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <div class="venues-results-grid" *ngIf="!loadingVenues()">
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
        </div>

        <div class="page-grid venues-side-column">
          <aside class="booking-shell">
            <div class="booking-media">
              <img [src]="selectedVenueImage()" [alt]="selectedVenueName()" />
              <div class="media-banner-copy muted-grid">
                <mat-chip-set>
                  <mat-chip>{{ selectedVenueSport() || 'Venue' }}</mat-chip>
                  <mat-chip *ngIf="selectedVenue()">Rs {{ selectedVenuePrice() | number: '1.0-0' }}/hr</mat-chip>
                </mat-chip-set>
                <strong>{{ selectedVenueName('Select a venue to preview') }}</strong>
                <p>
                  {{ selectedVenue()
                    ? 'Selected venue details are loaded from the backend.'
                    : 'Use filters to load venues and pick one to book.' }}
                </p>
              </div>
            </div>

            <div class="booking-sidebar">
              <div class="booking-sidebar-header">
                <div class="booking-price-block">
                  <span class="booking-eyebrow">Price from</span>
                  <div class="booking-price-row">
                    <span class="booking-currency">Rs</span>
                    <strong class="booking-price">{{ selectedVenuePrice() | number: '1.0-0' }}</strong>
                    <span class="booking-price-unit">/ hour</span>
                  </div>
                  <h2 class="booking-venue-title">{{ selectedVenueName('No venue selected') }}</h2>
                  <p class="booking-venue-location">{{ selectedVenueLocation() }}</p>
                </div>

                <div class="booking-confirmation">
                  <mat-icon>verified</mat-icon>
                  <span>Instant confirmation</span>
                </div>
              </div>

              <form [formGroup]="bookingForm" (ngSubmit)="createBooking()" class="booking-sidebar-form">
                <section class="booking-section">
                  <span class="booking-section-label">Select date</span>
                  <mat-form-field appearance="outline" class="booking-picker-field">
                    <mat-label>Choose booking date</mat-label>
                    <input matInput [matDatepicker]="bookingDatePicker" formControlName="slotDate" />
                    <mat-datepicker-toggle matIconSuffix [for]="bookingDatePicker"></mat-datepicker-toggle>
                    <mat-datepicker #bookingDatePicker touchUi></mat-datepicker>
                  </mat-form-field>
                </section>

                <section class="booking-section">
                  <span class="booking-section-label">Select time</span>
                  <mat-form-field appearance="outline" class="booking-picker-field">
                    <mat-label>Choose booking time</mat-label>
                    <input matInput [matTimepicker]="bookingTimePicker" formControlName="slotTime" />
                    <mat-timepicker-toggle matIconSuffix [for]="bookingTimePicker"></mat-timepicker-toggle>
                    <mat-timepicker #bookingTimePicker></mat-timepicker>
                  </mat-form-field>
                </section>

                <section class="booking-section">
                  <span class="booking-section-label">Duration</span>
                  <div class="booking-toggle-row">
                    @for (hours of durationChoices; track hours) {
                      <button
                        type="button"
                        class="booking-toggle"
                        [class.active]="bookingForm.controls.durationHours.getRawValue() === hours"
                        (click)="bookingForm.patchValue({ durationHours: hours })"
                      >
                        {{ hours }} hr
                      </button>
                    }
                  </div>
                </section>

                <div class="booking-summary">
                  <div class="booking-summary-row">
                    <span>{{ bookingSummaryLabel() }}</span>
                    <strong>Rs {{ bookingSubtotal() | number: '1.0-0' }}</strong>
                  </div>
                  <div class="booking-summary-row booking-total-row">
                    <span>Total</span>
                    <strong>Rs {{ bookingEstimatedTotal() | number: '1.0-0' }}</strong>
                  </div>
                </div>

                <p class="form-error" *ngIf="message()">{{ message() }}</p>
                <button mat-flat-button color="primary" type="submit" class="booking-cta" [disabled]="!selectedVenue()">
                  Book Now
                </button>
              </form>
            </div>
          </aside>

          <section class="section-card" id="bookings">
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

  protected readonly filterForm = this.fb.nonNullable.group({
    location: [''],
    sportType: ['']
  });

  protected readonly bookingForm = this.fb.group({
    venueId: this.fb.nonNullable.control(0, [Validators.required, Validators.min(1)]),
    slotDate: new FormControl<Date | null>(new Date(), Validators.required),
    slotTime: new FormControl<Date | null>(null, Validators.required),
    durationHours: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1), Validators.max(12)])
  });

  protected readonly selectedVenue = computed(() => {
    const selectedId = this.selectedVenueId();
    return this.venues().find((venue) => venue.id === selectedId) ?? this.venues()[0] ?? null;
  });

  constructor() {
    effect(() => {
      const venues = this.venues();
      if (!venues.length) {
        this.selectedVenueId.set(null);
        this.bookingForm.patchValue({ venueId: 0 }, { emitEvent: false });
        return;
      }

      const requestedVenueId = this.selectedVenueId();
      const resolvedVenueId = venues.some((venue) => venue.id === requestedVenueId) ? requestedVenueId : venues[0].id;

      if (resolvedVenueId !== requestedVenueId) {
        this.selectedVenueId.set(resolvedVenueId);
      }

      if (resolvedVenueId && this.bookingForm.controls.venueId.getRawValue() !== resolvedVenueId) {
        this.bookingForm.patchValue({ venueId: resolvedVenueId }, { emitEvent: false });
      }
    });

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
      const { slotDate, slotTime, venueId, durationHours } = this.bookingForm.getRawValue();
      const slotDateTime = this.combineDateAndTime(slotDate, slotTime);
      await this.store.createBooking({
        venueId: venueId ?? 0,
        slotTime: slotDateTime,
        durationHours: durationHours ?? 1
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
    return '/venue-placeholder.jpeg';
  }

  protected selectedVenueName(fallback = 'Explore venues'): string {
    return this.selectedVenue()?.name ?? fallback;
  }

  protected selectedVenueLocation(): string {
    return this.selectedVenue()?.location ?? 'Use the filters to browse available venues and book a slot.';
  }

  protected selectedVenueSport(): string {
    return this.selectedVenue()?.sportType ?? '';
  }

  protected selectedVenuePrice(): number {
    return this.selectedVenue()?.pricePerHour ?? 0;
  }

  protected venueImage(_: string): string {
    return '/venue-placeholder.jpeg';
  }

  protected bookingSummaryLabel(): string {
    const duration = this.bookingForm.controls.durationHours.getRawValue() ?? 1;
    const venueName = this.selectedVenueName('Selected venue');
    return `${duration} hour${duration === 1 ? '' : 's'} x ${venueName}`;
  }

  protected bookingSubtotal(): number {
    return this.selectedVenuePrice() * (this.bookingForm.controls.durationHours.getRawValue() ?? 1);
  }

  protected bookingEstimatedTotal(): number {
    return this.bookingSubtotal();
  }

  private syncSelectedVenue(): void {
    const venueId = this.selectedVenueId() ?? this.selectedVenue()?.id ?? 0;
    if (venueId > 0) {
      this.bookingForm.patchValue({ venueId });
    }
  }

  private combineDateAndTime(date: Date | null, time: Date | null): string {
    if (!date || !time) {
      throw new Error('Select both a booking date and time.');
    }
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    const pad = (value: number): string => value.toString().padStart(2, '0');
    return `${combined.getFullYear()}-${pad(combined.getMonth() + 1)}-${pad(combined.getDate())}T${pad(
      combined.getHours()
    )}:${pad(combined.getMinutes())}:00`;
  }
}

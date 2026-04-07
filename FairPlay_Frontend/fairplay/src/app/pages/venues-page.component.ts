import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
import {Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FairplayStore} from '../services/fairplay-store.service';

@Component({
  selector: 'app-venues-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    DecimalPipe,
    DatePipe
  ],
  template: `
    <section class="page-grid">
      <section class="media-grid">
        <div class="hero-media">
          <img [src]="selectedVenueImage()" [alt]="selectedVenue() ? selectedVenue()!.name : 'Venue'"/>
        </div>
        <div><img [src]="galleryImages[0]" alt="Venue detail"/></div>
        <div><img [src]="galleryImages[1]" alt="Venue lobby"/></div>
        <div><img [src]="galleryImages[2]" alt="Court detail"/></div>
      </section>

      <section class="split-layout">
        <div class="page-grid">
          <div class="headline">
            <div>
              <span class="inline-label">Premium partner</span>
              <h1>{{ selectedVenue() ? selectedVenue()!.name : 'Explore Venues' }}</h1>
              <p>{{ selectedVenue() ? selectedVenue()!.location : 'Choose a venue to view live details and booking options.' }}</p>
            </div>
          </div>

          <div class="section-card">
            <form [formGroup]="filterForm" (ngSubmit)="search()" class="actions">
              <mat-form-field appearance="fill">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location"/>
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Sport type</mat-label>
                <input matInput formControlName="sportType"/>
              </mat-form-field>
              <button mat-flat-button color="primary" type="submit">Search</button>
              <button mat-button type="button" (click)="resetFilters()">Reset</button>
            </form>
          </div>

          <div class="section-card muted-grid">
            <h2>About this venue</h2>
            <p>
              FairPlay venue pages are powered by the live venues and bookings APIs. Pick a venue, choose a time,
              and create a booking directly from this page.
            </p>
          </div>

          <div class="amenities-grid">
            @for (item of amenities; track item.title) {
              <div class="amenity-card muted-grid">
                <strong>{{ item.title }}</strong>
                <p>{{ item.caption }}</p>
              </div>
            }
          </div>

          <div class="section-card">
            <div class="headline">
              <div>
                <h2>Available venues</h2>
                <p>Live inventory from the venue service.</p>
              </div>
            </div>
            <div class="centered" *ngIf="loadingVenues()">
              <mat-spinner diameter="32"></mat-spinner>
            </div>
            <div class="card-list" *ngIf="!loadingVenues()">
              @for (venue of venues(); track venue.id) {
                <div class="table-row">
                  <div class="muted-grid">
                    <strong>{{ venue.name }}</strong>
                    <p>{{ venue.location }}</p>
                  </div>
                  <div class="muted-grid">
                    <strong>{{ venue.sportType }}</strong>
                    <p>Rs {{ venue.pricePerHour | number:'1.0-0' }}/hr</p>
                  </div>
                  <div class="actions">
                    <button mat-button type="button" (click)="selectVenue(venue.id)">View</button>
                  </div>
                </div>
              } @empty {
                <p>No venues found.</p>
              }
            </div>
          </div>

          <div class="section-card">
            <div class="headline">
              <div>
                <h2>Your bookings</h2>
                <p>Current booking history for your account.</p>
              </div>
            </div>
            <div class="table-list">
              @for (booking of bookings(); track booking.id) {
                <div class="table-row">
                  <div class="muted-grid">
                    <strong>{{ venueNameFor(booking.venueId) }}</strong>
                    <p>{{ booking.slotTime | date:'medium' }}</p>
                  </div>
                  <div class="muted-grid">
                    <strong>{{ booking.status }}</strong>
                    <p>Rs {{ booking.totalPrice | number:'1.0-0' }}</p>
                  </div>
                  <div class="actions">
                    <button mat-button type="button" (click)="cancelBooking(booking.id)"
                            *ngIf="booking.status === 'BOOKED'">
                      Cancel
                    </button>
                  </div>
                </div>
              } @empty {
                <p>No bookings yet.</p>
              }
            </div>
          </div>
        </div>

        <aside class="booking-sidebar">
          <div class="muted-grid">
            <p>Price from</p>
            <h2>Rs {{ (selectedVenue() ? selectedVenue()!.pricePerHour : 0) | number:'1.0-0' }} / hour</h2>
          </div>

          <form [formGroup]="bookingForm" (ngSubmit)="createBooking()" class="page-grid">
            <div class="muted-grid">
              <strong>Select date and time</strong>
              <input matInput type="datetime-local" formControlName="slotTime"/>
            </div>

            <div class="muted-grid">
              <strong>Duration</strong>
              <div class="chip-row">
                @for (hours of durationChoices; track hours) {
                  <button
                    type="button"
                    class="slot-chip"
                    [class.active]="bookingForm.controls.durationHours.getRawValue() === hours"
                    (click)="bookingForm.patchValue({ durationHours: hours })"
                  >
                    {{ hours }} hr
                  </button>
                }
              </div>
            </div>

            <p class="form-error" *ngIf="message()">{{ message() }}</p>
            <button mat-flat-button color="primary" type="submit">Book Now</button>
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
  protected readonly amenities = [
    {title: 'Free Parking', caption: 'Easy venue access'},
    {title: 'Changing Rooms', caption: 'Clean prep spaces'},
    {title: 'Filtered Water', caption: 'Hydration support'},
    {title: 'Equipment Rental', caption: 'Sport gear on site'},
    {title: 'Climate Control', caption: 'Consistent indoor comfort'},
    {title: 'Free WiFi', caption: 'High speed network'}
  ];
  protected readonly galleryImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAHySnx8nLE68QjNAC2hKrRpFcKjvJULMx8C99MoqrXj-XHsVB3nA41Sp0UKz3-ZZcu9rGOiY_DB3XIs5eETJ4y-y5mdTRvnyjM_DBn8GZkz6qCHdG76aB2QrwCd3VJG4brzxdSSJpsVd66DZp383sknUzPQMq_F78g4hA-AM2gJ-lSwQ-IAS0ryKpzj_c9kGXCz2Wa-8RvbpVwoIWeXfsUxQz20L5hz_eJBSd3fc8K3rFDfmQhmfq_rmwqmL9bPqZQQCPeDOEMMVk',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuChGV1ddoPksUt9_bPnD12K_ZIKm7H4V0vW2_99VYe9dsjlDNe0YLw6GpPD7G1zYqtklgXNr6ifrQQGn0KC1ue6PpY185uS2_NjH_rtp-PBBvvHBEgvophYBpu0qMflO3GLWeR7XFlw3fiBKdjqRnjEpPYtggEz_wS5jySvew8fE5__lXRF3E1G7ASucxEyQeenlo0-GJBZ01znPbH7xUM0GtTrxNxotwfmIZV_dxJ3VPxLb06yDwLfs4L5l0_1EU4FWA3oIGVToq8',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDpGUcU5tW1zncPfGprCCsPLqPTl1e2NIVnA51pvmA7_ycMs56zidyspFyRbJN3FdB1DC_hU-L7uQASajIaoux6GPAgLovJcA_IJ9y9U1aN8kGmp8rqm5x9JeDyQWacPezlZUvqDERCpHl45AIHPxRDjnw89OI2DjerMXtBLe0o--YKJ_SqZU6yjZigJBCFfkikP8rJzBqYzq0K_t_-4XQoxuvkZIDOQmghEnl-1TsMUMlT62OEeUhhmKSyOmiQGJy8gUZqV_usyhc'
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
    this.filterForm.reset({location: '', sportType: ''});
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
    const sport = this.selectedVenue()?.sportType?.toLowerCase() ?? '';
    if (sport.includes('badminton') || sport.includes('tennis')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnWspcWn2TI814PhylrSE-qBEJZJFh32Q_KvKB0gAiOqei2N77Hcvy4HP3QG25SGaadMrr2QcM0Men1CnMh_QqavqZH6JiU7jEQIooVieawCgW00bkShuWg7CKyH9FfBwX7wewZzYqQ_fx5gtCeA5W6EDbdY394WnY9FNRmUi6tAbNno4BPQbG6YZrK4hMDgTDz4qvWFAUh8Td27YW1XELjPnwvrtzFMoM_Spp0ZeBZtKizBWC7XR4rYScot9XvCghT5DIBUz_zLA';
    }
    if (sport.includes('basketball')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDpGUcU5tW1zncPfGprCCsPLqPTl1e2NIVnA51pvmA7_ycMs56zidyspFyRbJN3FdB1DC_hU-L7uQASajIaoux6GPAgLovJcA_IJ9y9U1aN8kGmp8rqm5x9JeDyQWacPezlZUvqDERCpHl45AIHPxRDjnw89OI2DjerMXtBLe0o--YKJ_SqZU6yjZigJBCFfkikP8rJzBqYzq0K_t_-4XQoxuvkZIDOQmghEnl-1TsMUMlT62OEeUhhmKSyOmiQGJy8gUZqV_usyhc';
    }
    return 'https://placehold.co/1200x900/e2f9ed/006d39?text=FairPlay+Venue';
  }

  private syncSelectedVenue(): void {
    const venueId = this.selectedVenueId() ?? this.selectedVenue()?.id ?? 0;
    if (venueId > 0) {
      this.bookingForm.patchValue({ venueId });
    }
  }
}

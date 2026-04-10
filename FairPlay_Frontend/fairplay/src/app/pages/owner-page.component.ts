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
import { Venue } from '../models';
import { sportPlaceholder } from '../placeholder-images';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-owner-page',
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
    DatePipe,
    DecimalPipe
  ],
  providers: [DatePipe],
  template: `
    <section class="page-grid">
      <section class="hero-copy-grid">
        <div class="hero-panel page-grid">
          <div class="headline">
            <div>
              <span class="inline-label">Owner dashboard</span>
              <h1>Manage venues without mixing player flows.</h1>
<!--              <p>Owner actions stay in one dedicated workspace for metrics, publishing, and revenue visibility.</p>-->
            </div>
          </div>

          <div class="actions">
            <button mat-flat-button color="primary" type="button" (click)="refresh()">Refresh metrics</button>
            <button mat-stroked-button type="button" (click)="createVenue()">Publish venue</button>
          </div>

          <div class="surface-note">Owner role UI is intentionally separate from the player booking and activities screens.</div>
        </div>

        <div class="media-banner">
          <img [src]="heroImage" alt="Owner dashboard hero" />
          <div class="media-banner-copy muted-grid">
            <mat-chip-set>
              <mat-chip>Owner role</mat-chip>
            </mat-chip-set>
            <strong>Owner workspace</strong>
            <p>Metrics, bookings, and venue publishing stay within this dashboard.</p>
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

      <section class="split-layout">
        <div class="page-grid">
          <section class="section-card">
            <div class="section-header">
              <div class="muted-grid">
                <h2>Operational snapshot</h2>
                <p>Live owner metrics stay grouped here instead of appearing in user pages.</p>
              </div>
            </div>

            <div class="table-list">
              @for (row of bookingRows(); track row.label) {
                <div class="table-row">
                  <div class="muted-grid">
                    <strong>{{ row.label }}</strong>
                    <p>{{ row.subtitle }}</p>
                  </div>
                  <div class="muted-grid">
                    <mat-chip-set>
                      <mat-chip>{{ row.status }}</mat-chip>
                    </mat-chip-set>
                    <strong>{{ row.value }}</strong>
                  </div>
                </div>
              }
            </div>
          </section>

          <section class="section-card">
            <div class="section-header">
              <div class="muted-grid">
                <h2>Create venue</h2>
                <p>Material form controls now provide a cleaner publishing flow.</p>
              </div>
            </div>

            <form [formGroup]="form" (ngSubmit)="createVenue()" class="form-grid-two">
              <mat-form-field appearance="outline">
                <mat-label>Venue name</mat-label>
                <input matInput formControlName="name" placeholder="Arena or court name" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location" placeholder="City or district" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sport type</mat-label>
                <input matInput formControlName="sportType" placeholder="Badminton, futsal..." />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Price per hour</mat-label>
                <input matInput type="number" min="1" formControlName="pricePerHour" />
              </mat-form-field>

               <!-- ✅ Amenities (comma-separated input) -->
                    <mat-form-field appearance="outline">
                    <mat-label>Amenities</mat-label>
                    <input matInput formControlName="amenities" placeholder="WiFi, Parking, Washroom..." />
                   </mat-form-field>


  <!-- ✅ About (textarea) -->
  <mat-form-field appearance="outline" >
    <mat-label>About</mat-label>
    <textarea matInput rows="4" formControlName="about" placeholder="Describe your venue..."></textarea>
  </mat-form-field>

              <div class="wide-form-actions">
                <button mat-flat-button color="primary" type="submit">Publish venue</button>
              </div>
            </form>
            <p class="form-error" *ngIf="message()">{{ message() }}</p>
          </section>
        </div>

        <div class="page-grid">
          <section class="section-card">
            <div class="section-header">
              <div class="muted-grid">
                <h2>Published venues</h2>
                <p>Your owner-only venue inventory comes from the dedicated owner endpoint.</p>
              </div>
              <mat-chip-set>
                <mat-chip>{{ ownerVenues().length }} venues</mat-chip>
              </mat-chip-set>
            </div>

            <div class="centered" *ngIf="loadingOwnerVenues()">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <div class="table-list" *ngIf="!loadingOwnerVenues()">
              @for (venue of ownerVenues(); track venue.id) {
                <div class="table-row">
                  <div class="muted-grid">
                    <strong>{{ venue.name }}</strong>
                    <p>{{ venue.location }}</p>
                    <p>{{ venue.about || 'No description added yet.' }}</p>
                  </div>
                  <div class="muted-grid">
                    <mat-chip-set>
                      <mat-chip>{{ venue.sportType }}</mat-chip>
                      <mat-chip>Rs {{ venue.pricePerHour | number: '1.0-0' }}/hr</mat-chip>
                    </mat-chip-set>
                    <p>{{ amenitiesLabel(venue) }}</p>
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <p>No venues published yet. Use the form to add your first venue.</p>
                </div>
              }
            </div>
          </section>

          <section class="section-card">
            <div class="section-header">
              <div class="muted-grid">
                <h2>Venue bookings</h2>
                <p>Owner view of bookings tied to your venues with player details.</p>
              </div>
              <mat-chip-set>
                <mat-chip>{{ ownerBookings().length }} total</mat-chip>
              </mat-chip-set>
            </div>

            <div class="centered" *ngIf="loadingOwnerBookings()">
              <mat-spinner diameter="36"></mat-spinner>
            </div>

            <div class="table-list" *ngIf="!loadingOwnerBookings()">
              @for (booking of ownerBookings(); track booking.id) {
                <div class="table-row">
                  <div class="muted-grid">
                    <strong>{{ booking.venueName ?? venueNameFor(booking.venueId) }}</strong>
                    <p>{{ booking.slotTime | date: 'medium' }} → {{ bookingEndTime(booking) }}</p>
                    <p>Duration: {{ booking.durationHours }} hr</p>
                  </div>
                  <div class="muted-grid">
                    <mat-chip-set>
                      <mat-chip class="status-chip" [ngClass]="{ cancelled: booking.status === 'CANCELLED' }">
                        {{ booking.status }}
                      </mat-chip>
                    </mat-chip-set>
                    <p>Rs {{ booking.totalPrice | number: '1.0-0' }}</p>
                  </div>
                  <div class="muted-grid">
                    <strong>{{ booking.bookedBy?.name ?? 'User #' + booking.userId }}</strong>
                    <p>{{ booking.bookedBy?.email ?? 'Email not provided' }}</p>
                    <p>{{ booking.bookedBy?.phone ?? 'Phone not provided' }}</p>
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <p>No bookings found for your venues.</p>
                </div>
              }
            </div>
          </section>

          <section class="cta-grid">
            @for (item of ownerNotes; track item.title) {
              <mat-card class="overview-card muted-grid">
                <div class="info-row">
                  <strong>{{ item.title }}</strong>
                  <mat-icon>{{ item.icon }}</mat-icon>
                </div>
                <p>{{ item.caption }}</p>
              </mat-card>
            }
          </section>
        </div>
      </section>
    </section>
  `
})
export class OwnerPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FairplayStore);
  private readonly datePipe = inject(DatePipe);

  protected readonly message = signal('');
  protected readonly heroImage = sportPlaceholder('Owner Workspace', 1200, 800);
  protected readonly ownerNotes = [
    { title: 'Revenue visibility', caption: 'Owner earnings remain visible only in the owner workspace.', icon: 'payments' },
    { title: 'Role separation', caption: 'Player booking screens and owner management are visually distinct.', icon: 'account_tree' },
    { title: 'Player context', caption: 'Booking rows surface player contact details when available.', icon: 'perm_contact_calendar' },
    { title: 'Fast publishing', caption: 'The create venue form is cleaner and consistent.', icon: 'publish' }
  ];

  protected readonly stats = computed(() => {
    const dashboard = this.store.ownerDashboard();
    return [
      { label: 'Revenue', value: `Rs ${dashboard?.totalEarnings ?? 0}`, caption: 'Synced from dashboard service', icon: 'payments' },
      { label: 'Active bookings', value: String(dashboard?.activeBookings ?? 0), caption: 'Current confirmed reservations', icon: 'event_available' },
      { label: 'Cancelled', value: String(dashboard?.cancelledBookings ?? 0), caption: 'Bookings marked cancelled', icon: 'event_busy' },
      { label: 'Venues', value: String(dashboard?.totalVenues ?? 0), caption: 'Published under this owner', icon: 'storefront' }
    ];
  });

  protected readonly bookingRows = computed(() => {
    const dashboard = this.store.ownerDashboard();
    return [
      {
        label: 'Confirmed bookings',
        subtitle: 'Active booking count',
        value: String(dashboard?.activeBookings ?? 0),
        status: 'Confirmed'
      },
      {
        label: 'Cancelled bookings',
        subtitle: 'Cancelled booking count',
        value: String(dashboard?.cancelledBookings ?? 0),
        status: 'Cancelled'
      },
      {
        label: 'Managed venues',
        subtitle: 'Total venues under owner',
        value: String(dashboard?.totalVenues ?? 0),
        status: 'Published'
      }
    ];
  });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    location: ['', Validators.required],
    sportType: ['', Validators.required],
    pricePerHour: [1000, [Validators.required, Validators.min(1)]],

    amenities: [''],   // comma-separated string input
    about: ['']
  });

  constructor() {
    void this.store.loadOwnerVenues().catch(() => undefined);
    void this.store.loadOwnerDashboardIfNeeded().catch(() => undefined);
    void this.store.loadOwnerBookings().catch(() => undefined);
    void this.store.loadVenues().catch(() => undefined);
  }

  protected async refresh(): Promise<void> {
    try {
      await this.store.loadOwnerVenues();
      await this.store.loadOwnerDashboardIfNeeded();
      await this.store.loadOwnerBookings();
      this.message.set('');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Refresh failed.');
    }
  }

  protected async createVenue(): Promise<void> {
    if (this.form.invalid) {
      this.message.set('Fill all venue fields.');
      return;
    }
    try {
      await this.store.createVenue({
        name: this.form.controls.name.getRawValue(),
        location: this.form.controls.location.getRawValue(),
        sportType: this.form.controls.sportType.getRawValue(),
        pricePerHour: Number(this.form.controls.pricePerHour.getRawValue()),

         amenities: this.form.controls.amenities.value
        ? this.form.controls.amenities.value
            .split(',')
            .map(a => a.trim())
            .filter(a => a)
        : [],

      // ✅ about
      about: this.form.controls.about.value
      });
      this.message.set('Venue created.');
      this.form.reset({ name: '', location: '', sportType: '', pricePerHour: 1000,amenities: '',
      about: '' });
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Create failed.');
    }
  }

  protected ownerBookings = this.store.ownerBookings;
  protected ownerVenues = this.store.ownerVenues;
  protected loadingOwnerBookings = this.store.loadingOwnerBookings;
  protected loadingOwnerVenues = this.store.loadingOwnerVenues;

  protected venueNameFor(venueId: number): string {
    return this.store.ownerVenues().find((venue) => venue.id === venueId)?.name
      ?? this.store.venues().find((venue) => venue.id === venueId)?.name
      ?? `Venue #${venueId}`;
  }

  protected bookingEndTime = (booking: { slotTime: string; durationHours: number }): string => {
    const start = new Date(booking.slotTime);
    const end = new Date(start);
    end.setHours(end.getHours() + booking.durationHours);
    const formatted = this.datePipe.transform(end, 'mediumTime');
    return formatted ?? '';
  };

  protected amenitiesLabel(venue: Venue): string {
    return venue.amenities?.length ? venue.amenities.join(' • ') : 'No amenities listed yet.';
  }
}

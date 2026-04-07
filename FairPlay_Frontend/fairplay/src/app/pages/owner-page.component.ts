import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
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
    MatInputModule
  ],
  template: `
    <section class="page-grid">
      <section class="hero-copy-grid">
        <div class="hero-panel page-grid">
          <div class="headline">
            <div>
              <span class="inline-label">Owner dashboard</span>
              <h1>Manage venues without mixing player flows.</h1>
              <p>Owner actions stay in one dedicated workspace for metrics, publishing, and revenue visibility.</p>
            </div>
          </div>

          <div class="actions">
            <button mat-flat-button color="primary" type="button" (click)="refresh()">Refresh metrics</button>
            <button mat-stroked-button type="button" (click)="createVenue()">Publish venue</button>
          </div>

          <div class="surface-note">Owner role UI is intentionally separate from the player booking and activities screens.</div>
        </div>

        <div class="media-banner">
          <img [src]="heroImage" alt="Owner dashboard placeholder" />
          <div class="media-banner-copy muted-grid">
            <mat-chip-set>
              <mat-chip>Owner role</mat-chip>
            </mat-chip-set>
            <strong>Placeholder owner imagery</strong>
            <p>Replace this image later with venue or operations photography.</p>
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
              <div class="wide-form-actions">
                <button mat-flat-button color="primary" type="submit">Publish venue</button>
              </div>
            </form>
            <p class="form-error" *ngIf="message()">{{ message() }}</p>
          </section>
        </div>

        <div class="page-grid">
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

          <mat-card class="venue-card">
            <div class="card-media">
              <img [src]="cardImage" alt="Owner venue placeholder" />
            </div>
            <div class="card-body muted-grid">
              <strong>Owner media card</strong>
              <p>Another dummy image slot that you can replace with real venue photography later.</p>
            </div>
          </mat-card>
        </div>
      </section>
    </section>
  `
})
export class OwnerPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FairplayStore);

  protected readonly message = signal('');
  protected readonly heroImage = sportPlaceholder('Owner Workspace', 1200, 800);
  protected readonly cardImage = sportPlaceholder('Venue Operations', 900, 600);
  protected readonly ownerNotes = [
    { title: 'Revenue visibility', caption: 'Owner earnings remain visible only in the owner workspace.', icon: 'payments' },
    { title: 'Role separation', caption: 'Player booking screens and owner management are visually distinct.', icon: 'account_tree' },
    { title: 'Placeholder ready', caption: 'All owner media slots use dummy imagery for now.', icon: 'image' },
    { title: 'Fast publishing', caption: 'The create venue form is cleaner and more consistent.', icon: 'publish' }
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
    pricePerHour: [1000, [Validators.required, Validators.min(1)]]
  });

  constructor() {
    void this.store.loadOwnerDashboardIfNeeded().catch(() => undefined);
  }

  protected async refresh(): Promise<void> {
    try {
      await this.store.loadOwnerDashboardIfNeeded();
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
        pricePerHour: Number(this.form.controls.pricePerHour.getRawValue())
      });
      this.message.set('Venue created.');
      this.form.reset({ name: '', location: '', sportType: '', pricePerHour: 1000 });
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Create failed.');
    }
  }
}

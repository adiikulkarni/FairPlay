import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-owner-page',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="page-grid">
      <div class="headline">
        <div>
          <h1>Venue Overview</h1>
          <p>Live owner metrics, bookings, and venue publishing connected to the owner dashboard and venues APIs.</p>
        </div>
        <div class="actions">
          <button mat-button type="button" (click)="refresh()">Update availability</button>
          <button mat-flat-button color="primary" type="button" (click)="createVenue()">Add New Court</button>
        </div>
      </div>

      <section class="kpi-grid">
        @for (item of stats(); track item.label) {
          <div class="kpi-card muted-grid">
            <div class="stat-label">{{ item.label }}</div>
            <div class="stat-value">{{ item.value }}</div>
            <p>{{ item.caption }}</p>
          </div>
        }
      </section>

      <section class="split-layout">
        <div class="page-grid">
          <div class="section-card">
            <div class="headline">
              <div>
                <h2>Upcoming Bookings</h2>
                <p>Snapshot of active and cancelled volume from the dashboard service.</p>
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
                    <strong>{{ row.value }}</strong>
                    <p>{{ row.status }}</p>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="section-card">
            <div class="headline">
              <div>
                <h2>Venue Management</h2>
                <p>Create new venue records against the gateway API.</p>
              </div>
            </div>
            <form [formGroup]="form" (ngSubmit)="createVenue()" class="page-grid">
              <mat-form-field appearance="fill">
                <mat-label>Venue name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Location</mat-label>
                <input matInput formControlName="location" />
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Sport type</mat-label>
                <input matInput formControlName="sportType" />
              </mat-form-field>
              <mat-form-field appearance="fill">
                <mat-label>Price per hour</mat-label>
                <input matInput type="number" min="1" formControlName="pricePerHour" />
              </mat-form-field>
              <p class="form-error" *ngIf="message()">{{ message() }}</p>
              <button mat-flat-button color="primary" type="submit">Publish venue</button>
            </form>
          </div>
        </div>

        <div class="page-grid">
          <div class="section-card muted-grid">
            <h2>Live Notifications</h2>
            <div class="table-list">
              <div class="table-row">
                <div class="muted-grid">
                  <strong>Revenue update</strong>
                  <p>Total earnings synced from the owner dashboard.</p>
                </div>
                <strong>Rs {{ revenue() }}</strong>
              </div>
              <div class="table-row">
                <div class="muted-grid">
                  <strong>Bookings today</strong>
                  <p>Active reservations currently tracked.</p>
                </div>
                <strong>{{ activeBookings() }}</strong>
              </div>
            </div>
          </div>

          <div class="venue-card">
            <div class="card-media">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6GKxNLL7feSpBFYPcyf0ZEDy6oT6IZz01tbluiW3UhuN59aGoavLIT9HQwwQ1wJ_YXSUZ7J-X3J_eD83I68dMqKsxpzONxRVzDNlchXVvjcPMeQEh0wVugs3uPPj9ia_AKljQ_Y_RFfmGWAAOoCiWdteYuJiCm-L6ycsJL91atoN93v3sEyn6u4WsUWDxRPOxHwBvbIytTbou2-RzTZSKcK8yp5O1RW4l4_0pFzbyihl-i0dWaDEDm3shMZpBH9JHpz7E4ZPHlVM"
                alt="Owner venue"
              />
            </div>
            <div class="card-body muted-grid">
              <strong>Peak times</strong>
              <p>Monitor venue usage and update availability from the owner console.</p>
            </div>
          </div>
        </div>
      </section>
    </section>
  `
})
export class OwnerPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FairplayStore);

  protected readonly message = signal('');
  protected readonly stats = computed(() => {
    const dashboard = this.store.ownerDashboard();
    return [
      { label: 'Total Revenue', value: `Rs ${dashboard?.totalEarnings ?? 0}`, caption: 'Synced from dashboard service' },
      { label: 'Bookings', value: String(dashboard?.activeBookings ?? 0), caption: 'Active reservations' },
      { label: 'Occupancy Rate', value: dashboard ? `${Math.min(100, dashboard.activeBookings * 20)}%` : '0%', caption: 'Estimated live load' },
      { label: 'Avg. Rating', value: '4.9', caption: 'Static design placeholder' }
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
  protected readonly revenue = computed(() => this.store.ownerDashboard()?.totalEarnings ?? 0);
  protected readonly activeBookings = computed(() => this.store.ownerDashboard()?.activeBookings ?? 0);

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
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Create failed.');
    }
  }
}

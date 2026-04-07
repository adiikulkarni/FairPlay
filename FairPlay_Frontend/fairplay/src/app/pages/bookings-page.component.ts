import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { FairplayStore } from '../services/fairplay-store.service';
import { Booking } from '../models';

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    DecimalPipe,
  ],
  template: `
    <section class="page-grid">
      <div class="section-card page-grid">
        <div class="headline">
          <div>
            <span class="inline-label">Bookings overview</span>
            <h2>Review your bookings</h2>
<!--            <p>Yeh Booking na Milegi Dobara</p>-->
          </div>
          <a mat-stroked-button color="primary" routerLink="/venues">
            <mat-icon>add</mat-icon>
            New booking
          </a>
        </div>
        <div class="muted-grid">
          <!--          <p><mat-icon>event_available</mat-icon> Current shows live slots in progress.</p>-->
          <!--          <p><mat-icon>schedule</mat-icon> Upcoming shows future slots that are still booked.</p>-->
          <!--          <p><mat-icon>history</mat-icon> Previous shows finished or cancelled slots.</p>-->
        </div>
      </div>

      <section class="split-layout">
        <div class="page-grid">
          <section class="section-card">
            <div class="section-header">
              <div class="muted-grid">
                <h2>Current</h2>
                <p>Slots that are live right now.</p>
              </div>
              <mat-chip-set>
                <mat-chip>{{ currentBookings().length }} active</mat-chip>
              </mat-chip-set>
            </div>
            <ng-container *ngIf="!loadingAny(); else loadingBlock">
              <div class="table-list">
                @for (booking of currentBookings(); track booking.id) {
                  <div class="table-row">
                    <div class="muted-grid">
                      <strong>{{ venueNameFor(booking.venueId) }}</strong>
                      <p>{{ booking.slotTime | date: 'medium' }}</p>
                      <p>Duration: {{ booking.durationHours }} hr</p>
                    </div>
                    <div class="muted-grid">
                      <mat-chip-set>
                        <mat-chip color="primary" class="status-chip">Live</mat-chip>
                        <mat-chip *ngIf="booking.kind === 'owner'" class="status-chip"
                          >Owner venue</mat-chip
                        >
                        <mat-chip *ngIf="booking.kind === 'player'" class="status-chip"
                          >Your booking</mat-chip
                        >
                      </mat-chip-set>
                      <p>Rs {{ booking.totalPrice | number: '1.0-0' }}</p>
                    </div>
                    <div class="actions">
                      <button
                        mat-button
                        type="button"
                        [disabled]="booking.kind === 'owner'"
                        (click)="cancel(booking)"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">
                    <p>No live bookings right now.</p>
                  </div>
                }
              </div>
            </ng-container>
          </section>

          <section class="section-card">
            <div class="section-header">
              <div class="muted-grid">
                <h2>Upcoming</h2>
                <p>Future slots that are still booked.</p>
              </div>
              <mat-chip-set>
                <mat-chip>{{ upcomingBookings().length }} upcoming</mat-chip>
              </mat-chip-set>
            </div>
            <ng-container *ngIf="!loadingAny(); else loadingBlock">
              <div class="table-list">
                @for (booking of upcomingBookings(); track booking.id) {
                  <div class="table-row">
                    <div class="muted-grid">
                      <strong>{{ venueNameFor(booking.venueId) }}</strong>
                      <p>{{ booking.slotTime | date: 'medium' }}</p>
                      <p>Duration: {{ booking.durationHours }} hr</p>
                    </div>
                    <div class="muted-grid">
                      <mat-chip-set>
                        <mat-chip color="primary" class="status-chip">Booked</mat-chip>
                        <mat-chip *ngIf="booking.kind === 'owner'" class="status-chip"
                          >Owner venue</mat-chip
                        >
                        <mat-chip *ngIf="booking.kind === 'player'" class="status-chip"
                          >Your booking</mat-chip
                        >
                      </mat-chip-set>
                      <p>Rs {{ booking.totalPrice | number: '1.0-0' }}</p>
                    </div>
                    <div class="actions">
                      <button
                        mat-button
                        type="button"
                        [disabled]="booking.kind === 'owner'"
                        (click)="cancel(booking)"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-state">
                    <p>No upcoming bookings.</p>
                  </div>
                }
              </div>
            </ng-container>
          </section>
        </div>

        <aside class="section-card">
          <div class="section-header">
            <div class="muted-grid">
              <h2>Previous</h2>
              <p>Finished or cancelled slots.</p>
            </div>
            <mat-chip-set>
              <mat-chip>{{ previousBookings().length }} total</mat-chip>
            </mat-chip-set>
          </div>
          <ng-container *ngIf="!loadingAny(); else loadingBlock">
            <div class="table-list">
              @for (booking of previousBookings(); track booking.id) {
                <div class="table-row">
                  <div class="muted-grid">
                    <strong>{{ venueNameFor(booking.venueId) }}</strong>
                    <p>{{ booking.slotTime | date: 'medium' }}</p>
                    <p>Duration: {{ booking.durationHours }} hr</p>
                  </div>
                  <div class="muted-grid">
                    <mat-chip-set>
                      <mat-chip
                        class="status-chip"
                        [ngClass]="{ cancelled: booking.status === 'CANCELLED' }"
                      >
                        {{ booking.status === 'CANCELLED' ? 'Cancelled' : 'Completed' }}
                      </mat-chip>
                      <mat-chip *ngIf="booking.kind === 'owner'" class="status-chip"
                        >Owner venue</mat-chip
                      >
                      <mat-chip *ngIf="booking.kind === 'player'" class="status-chip"
                        >Your booking</mat-chip
                      >
                    </mat-chip-set>
                    <p>Rs {{ booking.totalPrice | number: '1.0-0' }}</p>
                  </div>
                </div>
              } @empty {
                <div class="empty-state">
                  <p>No previous bookings yet.</p>
                </div>
              }
            </div>
          </ng-container>
        </aside>
      </section>

      <ng-template #loadingBlock>
        <div class="centered">
          <mat-spinner diameter="36"></mat-spinner>
        </div>
      </ng-template>
    </section>
  `,
})
export class BookingsPageComponent {
  private readonly store = inject(FairplayStore);

  protected readonly bookings = this.store.bookings;
  protected readonly ownerBookings = this.store.ownerBookings;
  protected readonly venues = this.store.venues;
  protected readonly loading = this.store.loadingBookings;
  protected readonly loadingOwner = this.store.loadingOwnerBookings;
  protected readonly now = signal(new Date());
  protected readonly currentUser = this.store.currentUser;

  private readonly combinedBookings = computed(() => {
    const personal = this.bookings().map((b) => ({ ...b, kind: 'player' as const }));
    const owner = this.isOwner()
      ? this.ownerBookings().map((b) => ({ ...b, kind: 'owner' as const }))
      : [];
    return [...personal, ...owner];
  });

  protected readonly currentBookings = computed(() =>
    this.combinedBookings().filter(
      (booking) => booking.status === 'BOOKED' && this.isCurrent(booking),
    ),
  );
  protected readonly upcomingBookings = computed(() =>
    this.combinedBookings().filter(
      (booking) => booking.status === 'BOOKED' && this.isUpcoming(booking),
    ),
  );
  protected readonly previousBookings = computed(() =>
    this.combinedBookings().filter((booking) => this.isPrevious(booking)),
  );

  protected readonly loadingAny = computed(
    () => this.loading() || (this.isOwner() && this.loadingOwner()),
  );

  constructor() {
    const user = this.store.currentUser();
    if (user) {
      void this.store.loadBookings(user.id).catch(() => undefined);
      if (user.role === 'OWNER') {
        void this.store.loadOwnerBookings().catch(() => undefined);
      }
    }
    // Simple tick so "current" updates if the user keeps the page open.
    setInterval(() => this.now.set(new Date()), 60_000);
  }

  protected venueNameFor(venueId: number): string {
    return this.venues().find((venue) => venue.id === venueId)?.name ?? `Venue #${venueId}`;
  }

  protected cancel(booking: Booking & { kind?: string }): void {
    if ((booking as { kind?: string }).kind === 'owner') {
      return;
    }
    void this.store.cancelBooking(booking.id).catch(() => undefined);
  }

  private isCurrent(booking: Booking): boolean {
    const start = new Date(booking.slotTime);
    const end = this.addHours(start, booking.durationHours);
    const now = this.now();
    return now >= start && now < end;
  }

  private isUpcoming(booking: Booking): boolean {
    const start = new Date(booking.slotTime);
    const now = this.now();
    return start > now;
  }

  private isPrevious(booking: Booking): boolean {
    const end = this.addHours(new Date(booking.slotTime), booking.durationHours);
    const now = this.now();
    return end <= now || booking.status === 'CANCELLED';
  }

  private addHours(date: Date, hours: number): Date {
    const copy = new Date(date);
    copy.setHours(copy.getHours() + hours);
    return copy;
  }

  protected readonly isOwner = computed(() => this.currentUser()?.role === 'OWNER');
}

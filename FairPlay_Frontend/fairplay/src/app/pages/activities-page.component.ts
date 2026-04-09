import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Activity } from '../models';
import { sportPlaceholder } from '../placeholder-images';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-activities-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatDatepickerModule,
    MatTimepickerModule,
    DatePipe
  ],
  template: `
    <section class="page-grid">
      <section class="hero-copy-grid">
        <div class="section-card page-grid">
          <div class="headline">
            <div>
              <span class="inline-label">Community games</span>
              <h1 class="activitiesH1">Host your next match.</h1>
              <p>{{ heroSummary() }}</p>
            </div>
          </div>

          <form [formGroup]="form" (ngSubmit)="host()" class="form-grid-two">
            <mat-form-field appearance="outline">
              <mat-label>Sport type</mat-label>
              <input matInput formControlName="sportType" placeholder="Football, badminton..." />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Location</mat-label>
              <input matInput formControlName="location" placeholder="Area or venue" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Start date</mat-label>
              <input matInput [matDatepicker]="activityDatePicker" formControlName="activityDate" />
              <mat-datepicker-toggle matIconSuffix [for]="activityDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #activityDatePicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Start time</mat-label>
              <input matInput [matTimepicker]="activityTimePicker" formControlName="activityTime" />
              <mat-timepicker-toggle matIconSuffix [for]="activityTimePicker"></mat-timepicker-toggle>
              <mat-timepicker #activityTimePicker></mat-timepicker>
            </mat-form-field>
            <div class="wide-form-actions">
              <button mat-flat-button color="primary" type="submit">Host game</button>
              <button mat-stroked-button type="button" (click)="refresh()">Refresh feed</button>
            </div>
          </form>

          <p class="form-error" *ngIf="message()">{{ message() }}</p>
        </div>

        <div class="media-banner">
          <img [src]="heroImage()" alt="Activity hero" />
          <div class="media-banner-copy muted-grid">
            <mat-chip-set>
              <mat-chip>{{ activities().length }} live</mat-chip>
              <mat-chip *ngIf="nextActivity() as next">Next: {{ next.time | date: 'short' }}</mat-chip>
            </mat-chip-set>
            <strong>{{ nextActivityTitle() }}</strong>
            <p>{{ nextActivityCopy() }}</p>
          </div>
        </div>
      </section>

      <section class="cta-grid">
        @for (item of statsCards(); track item.title) {
          <mat-card class="overview-card muted-grid">
            <div class="info-row">
              <strong>{{ item.title }}</strong>
              <mat-icon>{{ item.icon }}</mat-icon>
            </div>
            <p>{{ item.caption }}</p>
          </mat-card>
        }
      </section>

      <section class="section-card">
        <div class="section-header">
          <div class="muted-grid">
            <h2>Active games nearby</h2>
            <p>Live feed backed by the user service.</p>
          </div>
          <div class="actions">
            <mat-chip-set>
              <mat-chip>{{ activities().length }} available</mat-chip>
            </mat-chip-set>
            <button mat-stroked-button type="button" (click)="refresh()">Refresh</button>
          </div>
        </div>

        <section class="activity-grid">
          @for (activity of activities(); track activity.id) {
            <mat-card class="activity-card">
              <div class="card-media">
                <img [src]="activityImage(activity.sportType)" [alt]="activity.sportType" />
              </div>
              <div class="card-body muted-grid">
                <div class="info-row">
                  <mat-chip-set>
                    <mat-chip>{{ activity.sportType }}</mat-chip>
                    <mat-chip>{{ activity.participantCount }} joined</mat-chip>
                    <mat-chip *ngIf="isHost(activity)" color="primary" class="role-chip">You host</mat-chip>
                    <mat-chip *ngIf="!isHost(activity) && isParticipant(activity)">Joined</mat-chip>
                  </mat-chip-set>
                </div>
                <strong>{{ activity.location }}</strong>
                <p>{{ activity.time | date: 'medium' }}</p>
                <div class="muted-grid" *ngIf="activity.participants?.length">
                  <strong>Participants</strong>
                  <mat-chip-set>
                    @for (user of activity.participants!; track user.id) {
                      <mat-chip>{{ user.name }}</mat-chip>
                    }
                  </mat-chip-set>
                </div>
                <div class="actions">
                  <button
                    mat-flat-button
                    color="primary"
                    type="button"
                    [disabled]="!canJoin(activity)"
                    (click)="join(activity)"
                  >
                    {{ joinLabel(activity) }}
                  </button>
                </div>
              </div>
            </mat-card>
          } @empty {
            <div class="empty-state">
              <p>No activities available right now.</p>
            </div>
          }
        </section>
      </section>
    </section>
  `
})
export class ActivitiesPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FairplayStore);

  protected readonly activities = this.store.activities;
  protected readonly currentUser = this.store.currentUser;
  protected readonly message = signal('');

  protected readonly form = this.fb.group({
    sportType: this.fb.nonNullable.control('', Validators.required),
    location: this.fb.nonNullable.control('', Validators.required),
    activityDate: new FormControl<Date | null>(null, Validators.required),
    activityTime: new FormControl<Date | null>(null, Validators.required)
  });

  protected readonly nextActivity = computed<Activity | null>(() => {
    const sorted = [...this.activities()].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
    return sorted[0] ?? null;
  });

  protected readonly heroImage = computed(() =>
    sportPlaceholder(this.nextActivity()?.sportType ?? 'Activity', 1200, 800)
  );

  protected readonly heroSummary = computed(() => {
    const activities = this.activities();
    if (!activities.length) {
      return 'Host a game or refresh to load the community feed.';
    }
    const locations = this.uniqueCount(activities.map((a) => a.location));
    const sports = this.uniqueCount(activities.map((a) => a.sportType));
    return `${activities.length} live games across ${locations} locations and ${sports} sports.`;
  });

  protected readonly nextActivityTitle = computed(() => {
    const next = this.nextActivity();
    return next ? `${next.sportType} at ${next.location}` : 'No activities scheduled yet';
  });

  protected readonly nextActivityCopy = computed(() => {
    const next = this.nextActivity();
    return next ? `Starts ${this.formatTime(next.time)} with ${next.participantCount} joined.` : 'Use the form to host a match and fill the feed.';
  });

  protected readonly statsCards = computed(() => {
    const activities = this.activities();
    const participantTotal = activities.reduce((sum, activity) => sum + (activity.participantCount ?? 0), 0);
    const sports = this.uniqueCount(activities.map((a) => a.sportType));
    const locations = this.uniqueCount(activities.map((a) => a.location));
    const next = this.nextActivity();
    return [
      { title: 'Players joined', caption: `${participantTotal} total sign-ups`, icon: 'groups' },
      { title: 'Sports live', caption: `${sports} sports in this feed`, icon: 'sports_soccer' },
      { title: 'Locations', caption: `${locations} unique areas`, icon: 'place' },
      {
        title: 'Next kickoff',
        caption: next ? `${next.sportType} • ${this.formatTime(next.time)}` : 'No games scheduled yet',
        icon: 'schedule'
      }
    ];
  });

  protected async refresh(): Promise<void> {
    try {
      await this.store.loadActivities();
      this.message.set('');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Refresh failed.');
    }
  }

  protected async host(): Promise<void> {
    if (this.form.invalid) {
      this.message.set('Fill all activity fields.');
      return;
    }
    try {
      const { sportType, location, activityDate, activityTime } = this.form.getRawValue();
      const startAt = this.combineDateAndTime(activityDate, activityTime);
      await this.store.hostActivity({ sportType: sportType ?? '', location: location ?? '', time: startAt });
      this.form.reset({ sportType: '', location: '', activityDate: null, activityTime: null });
      this.message.set('Activity created.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Create failed.');
    }
  }

  protected async join(activity: Activity): Promise<void> {
    if (!this.currentUser()) {
      this.message.set('Login to join activities.');
      return;
    }
    if (!this.canJoin(activity)) {
      this.message.set(this.joinLabel(activity));
      return;
    }
    try {
      await this.store.joinActivity(activity.id);
      this.message.set('Joined activity.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Join failed.');
    }
  }

  protected joinLabel(activity: Activity): string {
    const user = this.currentUser();
    if (!user) {
      return 'Login to join';
    }
    if (this.isHost(activity)) {
      return 'You are hosting';
    }
    if (this.isParticipant(activity)) {
      return 'Joined';
    }
    return 'Join game';
  }

  protected canJoin(activity: Activity): boolean {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    return !this.isHost(activity) && !this.isParticipant(activity);
  }

  protected isHost(activity: Activity): boolean {
    const user = this.currentUser();
    return !!user && activity.hostUserId === user.id;
  }

  protected isParticipant(activity: Activity): boolean {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    if ((activity.participantIds ?? []).includes(user.id)) {
      return true;
    }
    return (activity.participants ?? []).some((p) => p.id === user.id);
  }

  protected activityImage(_: string): string {
    return '/activities.jpeg';
  }

  private uniqueCount(values: string[]): number {
    return new Set(values.filter(Boolean).map((value) => value.trim().toLowerCase())).size;
  }

  private formatTime(value: string): string {
    const date = new Date(value);
    return date.toLocaleString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  private combineDateAndTime(date: Date | null, time: Date | null): string {
    if (!date || !time) {
      throw new Error('Choose both a start date and time.');
    }
    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    const pad = (value: number): string => value.toString().padStart(2, '0');
    return `${combined.getFullYear()}-${pad(combined.getMonth() + 1)}-${pad(combined.getDate())}T${pad(
      combined.getHours()
    )}:${pad(combined.getMinutes())}:00`;
  }
}

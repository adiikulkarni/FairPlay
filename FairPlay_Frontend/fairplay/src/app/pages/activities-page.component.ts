import { CommonModule, DatePipe } from '@angular/common';
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
    DatePipe
  ],
  template: `
    <section class="page-grid">
      <section class="hero-copy-grid">
        <div class="section-card page-grid">
          <div class="headline">
            <div>
              <span class="inline-label">Player community</span>
              <h1>Join your next match.</h1>
              <p>Players can browse public activities and host a game with a cleaner Material-based form.</p>
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
              <mat-label>Start time</mat-label>
              <input matInput type="datetime-local" formControlName="time" />
            </mat-form-field>
            <div class="wide-form-actions">
              <button mat-flat-button color="primary" type="submit">Host game</button>
              <button mat-stroked-button type="button" (click)="refresh()">Refresh feed</button>
            </div>
          </form>

          <p class="form-error" *ngIf="message()">{{ message() }}</p>
        </div>

        <div class="media-banner">
          <img [src]="heroImage()" alt="Activity placeholder" />
          <div class="media-banner-copy muted-grid">
            <mat-chip-set>
              <mat-chip>{{ activities().length }} live activities</mat-chip>
            </mat-chip-set>
            <strong>Placeholder activity gallery</strong>
            <p>All activity cards now show a fallback image until real content is uploaded.</p>
          </div>
        </div>
      </section>

      <section class="cta-grid">
        @for (item of infoCards; track item.title) {
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
            <p>Activity discovery is separated from owner tools and focused on users.</p>
          </div>
        </div>

        <section class="activity-grid">
          @for (activity of activities(); track activity.id) {
            <mat-card class="activity-card">
              <div class="card-media">
                <img [src]="activityImage(activity.sportType)" [alt]="activity.sportType" />
              </div>
              <div class="card-body muted-grid">
                <div class="actions">
                  <mat-chip-set>
                    <mat-chip>{{ activity.sportType }}</mat-chip>
                    <mat-chip>{{ activity.participantCount }} joined</mat-chip>
                  </mat-chip-set>
                </div>
                <strong>{{ activity.location }}</strong>
                <p>{{ activity.time | date: 'medium' }}</p>
                <div class="actions">
                  <button mat-stroked-button type="button">View details</button>
                  <button mat-flat-button color="primary" type="button" (click)="join(activity.id)">Join game</button>
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
  protected readonly message = signal('');
  protected readonly infoCards = [
    { title: 'Host public games', caption: 'Create player activities without opening owner pages.', icon: 'event_available' },
    { title: 'Join faster', caption: 'Clear calls to action keep the activity feed simple.', icon: 'group_add' },
    { title: 'Replace images later', caption: 'Every activity now has a consistent dummy image.', icon: 'perm_media' },
    { title: 'User-focused flow', caption: 'This screen is tuned for players, not venue owners.', icon: 'sports_soccer' }
  ];

  protected readonly form = this.fb.nonNullable.group({
    sportType: ['', Validators.required],
    location: ['', Validators.required],
    time: ['', Validators.required]
  });

  protected readonly heroImage = computed(() => sportPlaceholder('Activities Feed', 1200, 800));

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
      await this.store.hostActivity(this.form.getRawValue());
      this.form.reset({ sportType: '', location: '', time: '' });
      this.message.set('Activity created.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Create failed.');
    }
  }

  protected async join(activityId: number): Promise<void> {
    try {
      await this.store.joinActivity(activityId);
      this.message.set('Joined activity.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Join failed.');
    }
  }

  protected activityImage(sportType: string): string {
    return sportPlaceholder(sportType || 'Activity', 900, 600);
  }
}

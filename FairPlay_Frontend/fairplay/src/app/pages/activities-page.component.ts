import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-activities-page',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, DatePipe],
  template: `
    <section class="page-grid">
      <div class="headline">
        <div>
          <h1>Find Your Next Match</h1>
          <p>Join local games, meet athletes, and host your own activity from the same live feed.</p>
        </div>
      </div>

      <section class="section-card">
        <form [formGroup]="form" (ngSubmit)="host()" class="actions">
          <mat-form-field appearance="fill">
            <mat-label>Sport type</mat-label>
            <input matInput formControlName="sportType" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Location</mat-label>
            <input matInput formControlName="location" />
          </mat-form-field>
          <mat-form-field appearance="fill">
            <mat-label>Start time</mat-label>
            <input matInput type="datetime-local" formControlName="time" />
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit">Host game</button>
          <button mat-button type="button" (click)="refresh()">Refresh</button>
        </form>
        <p class="form-error" *ngIf="message()">{{ message() }}</p>
      </section>

      <div class="headline">
        <div>
          <h2>Active Games Nearby</h2>
          <p>Built from the activities and join APIs exposed by the gateway.</p>
        </div>
      </div>

      <section class="activity-grid">
        @for (activity of activities(); track activity.id) {
          <div class="activity-card">
            <div class="card-media">
              <img [src]="activityImage(activity.sportType)" [alt]="activity.sportType" />
            </div>
            <div class="card-body muted-grid">
              <div class="actions">
                <span class="pill-chip active">{{ activity.sportType }}</span>
                <span class="pill-chip">{{ activity.participantCount }} joined</span>
              </div>
              <strong>{{ activity.location }}</strong>
              <p>{{ activity.time | date:'medium' }}</p>
              <div class="actions">
                <button mat-button type="button">Details</button>
                <button mat-flat-button color="primary" type="button" (click)="join(activity.id)">Join Game</button>
              </div>
            </div>
          </div>
        } @empty {
          <p>No activities available.</p>
        }
      </section>
    </section>
  `
})
export class ActivitiesPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FairplayStore);

  protected readonly activities = this.store.activities;
  protected readonly message = signal('');
  protected readonly form = this.fb.nonNullable.group({
    sportType: ['', Validators.required],
    location: ['', Validators.required],
    time: ['', Validators.required]
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
    const sport = sportType.toLowerCase();
    if (sport.includes('basket')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCokDEI6QI64KEGOtXub8-bfAcIO8DfEZUyHY4ck9DKVHo4L8scqKkwQfOQwwESnvyMLBfLDizQcbYpMPkTAlOY1EcWoZZR4ps-7z9CvIg-3BRdI7htO740QfYjnNVLRvtOzKB_u_8VICMwhlDXDxAERqN46KlB23CW2e1li75rRIPAR_gm2hkCDJV6kn2kSFamqkhS9B7VmnjkFAvys0c3YY988ozdXXwfVDndOnXNRyOur8r5S-fvlSKe2MrHno-2_H6JFeIRgcs';
    }
    if (sport.includes('football') || sport.includes('soccer')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTb4ajHV8KcwxsRtUcOYsW7uNqQv4D0csf6Iysht9uHrNv7kxbwCwn8pkFb3vS52GiNSG4MWCyQYPBnETgjwmfRAVU28WwmSulbDTzDTwLC-KObt8rzfa9rjAL2Wr_PNdnddNiUZZMVTMrSP52LxgVA70NvS2isUe4dc5f3cOfINttvMVNh5g1Zcv2_DFGHdeeDvnKH7lA3kcBhBr_iinWjwMgX2_zIc2-vlqTBUsNgHZV_O8si7ZkGpgWJydDW9xXwl63fhi5p6w';
    }
    if (sport.includes('tennis') || sport.includes('badminton')) {
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJ4bqU22khoitQELC-IJ4hk2y1oJsxgGMBt4UdJ2x6xzmKmpSBGnDQ392z6aAfyLNN1QZBPqmpZxd2g2RMmS9FAUPJ8JM6a_VQVch6jzFFrb_-_spg2O9kfl3XNLrSkh4U2S2yCjJPM5ihKa_GfUu7iyFMR0M0spnjlY6n8Q6yyAjPxutg4Pv5esLGawaed6aXB4Y279kDMwLrYR0P4bm1yJ8SFQOZiRH-rnhJeuZFYbuMXSJ8p07DiCh5IhtZClqap-v8LhLpC8M';
    }
    return 'https://placehold.co/900x600/e2f9ed/006d39?text=FairPlay+Activity';
  }
}

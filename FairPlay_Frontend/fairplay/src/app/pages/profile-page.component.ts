import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { placeholderImage } from '../placeholder-images';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-profile-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  template: `
    <section class="page-grid">
      <div class="headline">
        <div>
          <h1 class= "venueH1">Profile</h1>
          <p>Account details stay editable here while player and owner workspaces remain separate.</p>
        </div>
      </div>

      <div class="profile-grid">
        <mat-card class="profile-summary muted-grid" *ngIf="currentUser()">
          <img class="avatar-image" [src]="avatarImage()" alt="Profile avatar" />
          <div class="name-row">
            <span class="initial-badge">{{ initials() }}</span>
            <strong>{{ currentUser()!.name }}</strong>
          </div>
          <p>{{ currentUser()!.email }}</p>
          <mat-chip-set>
            <mat-chip>{{ currentUser()!.role === 'OWNER' ? 'Owner' : 'Player' }}</mat-chip>
          </mat-chip-set>
          <p>{{ currentUser()!.role === 'OWNER' ? 'Owner console access enabled.' : 'Player booking access enabled.' }}</p>
        </mat-card>

        <mat-card class="section-card">
          @if (currentUser()) {
            <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid-two">
              <mat-form-field appearance="outline">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>

              <div class="wide-form-actions">
                <button mat-flat-button color="primary" type="submit">Save changes</button>
              </div>
            </form>
            <p class="form-error" *ngIf="message()">{{ message() }}</p>
          } @else {
            <div class="empty-state">
              <p>Please log in before editing your profile.</p>
            </div>
          }
        </mat-card>
      </div>
    </section>
  `
})
export class ProfilePageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FairplayStore);

  protected readonly currentUser = this.store.currentUser;
  protected readonly message = signal('');
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
  });

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.form.reset({
          name: user.name,
          email: user.email,
          phone: user.phone
        });
      }
    });
  }

  protected async submit(): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      this.message.set('Log in first.');
      return;
    }
    if (this.form.invalid) {
      this.message.set('Fix the invalid profile fields.');
      return;
    }

    try {
      await this.store.updateProfile(user.id, this.form.getRawValue());
      this.message.set('Profile saved.');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Update failed.');
    }
  }

  protected initials(): string {
    const user = this.currentUser();
    if (!user) {
      return 'FP';
    }
    return user.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected avatarImage(): string {
    return placeholderImage(320, 320, this.currentUser()?.role === 'OWNER' ? 'Owner Avatar' : 'Player Avatar');
  }
}

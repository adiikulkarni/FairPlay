import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Role } from '../models';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <section class="page-grid">
      <div class="headline">
        <div>
          <h1>Profile</h1>
          <p>Update the user information used across bookings, activities, and owner operations.</p>
        </div>
      </div>

      <div class="profile-grid">
        <div class="profile-summary muted-grid" *ngIf="currentUser()">
          <div class="profile-avatar">{{ initials() }}</div>
          <strong>{{ currentUser()!.name }}</strong>
          <p>{{ currentUser()!.email }}</p>
          <span class="pill-chip active">{{ currentUser()!.role }}</span>
        </div>

        <div class="section-card">
          @if (currentUser()) {
            <form [formGroup]="form" (ngSubmit)="submit()">
              <mat-form-field appearance="fill">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" />
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Phone</mat-label>
                <input matInput formControlName="phone" />
              </mat-form-field>

              <mat-form-field appearance="fill">
                <mat-label>Role</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="USER">Player</mat-option>
                  <mat-option value="OWNER">Owner</mat-option>
                </mat-select>
              </mat-form-field>

              <p class="form-error" *ngIf="message()">{{ message() }}</p>
              <button mat-flat-button color="primary" type="submit">Save changes</button>
            </form>
          } @else {
            <p>Please log in before editing your profile.</p>
          }
        </div>
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
    role: ['USER' as Role, Validators.required]
  });

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.form.reset({
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
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
}

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { placeholderImage } from '../placeholder-images';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="auth-shell">
      <div class="auth-layout">
        <div class="showcase-panel" [style.background-image]="'url(' + heroImage + ')'">
          <div class="showcase-copy">
            <span class="inline-label">FairPlay access</span>
            <h1>Sign in to the right role workspace.</h1>
            <p>Players and owners share authentication, but the UI paths stay separate after login.</p>
            <mat-chip-set>
              <mat-chip>Player bookings</mat-chip>
              <mat-chip>Owner dashboard</mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <div class="auth-form-shell">
          <div class="muted-grid" style="margin-bottom: 1.5rem;">
            <h2>Login</h2>
            <p>Access your FairPlay account</p>
          </div>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
            <p class="form-error" *ngIf="message()">{{ message() }}</p>
            <div class="form-actions">
            <button mat-flat-button color="primary" type="submit">Login</button>
            <a mat-button routerLink="/register">Create account</a>
            </div>
          </form>
        </div>
      </div>
    </section>
  `
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FairplayStore);
  private readonly router = inject(Router);

  protected readonly heroImage = placeholderImage(1200, 900, 'FairPlay Login');
  protected readonly message = signal('');
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.message.set('Enter your email and password.');
      return;
    }

    try {
      await this.store.login(this.form.getRawValue());
      await this.router.navigateByUrl('/');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Login failed.');
    }
  }
}

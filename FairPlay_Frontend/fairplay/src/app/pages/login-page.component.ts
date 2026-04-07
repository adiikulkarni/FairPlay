import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  template: `
    <section class="auth-shell">
      <div class="auth-layout">
        <div
          class="showcase-panel"
          [style.background-image]="'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCKZgQtz1bBk8eGqqqKBMNRnepQm7NfGjAwozJWTGfYtLw-e9oyTUAwtfRpH7UU6syHudgPqyOQM1eQm3yd7RP-ZNyKxbC43_XHPOL0hKxwKK1R3ni8LfAFyyIjau89Z4Gcu7D8X84sH-hVFofZOmcss5-af6w72aahTKRJcJ9Hgn1pXE5OhkUA21bRnVpwrzERLDSCXxVTETtyzq9nEK4wZTZQ9k9H52xPWvTEbKX8UlN4Iw8Ndo-58nvGPTzBzUplx3_PRu-fZwA)'"
        >
          <div class="showcase-copy">
            <span class="inline-label">FairPlay access</span>
            <h1>Sign in and get back on court.</h1>
            <p>Use your registered account to access venues, activities, profile updates, and owner tools.</p>
          </div>
        </div>

        <div class="auth-form-shell">
          <div class="muted-grid" style="margin-bottom: 1.5rem;">
            <h2>Login</h2>
            <p>Access your FairPlay account</p>
          </div>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="fill">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
            </mat-form-field>

            <mat-form-field appearance="fill">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
            <p class="form-error" *ngIf="message()">{{ message() }}</p>
            <button mat-flat-button color="primary" type="submit">Login</button>
            <a mat-button routerLink="/register">Create account</a>
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

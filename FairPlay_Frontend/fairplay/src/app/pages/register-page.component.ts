import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Role } from '../models';
import { FairplayStore } from '../services/fairplay-store.service';

@Component({
  selector: 'app-register-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <section class="auth-shell">
      <div class="auth-layout">
        <div
          class="showcase-panel"
          [style.background-image]="'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCGSzcjJPP0AxvmDoUIZzv6YdFR0a07v2SHwbtcgQy8DN6nxPY2_JEoxvC9XMz-potlOQtRIuYaAtzaUf4DZjzQlmyZIAcxgJdB0DXk5GBDr3rrixmiSys76qCRnMVhQVB0ApZRu0Z99dv8v-H2_enWyilmkOMrOiEBYJ9k4RLe-hAI6u2uyZlf962BW5Wf1u9xFkZM-N3g_NLlPaNVAdSSelStFBOuqmEUXjMTfjSG6N80yGx3s0WDIm3zDnRG3bnaUPhERnIoqrg)'"
        >
          <div class="showcase-copy">
            <span class="inline-label">Create account</span>
            <h1>Join the FairPlay network.</h1>
            <p>Register as a player or owner and start using the live user, booking, and venue APIs.</p>
          </div>
        </div>

        <div class="auth-form-shell">
          <div class="muted-grid" style="margin-bottom: 1.5rem;">
            <h2>Register</h2>
            <p>Create a player or owner account</p>
          </div>
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

            <mat-form-field appearance="fill">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>

            <p class="form-error" *ngIf="message()">{{ message() }}</p>
            <button mat-flat-button color="primary" type="submit">Create account</button>
            <a mat-button routerLink="/login">Already have an account?</a>
          </form>
        </div>
      </div>
    </section>
  `
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FairplayStore);
  private readonly router = inject(Router);

  protected readonly message = signal('');
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
    role: ['USER' as Role, Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.message.set('Fill in all required fields with valid values.');
      return;
    }

    try {
      await this.store.register(this.form.getRawValue());
      await this.router.navigateByUrl('/');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'Registration failed.');
    }
  }
}

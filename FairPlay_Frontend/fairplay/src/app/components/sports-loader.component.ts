import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RequestLoaderService } from '../services/request-loader.service';

@Component({
  selector: 'app-sports-loader',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loader-backdrop" *ngIf="loader.isVisible()" aria-live="polite" aria-busy="true">
      <section class="loader-panel">
        <div class="loader-copy">
          <span class="loader-badge">Render warm-up in progress</span>
          <h2>Warming up the arena</h2>
          <p>{{ loader.currentCaption() }}</p>
        </div>

        <div class="loader-stage" aria-hidden="true">
          <div class="loader-goal loader-goal-left"></div>
          <div class="loader-goal loader-goal-right"></div>

          <div class="sport-icon sport-icon-soccer">
            <mat-icon>sports_soccer</mat-icon>
          </div>
          <div class="sport-icon sport-icon-tennis">
            <mat-icon>sports_tennis</mat-icon>
          </div>
          <div class="sport-icon sport-icon-basketball">
            <mat-icon>sports_basketball</mat-icon>
          </div>
        </div>

        <div class="loader-footer">
          <div class="loader-pulse" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span>
            {{ loader.queuedRequests() }} live request{{ loader.queuedRequests() === 1 ? '' : 's' }}
          </span>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .loader-backdrop {
        position: fixed;
        inset: 0;
        z-index: 140;
        display: grid;
        place-items: center;
        padding: 1.5rem;
        background:
          radial-gradient(circle at top, rgba(33, 194, 113, 0.22), transparent 28%),
          linear-gradient(160deg, rgba(6, 21, 16, 0.82), rgba(2, 77, 44, 0.74));
        backdrop-filter: blur(12px);
      }

      .loader-panel {
        width: min(34rem, 100%);
        padding: 1.75rem;
        border-radius: 1.8rem;
        color: #f3fff8;
        background:
          linear-gradient(180deg, rgba(8, 33, 23, 0.96), rgba(6, 54, 35, 0.92)),
          linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
        border: 1px solid rgba(180, 255, 213, 0.18);
        box-shadow:
          0 28px 90px rgba(0, 0, 0, 0.38),
          inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }

      .loader-copy {
        display: grid;
        gap: 0.7rem;
        margin-bottom: 1.25rem;
      }

      .loader-badge {
        width: fit-content;
        padding: 0.4rem 0.75rem;
        border-radius: 999px;
        background: rgba(197, 255, 222, 0.12);
        color: #bff4d1;
        font-size: 0.75rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .loader-copy h2 {
        margin: 0;
        color: #ffffff;
        font-size: clamp(1.7rem, 4vw, 2.3rem);
        letter-spacing: -0.05em;
      }

      .loader-copy p {
        margin: 0;
        color: rgba(236, 252, 242, 0.84);
        font-size: 0.98rem;
      }

      .loader-stage {
        position: relative;
        overflow: hidden;
        min-height: 14rem;
        border-radius: 1.5rem;
        background:
          linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0, rgba(255, 255, 255, 0.06) 0.35rem, transparent 0.35rem, transparent 3.2rem),
          linear-gradient(180deg, rgba(18, 115, 68, 0.92), rgba(5, 67, 38, 0.96));
        background-size: 3.2rem 100%, 100% 100%;
        border: 1px solid rgba(191, 244, 209, 0.12);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
      }

      .loader-stage::before,
      .loader-stage::after {
        content: '';
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        pointer-events: none;
      }

      .loader-stage::before {
        inset: 0 auto 0 50%;
        width: 2px;
        background: rgba(233, 255, 244, 0.32);
      }

      .loader-stage::after {
        top: 50%;
        width: 5.6rem;
        height: 5.6rem;
        border-radius: 50%;
        border: 2px solid rgba(233, 255, 244, 0.32);
        transform: translate(-50%, -50%);
      }

      .loader-goal {
        position: absolute;
        top: 50%;
        width: 1rem;
        height: 3.7rem;
        transform: translateY(-50%);
        border: 2px solid rgba(255, 255, 255, 0.26);
        border-radius: 0.55rem;
      }

      .loader-goal-left {
        left: 0.75rem;
        border-right: 0;
      }

      .loader-goal-right {
        right: 0.75rem;
        border-left: 0;
      }

      .sport-icon {
        position: absolute;
        display: grid;
        place-items: center;
        width: 3.35rem;
        height: 3.35rem;
        border-radius: 50%;
        color: #ffffff;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow:
          0 12px 26px rgba(0, 0, 0, 0.24),
          inset 0 1px 0 rgba(255, 255, 255, 0.12);
      }

      .sport-icon mat-icon {
        width: 1.8rem;
        height: 1.8rem;
        font-size: 1.8rem;
      }

      .sport-icon-soccer {
        top: 58%;
        left: -14%;
        animation: loader-soccer 2.1s infinite ease-in-out;
      }

      .sport-icon-tennis {
        top: 20%;
        left: -16%;
        animation: loader-tennis 2s 0.28s infinite ease-in-out;
      }

      .sport-icon-basketball {
        top: 38%;
        left: -15%;
        animation: loader-basketball 2.25s 0.48s infinite ease-in-out;
      }

      .loader-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1rem;
        color: rgba(236, 252, 242, 0.82);
        font-size: 0.88rem;
      }

      .loader-pulse {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .loader-pulse span {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 50%;
        background: #c3ffd8;
        animation: loader-pulse 0.9s infinite ease-in-out;
      }

      .loader-pulse span:nth-child(2) {
        animation-delay: 0.15s;
      }

      .loader-pulse span:nth-child(3) {
        animation-delay: 0.3s;
      }

      @keyframes loader-soccer {
        0% {
          left: -14%;
          transform: translateY(0.5rem) scale(0.85) rotate(0deg);
          opacity: 0;
        }
        12% {
          opacity: 1;
        }
        28% {
          transform: translateY(-0.9rem) scale(1) rotate(120deg);
        }
        50% {
          left: 36%;
          transform: translateY(0.7rem) scale(1.04) rotate(220deg);
        }
        72% {
          transform: translateY(-0.8rem) scale(1) rotate(320deg);
        }
        100% {
          left: 88%;
          transform: translateY(0.6rem) scale(0.92) rotate(420deg);
          opacity: 0;
        }
      }

      @keyframes loader-tennis {
        0% {
          left: -16%;
          transform: translateY(0.35rem) scale(0.72);
          opacity: 0;
        }
        15% {
          opacity: 1;
        }
        35% {
          transform: translateY(-1rem) scale(0.95);
        }
        55% {
          left: 42%;
          transform: translateY(0.3rem) scale(1.05);
        }
        80% {
          transform: translateY(-0.9rem) scale(0.92);
        }
        100% {
          left: 92%;
          transform: translateY(0.4rem) scale(0.72);
          opacity: 0;
        }
      }

      @keyframes loader-basketball {
        0% {
          left: -15%;
          transform: translateY(0.65rem) scale(0.84) rotate(0deg);
          opacity: 0;
        }
        14% {
          opacity: 1;
        }
        34% {
          transform: translateY(-1.2rem) scale(1.02) rotate(75deg);
        }
        56% {
          left: 46%;
          transform: translateY(0.45rem) scale(0.98) rotate(180deg);
        }
        78% {
          transform: translateY(-1rem) scale(1.04) rotate(265deg);
        }
        100% {
          left: 90%;
          transform: translateY(0.75rem) scale(0.86) rotate(360deg);
          opacity: 0;
        }
      }

      @keyframes loader-pulse {
        0%,
        80%,
        100% {
          opacity: 0.35;
          transform: translateY(0);
        }
        40% {
          opacity: 1;
          transform: translateY(-0.28rem);
        }
      }

      @media (max-width: 720px) {
        .loader-panel {
          padding: 1.25rem;
        }

        .loader-stage {
          min-height: 12rem;
        }

        .loader-footer {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `
  ]
})
export class SportsLoaderComponent {
  protected readonly loader = inject(RequestLoaderService);
}

import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RequestLoaderService {
  private readonly captions = [
    'Waking up the gateway and backend services...',
    'Checking live venue availability from the field...',
    'Pulling the next community match into the feed...',
    'Getting the owner dashboard ready for kickoff...'
  ];
  private readonly activeRequests = signal(0);
  private readonly visibleState = signal(false);
  private readonly captionIndex = signal(0);
  private readonly showDelayMs = 180;
  private readonly minimumVisibleMs = 650;
  private shownAt = 0;
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private captionTimer?: ReturnType<typeof setInterval>;

  readonly isVisible = computed(() => this.visibleState());
  readonly queuedRequests = computed(() => this.activeRequests());
  readonly currentCaption = computed(() => this.captions[this.captionIndex()]);

  start(): void {
    this.clearHideTimer();
    const nextCount = this.activeRequests() + 1;
    this.activeRequests.set(nextCount);

    if (nextCount === 1) {
      this.scheduleShow();
    }
  }

  stop(): void {
    const nextCount = Math.max(0, this.activeRequests() - 1);
    this.activeRequests.set(nextCount);

    if (nextCount === 0) {
      this.scheduleHide();
    }
  }

  private scheduleShow(): void {
    if (this.visibleState()) {
      return;
    }

    this.clearShowTimer();
    this.showTimer = setTimeout(() => {
      if (this.activeRequests() === 0 || this.visibleState()) {
        return;
      }

      this.visibleState.set(true);
      this.shownAt = Date.now();
      this.startCaptionRotation();
    }, this.showDelayMs);
  }

  private scheduleHide(): void {
    this.clearShowTimer();

    const elapsed = Date.now() - this.shownAt;
    const delay = this.visibleState() ? Math.max(0, this.minimumVisibleMs - elapsed) : 0;

    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      if (this.activeRequests() > 0) {
        return;
      }

      this.visibleState.set(false);
      this.stopCaptionRotation();
    }, delay);
  }

  private startCaptionRotation(): void {
    this.stopCaptionRotation();
    this.captionIndex.set(0);
    this.captionTimer = setInterval(() => {
      this.captionIndex.update((index) => (index + 1) % this.captions.length);
    }, 1600);
  }

  private stopCaptionRotation(): void {
    if (this.captionTimer) {
      clearInterval(this.captionTimer);
      this.captionTimer = undefined;
    }
  }

  private clearShowTimer(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }
  }

  private clearHideTimer(): void {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }
}

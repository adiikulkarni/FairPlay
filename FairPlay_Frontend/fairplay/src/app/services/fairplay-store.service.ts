import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import {
  Activity,
  Booking,
  LoginRequest,
  OwnerDashboardResponse,
  UserRegistrationRequest,
  UserResponse,
  UserUpdateRequest,
  Venue
} from '../models';

@Injectable({ providedIn: 'root' })
export class FairplayStore {
  private readonly http = inject(HttpClient);
  private readonly sessionKey = 'fairplay.currentUser';
  private readonly apiBase = this.resolveApiBase();

  readonly currentUser = signal<UserResponse | null>(this.readStoredUser());
  readonly venues = signal<Venue[]>([]);
  readonly activities = signal<Activity[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly ownerDashboard = signal<OwnerDashboardResponse | null>(null);
  readonly loadingVenues = signal(false);
  readonly loadingActivities = signal(false);
  readonly loadingBookings = signal(false);
  readonly bootstrapError = signal('');

  constructor() {
    void this.initialize();

    const user = this.currentUser();
    if (user) {
      void this.refreshCurrentUser(user.id).catch(() => undefined);
      void this.loadBookings(user.id).catch(() => undefined);
      void this.loadOwnerDashboardIfNeeded().catch(() => undefined);
    }
  }

  async register(request: UserRegistrationRequest): Promise<UserResponse> {
    const user = await this.request(() => this.http.post<UserResponse>(this.url('/users'), request));
    await this.establishSession(user);
    return this.currentUser()!;
  }

  async login(request: LoginRequest): Promise<UserResponse> {
    const user = await this.request(() => this.http.post<UserResponse>(this.url('/users/login'), request));
    await this.establishSession(user);
    return this.currentUser()!;
  }

  async updateProfile(userId: number, request: UserUpdateRequest): Promise<UserResponse> {
    const user = await this.request(() => this.http.put<UserResponse>(this.url(`/users/${userId}`), request));
    await this.establishSession(user);
    return this.currentUser()!;
  }

  async loadVenues(filters?: { location?: string; sportType?: string }): Promise<void> {
    this.loadingVenues.set(true);
    try {
      let params = new HttpParams();
      if (filters?.location) {
        params = params.set('location', filters.location);
      }
      if (filters?.sportType) {
        params = params.set('sportType', filters.sportType);
      }

      const venues = await this.request(() => this.http.get<Venue[]>(this.url('/venues'), { params }));
      this.venues.set(venues);
    } finally {
      this.loadingVenues.set(false);
    }
  }

  async loadActivities(): Promise<void> {
    this.loadingActivities.set(true);
    try {
      const activities = await this.request(() => this.http.get<Activity[]>(this.url('/activities')));
      this.activities.set(activities);
    } finally {
      this.loadingActivities.set(false);
    }
  }

  async loadBookings(userId: number): Promise<void> {
    this.loadingBookings.set(true);
    try {
      const bookings = await this.request(() => this.http.get<Booking[]>(this.url(`/bookings/${userId}`)));
      this.bookings.set(bookings);
    } finally {
      this.loadingBookings.set(false);
    }
  }

  async createBooking(payload: { venueId: number; slotTime: string; durationHours: number }): Promise<void> {
    const user = this.requireUser();
    await this.request(() =>
      this.http.post<Booking>(this.url('/bookings'), {
        userId: user.id,
        venueId: payload.venueId,
        slotTime: this.toIsoLocal(payload.slotTime),
        durationHours: payload.durationHours
      })
    );
    await this.loadBookings(user.id);
    await this.loadOwnerDashboardIfNeeded();
  }

  async cancelBooking(bookingId: number): Promise<void> {
    const user = this.requireUser();
    await this.request(() => this.http.put<Booking>(this.url(`/bookings/${bookingId}`), { status: 'CANCELLED' }));
    await this.loadBookings(user.id);
    await this.loadOwnerDashboardIfNeeded();
  }

  async hostActivity(payload: { sportType: string; location: string; time: string }): Promise<void> {
    const user = this.requireUser();
    await this.request(() =>
      this.http.post<Activity>(this.url('/activities/host'), {
        hostUserId: user.id,
        sportType: payload.sportType,
        location: payload.location,
        time: this.toIsoLocal(payload.time)
      })
    );
    await this.loadActivities();
  }

  async joinActivity(activityId: number): Promise<void> {
    const user = this.requireUser();
    await this.request(() => this.http.post<Activity>(this.url('/activities/join'), { activityId, userId: user.id }));
    await this.loadActivities();
  }

  async createVenue(payload: { name: string; location: string; sportType: string; pricePerHour: number }): Promise<void> {
    const user = this.requireOwner();
    await this.request(() =>
      this.http.post<Venue>(this.url('/venues'), {
        ...payload,
        ownerId: user.id
      })
    );
    await this.loadVenues();
    await this.loadOwnerDashboardIfNeeded();
  }

  async loadOwnerDashboardIfNeeded(): Promise<void> {
    const user = this.currentUser();
    if (!user || user.role !== 'OWNER') {
      this.ownerDashboard.set(null);
      return;
    }

    const dashboard = await this.request(() => this.http.get<OwnerDashboardResponse>(this.url(`/owners/${user.id}/dashboard`)));
    this.ownerDashboard.set(dashboard);
  }

  logout(): void {
    this.currentUser.set(null);
    this.bookings.set([]);
    this.ownerDashboard.set(null);
    localStorage.removeItem(this.sessionKey);
  }

  private async establishSession(user: UserResponse): Promise<void> {
    await this.refreshCurrentUser(user.id, user);
    await this.loadBookings(user.id);
    await this.loadOwnerDashboardIfNeeded();
  }

  private async refreshCurrentUser(userId: number, fallbackUser?: UserResponse): Promise<void> {
    try {
      const user = await this.request(() => this.http.get<UserResponse>(this.url(`/users/${userId}`)));
      this.currentUser.set(user);
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
    } catch (error) {
      if (fallbackUser) {
        this.currentUser.set(fallbackUser);
        localStorage.setItem(this.sessionKey, JSON.stringify(fallbackUser));
        return;
      }
      throw error;
    }
  }

  private requireUser(): UserResponse {
    const user = this.currentUser();
    if (!user) {
      throw new Error('Log in before using this page.');
    }
    return user;
  }

  private requireOwner(): UserResponse {
    const user = this.requireUser();
    if (user.role !== 'OWNER') {
      throw new Error('This action requires an owner account.');
    }
    return user;
  }

  private readStoredUser(): UserResponse | null {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      localStorage.removeItem(this.sessionKey);
      return null;
    }
  }

  private toIsoLocal(value: string): string {
    return value.includes(':00') && value.length === 16 ? `${value}:00` : value;
  }

  private async initialize(): Promise<void> {
    try {
      await Promise.all([this.loadVenues(), this.loadActivities()]);
      this.bootstrapError.set('');
    } catch (error) {
      this.bootstrapError.set(this.extractError(error));
    }
  }

  private async request<T>(factory: () => Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(factory());
    } catch (error) {
      throw new Error(this.extractError(error));
    }
  }

  private extractError(error: unknown): string {
    if (error instanceof Error && !(error instanceof HttpErrorResponse)) {
      return error.message;
    }

    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.status === 404) {
        return 'Gateway route was not found. Start the gateway on http://localhost:8083 or update the frontend API base.';
      }
      if (error.status === 0) {
        return 'Backend is unreachable. Start the gateway and services first.';
      }
    }

    return 'Something went wrong while talking to the backend.';
  }

  private url(path: string): string {
    return `${this.apiBase}${path}`;
  }

  private resolveApiBase(): string {
    if (typeof window === 'undefined') {
      return 'http://localhost:8083';
    }

    return window.location.port === '4200' ? '' : 'http://localhost:8083';
  }
}

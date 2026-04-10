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
  Venue,
  AuthResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class FairplayStore {
  private readonly http = inject(HttpClient);
  private readonly sessionKey = 'fairplay.currentUser';
  private readonly apiBase = this.resolveApiBase();

  readonly currentUser = signal<UserResponse | null>(this.readStoredUser());
  readonly venues = signal<Venue[]>([]);
  readonly ownerVenues = signal<Venue[]>([]);
  readonly activities = signal<Activity[]>([]);
  readonly bookings = signal<Booking[]>([]);
  readonly ownerDashboard = signal<OwnerDashboardResponse | null>(null);
  readonly loadingVenues = signal(false);
  readonly loadingOwnerVenues = signal(false);
  readonly loadingActivities = signal(false);
  readonly loadingBookings = signal(false);
  readonly ownerBookings = signal<Booking[]>([]);
  readonly loadingOwnerBookings = signal(false);
  readonly bootstrapError = signal('');
  private readonly userCache = new Map<number, UserResponse>();
  private readonly tokenKey = 'fairplay.jwt';

  constructor() {
    void this.initialize();

    const token = localStorage.getItem(this.tokenKey);
    const user = this.currentUser();

    if (!token) {
      this.currentUser.set(null);
      localStorage.removeItem(this.sessionKey);
      return;
    }

    if (user) {
      void this.refreshCurrentUser().catch(() => this.logout());
      void this.loadBookings(user.id).catch(() => undefined);
      void this.loadOwnerVenues().catch(() => undefined);
      void this.loadOwnerDashboardIfNeeded().catch(() => undefined);
    }
  }

  async register(request: UserRegistrationRequest): Promise<UserResponse> {
    await this.request(() => this.http.post<UserResponse>(this.url('/users'), request));
    return this.login({ email: request.email, password: request.password });
  }

  async login(request: LoginRequest): Promise<UserResponse> {
    const auth = await this.request(() => this.http.post<AuthResponse>(this.url('/users/login'), request));
    localStorage.setItem(this.tokenKey, auth.token);
    await this.establishSession();
    return this.requireUser();
  }

  async updateProfile(userId: number, request: UserUpdateRequest): Promise<UserResponse> {
    await this.request(() => this.http.put<UserResponse>(this.url(`/users/${userId}`), request));
    await this.establishSession();
    return this.requireUser();
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
      const enriched = await this.enrichActivitiesWithUsers(activities);
      this.activities.set(enriched);
    } finally {
      this.loadingActivities.set(false);
    }
  }

  async loadOwnerVenues(): Promise<void> {
    const user = this.currentUser();
    if (!user || user.role !== 'OWNER') {
      this.ownerVenues.set([]);
      return;
    }
    this.loadingOwnerVenues.set(true);
    try {
      const venues = await this.request(() => this.http.get<Venue[]>(this.url(`/owners/${user.id}/venues`)));
      this.ownerVenues.set(venues);
    } finally {
      this.loadingOwnerVenues.set(false);
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

  async loadOwnerBookings(): Promise<void> {
    const user = this.currentUser();
    if (!user || user.role !== 'OWNER') {
      this.ownerBookings.set([]);
      return;
    }
    this.loadingOwnerBookings.set(true);
    try {
      const bookings = await this.request(() => this.http.get<Booking[]>(this.url(`/owners/${user.id}/bookings`)));
      const enriched = await this.enrichBookingsWithUsers(bookings);
      const withVenueNames = this.attachVenueNames(enriched);
      this.ownerBookings.set(withVenueNames);
    } finally {
      this.loadingOwnerBookings.set(false);
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
    await this.loadOwnerBookings();
  }

  async cancelBooking(bookingId: number): Promise<void> {
    const user = this.requireUser();
    await this.request(() => this.http.put<Booking>(this.url(`/bookings/${bookingId}`), { status: 'CANCELLED' }));
    await this.loadBookings(user.id);
    await this.loadOwnerDashboardIfNeeded();
    await this.loadOwnerBookings();
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

  async createVenue(payload: { name: string; location: string; sportType: string; pricePerHour: number, amenities: string[],about: string; }): Promise<void> {
    const user = this.requireOwner();
    await this.request(() =>
      this.http.post<Venue>(this.url('/venues'), {
        ...payload,
        ownerId: user.id
      })
    );
    await this.loadOwnerVenues();
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
    this.ownerVenues.set([]);
    this.ownerBookings.set([]);
    this.ownerDashboard.set(null);
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.tokenKey);
  }

  private async establishSession(): Promise<void> {
   await this.refreshCurrentUser();
   const currentUser = this.requireUser();
   await this.loadBookings(currentUser.id);
   await this.loadOwnerVenues();
   await this.loadOwnerDashboardIfNeeded();
  }

  private async refreshCurrentUser(): Promise<void> {
    const user = await this.request(() => this.http.get<UserResponse>(this.url('/users/me')));
    this.currentUser.set(user);
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
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
      if (error.status === 401) {
        return 'Session expired or login required.';
      }
      if (error.status === 403) {
        return 'You are not allowed to perform this action.';
      }
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }
      if (error.error?.message) {
        return error.error.message;
      }
      if (error.status === 404) {
        return 'The requested API route was not found.';
      }
      if (error.status === 0) {
        return 'Backend is unreachable.';
      }
    }

    return 'Something went wrong while talking to the backend.';
  }

  private url(path: string): string {
    return `${this.apiBase}${path}`;
  }

  private async fetchUserById(userId: number): Promise<UserResponse> {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId)!;
    }
    const user = await this.request(() => this.http.get<UserResponse>(this.url(`/users/${userId}`)));
    this.userCache.set(userId, user);
    return user;
  }

  private async enrichBookingsWithUsers(bookings: Booking[]): Promise<Booking[]> {
    return Promise.all(
      bookings.map(async (booking) => {
        try {
          const user = await this.fetchUserById(booking.userId);
          return { ...booking, bookedBy: user };
        } catch {
          return booking;
        }
      })
    );
  }

  private attachVenueNames(bookings: Booking[]): Booking[] {
    return bookings.map((booking) => ({
      ...booking,
      venueName: this.findVenueName(booking.venueId) ?? booking.venueName
    }));
  }

  private async enrichActivitiesWithUsers(activities: Activity[]): Promise<Activity[]> {
    return Promise.all(
      activities.map(async (activity) => {
        const participantIds: number[] = activity.participantIds ?? [];

        const uniqueIds = new Set<number>([activity.hostUserId, ...participantIds]);
        const participants: Activity['participants'] = [];

        for (const id of uniqueIds) {
          try {
            const user = await this.fetchUserById(id);
            participants.push({ id: user.id, name: user.name, email: user.email, phone: user.phone });
          } catch {
            // ignore failures; keep existing data
          }
        }

        if (participants.length === 0) {
          return activity;
        }

        return { ...activity, participants };
      })
    );
  }

  private resolveApiBase(): string {
    return '';
  }

  private findVenueName(venueId: number): string | undefined {
    return this.ownerVenues().find((venue) => venue.id === venueId)?.name
      ?? this.venues().find((venue) => venue.id === venueId)?.name;
  }
}

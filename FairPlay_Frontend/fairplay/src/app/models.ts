export type Role = 'USER' | 'OWNER';
export type BookingStatus = 'BOOKED' | 'CANCELLED';

export interface ActivityParticipant {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
}

export interface Venue {
  id: number;
  name: string;
  location: string;
  sportType: string;
  pricePerHour: number;
  ownerId?: number;
   amenities?: string[];
  about?: string;
}

export interface Activity {
  id: number;
  hostUserId: number;
  sportType: string;
  location: string;
  time: string;
  participantCount: number;
  participantIds: number[];
  participants?: ActivityParticipant[];
}

export interface Booking {
  id: number;
  userId: number;
  venueId: number;
  slotTime: string;
  status: BookingStatus;
  durationHours: number;
  totalPrice: number;
  bookedBy?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  venueName?: string;
}

export interface OwnerDashboardResponse {
  totalVenues: number;
  activeBookings: number;
  cancelledBookings: number;
  totalEarnings: number;
}

export interface UserRegistrationRequest {
  name: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserUpdateRequest {
  name: string;
  email: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
}

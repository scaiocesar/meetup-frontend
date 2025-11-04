export interface User {
  id: number;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Meetup {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  imageUrl?: string;
  createdByName: string;
  createdById: number;
  createdAt: string;
  updatedAt?: string;
  confirmedCount: number;
  waitlistCount: number;
  isUserRSVPed: boolean;
  userRSVPStatus?: 'CONFIRMED' | 'WAITLISTED';
}

export interface RSVP {
  id: number;
  user: User;
  meetup: Meetup;
  status: 'CONFIRMED' | 'WAITLISTED';
  rsvpedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface ApiError {
  error: string;
}


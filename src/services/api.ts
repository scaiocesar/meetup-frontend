import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest, Meetup, RSVP } from '../types';
import toast from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        const message = error.response?.data?.error || error.message || 'An error occurred';
        toast.error(message);
        
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/api/auth/register', userData);
    return response.data;
  }

  // Meetup endpoints
  async getMeetups(): Promise<Meetup[]> {
    const response: AxiosResponse<Meetup[]> = await this.api.get('/api/meetups');
    return response.data;
  }

  async getMeetup(id: number): Promise<Meetup> {
    const response: AxiosResponse<Meetup> = await this.api.get(`/api/meetups/${id}`);
    return response.data;
  }

  async createMeetup(meetup: Partial<Meetup>): Promise<Meetup> {
    const response: AxiosResponse<Meetup> = await this.api.post('/api/meetups', meetup);
    return response.data;
  }

  async updateMeetup(id: number, meetup: Partial<Meetup>): Promise<Meetup> {
    const response: AxiosResponse<Meetup> = await this.api.put(`/api/meetups/${id}`, meetup);
    return response.data;
  }

  async deleteMeetup(id: number): Promise<void> {
    await this.api.delete(`/api/meetups/${id}`);
  }

  // RSVP endpoints
  async rsvpToMeetup(meetupId: number): Promise<{ message: string; status: string }> {
    const response: AxiosResponse<{ message: string; status: string }> = await this.api.post(`/api/meetups/${meetupId}/rsvp`);
    return response.data;
  }

  async cancelRSVP(meetupId: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(`/api/meetups/${meetupId}/rsvp`);
    return response.data;
  }

  async getMeetupAttendees(meetupId: number): Promise<RSVP[]> {
    const response: AxiosResponse<RSVP[]> = await this.api.get(`/api/meetups/${meetupId}/attendees`);
    return response.data;
  }

  // Image upload endpoint
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<{ url: string }> = await this.api.post('/api/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Return full URL with base URL
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    return baseURL + response.data.url;
  }
}

export const apiService = new ApiService();


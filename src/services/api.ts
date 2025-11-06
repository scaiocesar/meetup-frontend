import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest, Meetup, RSVP } from '../types';
import toast from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Get API URL from environment variable
    // In development: use .env.local (http://localhost:8080)
    // In production: use .env.production (https://pg21wf8ude.execute-api.us-east-1.amazonaws.com/)
    let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    
    // Remove trailing slash to avoid double slashes in URLs
    apiUrl = apiUrl.replace(/\/$/, '');
    this.baseURL = apiUrl;
    
    this.api = axios.create({
      baseURL: apiUrl,
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
        
        // Only show toast if not a delete operation (we handle delete errors in component)
        const isDeleteRequest = error.config?.method === 'delete' && error.config?.url?.includes('/api/meetups/');
        if (!isDeleteRequest) {
          const message = error.response?.data?.error || error.message || 'An error occurred';
          toast.error(message);
        }
        
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
    const response = await this.api.delete(`/api/meetups/${id}`, {
      validateStatus: () => true,
    });
    
    if (response.status >= 400) {
      const error = response.data?.error || 'Failed to delete meetup';
      throw new Error(error);
    }
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

  // Image upload endpoint - returns image data and content type (for preview)
  async uploadImage(file: File): Promise<{ imageData: string; contentType: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: AxiosResponse<{ imageData: string; contentType: string }> = await this.api.post('/api/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  // Upload image for a specific meetup
  async uploadMeetupImage(meetupId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    
    await this.api.put(`/api/images/meetup/${meetupId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Helper method to get full image URL
  getImageUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;
    // If imageUrl is already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If imageUrl is a relative path starting with /api/images/, construct full URL
    if (imageUrl.startsWith('/api/images/')) {
      return `${this.baseURL}${imageUrl}`;
    }
    // Otherwise return as-is (might be an old URL format)
    return imageUrl;
  }
}

export const apiService = new ApiService();


import axios from 'axios';
import { supabase } from './supabase';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add interceptor to include auth token
axiosInstance.interceptors.request.use(async (config) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  } catch (error) {
    console.error('Auth session error:', error);
    return config;
  }
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session) {
          throw refreshError || new Error('Failed to refresh session');
        }

        // Update the Authorization header with the new token
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        
        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Session refresh error:', refreshError);
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
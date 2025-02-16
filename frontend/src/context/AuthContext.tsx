import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.access_token) {
        // Set the authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        
        try {
          // Fetch user data
          const response = await axios.get('http://localhost:3000/api/auth/me');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
          setIsAuthenticated(false);
          delete axios.defaults.headers.common['Authorization'];
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        delete axios.defaults.headers.common['Authorization'];
      }
    });

    // Check for existing session on mount
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        try {
          const response = await axios.get('http://localhost:3000/api/auth/me');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Session init error:', error);
          setUser(null);
          setIsAuthenticated(false);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
    };

    initSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data: authData, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (supabaseError) throw supabaseError;

      if (!authData.session?.access_token) {
        throw new Error('No access token received');
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${authData.session.access_token}`;
      
      const response = await axios.get('http://localhost:3000/api/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
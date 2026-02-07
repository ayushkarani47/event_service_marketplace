'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'customer' | 'service_provider' | 'admin';
  profilePicture?: string;
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Phone OTP auth
  sendPhoneOtp: (phone: string) => Promise<boolean>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<boolean>;
  completePhoneRegistration: (userData: CompleteRegistrationData) => Promise<boolean>;
  phoneLogin: (phone: string, otp: string) => Promise<boolean>;
  // Legacy auth methods (kept for compatibility)
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  loginWithOtpEmail: (email: string) => Promise<boolean>;
  loginWithOtpPhone: (phone: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'customer' | 'service_provider';
}

interface CompleteRegistrationData {
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: 'customer' | 'service_provider';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // Try to restore from localStorage first (client-side only)
      try {
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('auth_user');
          const storedToken = localStorage.getItem('auth_token');
          
          if (storedUser && storedToken) {
            console.log('Restoring auth from localStorage');
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to restore auth from localStorage:', err);
      }

      // Fall back to Supabase session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      handleSession(session);
      setIsLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapUser = (sbUser: SupabaseUser): User => {
    const md = sbUser.user_metadata || {};
    return {
      id: sbUser.id,
      phone: md.phone || sbUser.phone || '',
      email: sbUser.email,
      firstName: md.firstName,
      lastName: md.lastName,
      role: md.role,
      profilePicture: md.profilePicture,
      bio: md.bio,
      address: md.address,
    };
  };

  const handleSession = (session: Session | null) => {
    if (session) {
      setToken(session.access_token);
      const mappedUser = mapUser(session.user);
      setUser(mappedUser);
      // Persist to localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', session.access_token);
        localStorage.setItem('auth_user', JSON.stringify(mappedUser));
      }
    } else {
      setToken(null);
      setUser(null);
      // Clear localStorage (client-side only)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const { data, error: sbError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sbError) {
      setError(sbError.message);
      setIsLoading(false);
      return false;
    }

    handleSession(data.session);
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const loginWithOtpEmail = async (email: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
      return false;
    }
    return true;
  };

  const loginWithOtpPhone = async (phone: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setError(error.message);
      return false;
    }
    return true;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const { error: sbError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        },
      },
    });

    if (sbError) {
      setError(sbError.message);
      setIsLoading(false);
      return false;
    }

    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
    // Clear localStorage (client-side only)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    router.push('/login');
  };

  const refreshToken = async (): Promise<boolean> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    handleSession(session);
    return !!session;
  };

  const clearError = () => {
    setError(null);
  };

  // Phone OTP Authentication Methods
  const sendPhoneOtp = async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to send OTP');
        setIsLoading(false);
        return false;
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const verifyPhoneOtp = async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to verify OTP');
        setIsLoading(false);
        return false;
      }

      // Store the verified phone in session storage for the next step
      sessionStorage.setItem('verified_phone', phone);

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const phoneLogin = async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to login');
        setIsLoading(false);
        return false;
      }

      // Set the user from response
      if (data.user) {
        const user: User = {
          id: data.user.id,
          phone: data.user.phone,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          role: data.user.role,
        };
        setUser(user);
        // Use JWT token if available, otherwise use user ID
        const authToken = data.token || data.user.id;
        setToken(authToken);
        
        // Persist to localStorage (client-side only)
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_user', JSON.stringify(user));
          localStorage.setItem('auth_token', authToken);
        }
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to login';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const completePhoneRegistration = async (userData: CompleteRegistrationData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/complete-phone-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to complete registration');
        setIsLoading(false);
        return false;
      }

      // Clear the verified phone from session storage
      sessionStorage.removeItem('verified_phone');

      // Get the session from Supabase auth
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        handleSession(session);
      } else if (data.user) {
        // Fallback: set user from response if session not available
        const user: User = {
          id: data.user.id,
          phone: data.user.phone,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          role: data.user.role,
        };
        setUser(user);
        setToken(data.user.id);
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete registration';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        sendPhoneOtp,
        verifyPhoneOtp,
        completePhoneRegistration,
        phoneLogin,
        login,
        loginWithGoogle,
        loginWithOtpEmail,
        loginWithOtpPhone,
        register,
        logout,
        error,
        clearError,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
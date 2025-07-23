'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/data';
import { URLS } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (personalNumber: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define a type for the decoded JWT payload
interface DecodedToken {
  personal_number: string;
  name: string;
  roles: string[];
  exp: number;
}

const parseJwt = (token: string): User | null => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        logger.log('Decoded JWT:', decoded);
        // Check if the token has expired
        if (decoded.exp * 1000 < Date.now()) {
            logger.warn('JWT has expired.');
            return null;
        }
        return {
            id: decoded.personal_number,
            personalNumber: decoded.personal_number,
            name: decoded.name,
            roles: decoded.roles,
            role: decoded.roles.includes('ROLE_SUPERVISOR') ? 'Supervisor' : 'Operator',
        };
    } catch (error) {
        logger.error("Failed to decode JWT:", error);
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const initAuth = useCallback(() => {
    setLoading(true);
    const storedToken = localStorage.getItem('authToken');
    logger.log('Initializing auth, token from storage:', storedToken);
    if (storedToken) {
      const userData = parseJwt(storedToken);
      if (userData) {
        logger.log('User data parsed from token:', userData);
        setUser(userData);
        setToken(storedToken);
      } else {
        // Token is invalid or expired
        logger.warn('Token is invalid or expired, clearing auth state.');
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initAuth();
    
    // Listen for storage changes to sync across tabs
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'authToken') {
            logger.log('Auth token changed in another tab, re-initializing auth.');
            initAuth();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [initAuth]);

  const login = async (personalNumber: string, password: string) => {
    try {
        logger.log(`Attempting login for user: ${personalNumber}`);
        const response = await fetch(URLS.Auth, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ username: personalNumber, password }),
        });

        if (!response.ok) {
          logger.error('Authentication failed with status:', response.status);
          const errorData = await response.text();
          throw new Error(errorData || 'Authentication failed');
        }

        const data = await response.json();
        const { token: newToken } = data;
        
        logger.log('Login successful, received token.');
        localStorage.setItem('authToken', newToken);
        const newUser = parseJwt(newToken);
        setUser(newUser);
        setToken(newToken);
    } catch (error: any) {
        logger.error('Login request failed:', error);
        // If it's a network error, the message might be more generic
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Could not connect to the server. Please check the network connection and CORS configuration.');
        }
        throw error;
    }
  };

  const logout = () => {
    logger.log('User logging out.');
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/data';
import { URLS } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

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
        // Check if the token has expired
        if (decoded.exp * 1000 < Date.now()) {
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
        console.error("Failed to decode JWT:", error);
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
    if (storedToken) {
      const userData = parseJwt(storedToken);
      if (userData) {
        setUser(userData);
        setToken(storedToken);
      } else {
        // Token is invalid or expired
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
            initAuth();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, [initAuth]);

  const login = async (personalNumber: string, password: string) => {
    const response = await fetch(URLS.Auth, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: personalNumber, password }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json();
    const { token: newToken } = data;
    
    localStorage.setItem('authToken', newToken);
    const newUser = parseJwt(newToken);
    setUser(newUser);
    setToken(newToken);
  };

  const logout = () => {
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

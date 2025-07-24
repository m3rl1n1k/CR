
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getProblems, getUsers, login as apiLogin, getProductionLines } from '@/lib/api';
import type { User, ApiError, LoginCredentials, LoginResponse } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from './use-translation';
import { SessionRenewalModal } from '@/components/auth/session-renewal-modal';
import { logger } from '@/lib/logger';
import { jwtDecode } from 'jwt-decode';

/**
 * Decodes the payload of a JWT token without verifying the signature.
 *
 * @param token The JWT token string.
 * @returns The decoded payload object containing claims like 'exp', or null if decoding fails.
 */
function decodeJwtPayload(token: string): { exp: number; personal_number: string; name: string; roles: string[]; [key: string]: any } | null {
  try {
    const payload = jwtDecode<{ exp: number; personal_number: string; name: string; roles: string[]; }>(token);
    return payload;
  } catch (error) {
    logger.error("Failed to decode JWT", error);
    return null;
  }
}


interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INTENDED_DESTINATION_KEY = 'intended_destination';
const AUTH_TOKEN_KEY = 'production_insights_auth_token';


const augmentUserData = (user: User): User => {
  const isVerified = !!user.verifiedAt;
  return { ...user, isVerified };
};

const PUBLIC_PATHS = ['/login'];
const PUBLIC_REDIRECT_PAGES = ['/login'];

const isPublicPath = (path: string) => PUBLIC_PATHS.some(p => path.startsWith(p));
const isOnPublicRedirectPage = (path: string) => PUBLIC_REDIRECT_PAGES.some(p => path.startsWith(p));


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [expiredTokenEmail, setExpiredTokenEmail] = useState<string | null>(null);
  const isModalOpenRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { t } = useTranslation();

  const clearAuthData = useCallback(() => {
    logger.log('Clearing auth data from state and local storage.');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoading(true);
    logger.log('Logging out...');
    clearAuthData();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(INTENDED_DESTINATION_KEY);
    }
    toast({ title: t('logoutSuccessTitle'), description: t('logoutSuccessDesc') });
    router.push('/login');
    setIsLoading(false);
  }, [router, toast, t, clearAuthData]);

  const handleRenewalClose = useCallback(() => {
    logger.log('Session renewal modal closed by user. Logging out.');
    isModalOpenRef.current = false;
    setIsRenewalModalOpen(false);
    setExpiredTokenEmail(null);
    logout();
  }, [logout]);
  
  const promptSessionRenewal = useCallback(() => {
    if (isPublicPath(pathname)) {
        logger.log('On a public page, not showing renewal modal.');
        return;
    }

    if (!isModalOpenRef.current && (user || localStorage.getItem(AUTH_TOKEN_KEY))) {
        const currentToken = token || localStorage.getItem(AUTH_TOKEN_KEY);
        if (currentToken) {
            const payload = decodeJwtPayload(currentToken);
            setExpiredTokenEmail(payload?.name || null);
        }
        isModalOpenRef.current = true;
        logger.log('Prompting for session renewal.');
        setIsRenewalModalOpen(true);
    }
  }, [user, token, pathname]);

  useEffect(() => {
    const handleSessionExpired = () => {
      promptSessionRenewal();
    };

    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, [promptSessionRenewal]);

  useEffect(() => {
    const checkTokenExpiration = () => {
      if (isModalOpenRef.current) return;

      const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null);
      if (!currentToken) {
        return;
      }

      const payload = decodeJwtPayload(currentToken);
      if (payload && payload.exp) {
        const isExpired = Date.now() >= payload.exp * 1000;
        if (isExpired) {
          logger.log('Token expired based on frontend check.');
          promptSessionRenewal();
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiration, 30000); // Check every 30 seconds
    window.addEventListener('focus', checkTokenExpiration); // Also check on window focus

    checkTokenExpiration(); // Initial check

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', checkTokenExpiration);
    };
  }, [token, promptSessionRenewal]);

  const fetchUserProfile = async (apiToken: string): Promise<User> => {
      const payload = decodeJwtPayload(apiToken);
      if (!payload) throw new Error("Invalid Token");

      // In this app, the user data is in the JWT.
      // For other apps, you might need an API call here.
      return {
          id: payload.personal_number,
          personalNumber: payload.personal_number,
          name: payload.name,
          roles: payload.roles,
          role: payload.roles.includes('ROLE_SUPERVISOR') ? 'Supervisor' : 'Operator',
          verifiedAt: new Date().toISOString() // Let's assume verified
      };
  }

  const processSuccessfulLogin = useCallback(async (apiToken: string, fetchedUser?: User) => {
    logger.log('Processing successful login...');
    try {
      let userData = fetchedUser || await fetchUserProfile(apiToken);
      userData = augmentUserData(userData);
      logger.log('Fetched and augmented user data:', userData);
      setUser(userData);
      setToken(apiToken);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_TOKEN_KEY, apiToken);
        logger.log('Auth token stored in local storage.');
      }
      isModalOpenRef.current = false;
      setIsRenewalModalOpen(false);
      setExpiredTokenEmail(null);
      return userData;
    } catch (error) {
      console.error('Error during post-login processing:', error);
      clearAuthData();
      throw error;
    }
  }, [clearAuthData]);
  
  const handleRenewalSuccess = useCallback(async (newToken: string) => {
    logger.log('Session renewal successful. Processing new token.');
    try {
      await processSuccessfulLogin(newToken);
      toast({ title: t('sessionRefreshedTitle'), description: t('sessionRefreshedDesc') });
    } catch (error) {
        toast({ variant: 'destructive', title: t('sessionRefreshFailedTitle'), description: (error as ApiError).message || t('sessionRefreshFailedDesc') });
        handleRenewalClose();
    }
  }, [processSuccessfulLogin, toast, t, handleRenewalClose]);


  useEffect(() => {
    const attemptAutoLogin = async () => {
      logger.log('Attempting auto-login on component mount.');
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (storedToken) {
          logger.log('Found token in local storage. Verifying...');
          try {
            let userData = await fetchUserProfile(storedToken);
            userData = augmentUserData(userData);
            setUser(userData);
            setToken(storedToken);
            setIsAuthenticated(true);
            logger.log('Auto-login successful.');
          } catch (error) {
             if ((error as ApiError)?.code !== 401) {
              logger.log('Auto-login failed with non-401 error. Clearing auth data.', error);
              clearAuthData();
            } else {
              logger.log('Auto-login failed with 401. Session renewal process will be initiated.');
            }
          } finally {
            setIsLoading(false);
          }
        } else {
          logger.log('No token found in local storage.');
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    attemptAutoLogin();
  }, [clearAuthData]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    logger.log(`Attempting login for user: ${credentials.username}`);
    try {
      const response: LoginResponse = await apiLogin(credentials.username, credentials.password);
      logger.log('Login API call successful. Received token.');
      await processSuccessfulLogin(response.token);
      toast({ title: t('login_successful'), description: t('redirecting_to_dashboard') });

      let redirectTo = '/';

      if (typeof window !== 'undefined') {
        const intendedDestination = localStorage.getItem(INTENDED_DESTINATION_KEY);

        if (intendedDestination && intendedDestination.trim() !== "") {
          localStorage.removeItem(INTENDED_DESTINATION_KEY);

          const nonIntendedRedirectPaths = ['/login', '/register', '/terms', '/'];
          const isValidForRedirect =
            !nonIntendedRedirectPaths.includes(intendedDestination) &&
            intendedDestination.startsWith('/') &&
            !intendedDestination.startsWith('//');

          if (isValidForRedirect) {
            redirectTo = intendedDestination;
          }
        }
      }
      logger.log(`Redirecting to ${redirectTo}`);
      router.push(redirectTo);
    } catch (error: any) {
      const apiError = error as ApiError;
      logger.error('Login failed.', apiError);
      
      let description = t('loginFailedDesc');
      if (error.isNetworkError) {
        description = t('cors_error_desc');
      } else if (apiError.message) {
        description = apiError.message;
      }
      
      toast({
        variant: "destructive",
        title: t('loginFailedTitle'),
        description,
      });
      clearAuthData();
      // Re-throw the error so the form can handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [processSuccessfulLogin, router, toast, t, clearAuthData]);


  const fetchUser = useCallback(async () => {
    const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null);
    if (currentToken) {
      setIsLoading(true);
      logger.log('Manually fetching/refreshing user profile.');
      try {
        let userData = await fetchUserProfile(currentToken);
        userData = augmentUserData(userData);
        setUser(userData);
        setToken(currentToken);
        setIsAuthenticated(true);
        logger.log('Successfully fetched and updated user data.');
      } catch (error) {
        if ((error as ApiError).code !== 401) {
            toast({ variant: "destructive", title: t('sessionRefreshFailedTitle'), description: (error as ApiError).message || t('sessionRefreshFailedDesc') });
            clearAuthData();
            if (!isPublicPath(pathname)) {
              localStorage.setItem(INTENDED_DESTINATION_KEY, pathname);
            }
            router.replace('/login');
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      logger.log('fetchUser called but no token available.');
      if (isAuthenticated) {
        clearAuthData();
      }
       setIsLoading(false);
    }
  }, [token, toast, t, router, clearAuthData, pathname, isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (isOnPublicRedirectPage(pathname)) {
        logger.log(`Authenticated user on a public redirect page (${pathname}). Redirecting to dashboard.`);
        router.replace('/');
      }
    } else { // Not authenticated
      if (!isPublicPath(pathname) && !isRenewalModalOpen) {
        if (typeof window !== 'undefined') {
          logger.log(`Not authenticated on a protected route. Storing intended destination: ${pathname}`);
          localStorage.setItem(INTENDED_DESTINATION_KEY, pathname);
        }
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, t, toast, isRenewalModalOpen]);


  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, logout, fetchUser }}>
      {children}
      <SessionRenewalModal
        isOpen={isRenewalModalOpen}
        onClose={handleRenewalClose}
        onSuccess={handleRenewalSuccess}
        email={user?.email || expiredTokenEmail}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

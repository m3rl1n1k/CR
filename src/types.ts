
import { User } from './lib/data';

export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

export interface LoginCredentials {
  username: string;
  password?: string;
  mfaCode?: string;
  isRenewal?: boolean;
}

export interface LoginResponse {
  token: string;
  user?: User;
}

    
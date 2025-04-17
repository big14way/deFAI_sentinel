import { NotificationPreferences } from './notification';

export interface User {
  id: string;
  address: string;
  ensName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dateJoined: number;
  lastLogin: number;
  isActive: boolean;
  role: UserRole;
  preferences: UserPreferences;
  watchedProtocols: string[];
  watchedAddresses: string[];
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  ANALYST = 'analyst',
  PROTOCOL_OWNER = 'protocol_owner'
}

export interface UserPreferences {
  theme: ThemePreference;
  notifications: NotificationPreferences;
  dashboardLayout: string;
  hiddenWidgets: string[];
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export enum ThemePreference {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export interface UserSession {
  userId: string;
  address: string;
  token: string;
  expiresAt: number;
  lastActivity: number;
  deviceInfo?: string;
  ipAddress?: string;
} 
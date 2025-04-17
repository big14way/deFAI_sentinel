import { AlertSeverity, AlertType } from './alert';

export interface Notification {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  severity: AlertSeverity;
  relatedItemId?: string;
  relatedItemType?: RelatedItemType;
  actionUrl?: string;
}

export enum NotificationType {
  ALERT = 'alert',
  SYSTEM = 'system',
  UPDATE = 'update',
  RECOMMENDATION = 'recommendation'
}

export enum RelatedItemType {
  PROTOCOL = 'protocol',
  ALERT = 'alert',
  TRANSACTION = 'transaction',
  USER = 'user'
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  alertTypes: AlertType[];
  minSeverity: AlertSeverity;
  protocolIds: string[];
}

export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType[];
  dateFrom?: number;
  dateTo?: number;
} 
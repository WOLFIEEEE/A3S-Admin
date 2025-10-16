/**
 * Notification Types and Interfaces
 * Centralized notification system types for the A3S Admin Dashboard
 */

export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading';

export type NotificationAction = {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'default' | 'destructive';
};

export interface NotificationOptions {
  title?: string;
  description: string;
  type?: NotificationType;
  duration?: number;
  action?: NotificationAction;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  dismissible?: boolean;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
}

export interface PersistentNotification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  duration: number; // in milliseconds
  position: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  showOnMobile: boolean;
}

// Notification categories for different features
export enum NotificationCategory {
  CLIENT = 'client',
  PROJECT = 'project',
  REPORT = 'report',
  ISSUE = 'issue',
  TEAM = 'team',
  TICKET = 'ticket',
  SYSTEM = 'system',
  AUTH = 'auth'
}

export interface CategoryNotificationConfig {
  category: NotificationCategory;
  enabled: boolean;
  sound: boolean;
  priority: 'low' | 'medium' | 'high';
}

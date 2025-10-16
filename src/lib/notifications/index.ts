/**
 * Notification System Exports
 * Central export point for the notification system
 */

export { notificationService, notify } from './notification-service';
export type {
  NotificationType,
  NotificationOptions,
  NotificationAction,
  PersistentNotification,
  NotificationPreferences,
  CategoryNotificationConfig
} from './types';
export { NotificationCategory } from './types';

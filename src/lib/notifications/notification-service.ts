/**
 * Notification Service
 * Centralized service for managing all notifications in the A3S Admin Dashboard
 */

import { toast } from 'sonner';
import type {
  NotificationOptions,
  NotificationType,
  NotificationAction,
  PersistentNotification
} from './types';

class NotificationService {
  private static instance: NotificationService;
  private notifications: PersistentNotification[] = [];
  private readonly MAX_NOTIFICATIONS = 100;

  private constructor() {
    // Load notifications from localStorage
    if (typeof window !== 'undefined') {
      this.loadNotifications();
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Show a success notification
   */
  public success(message: string, options?: Partial<NotificationOptions>) {
    return this.show({
      description: message,
      type: 'success',
      ...options
    });
  }

  /**
   * Show an error notification
   */
  public error(message: string, options?: Partial<NotificationOptions>) {
    return this.show({
      description: message,
      type: 'error',
      duration: options?.duration || 6000, // Longer duration for errors
      ...options
    });
  }

  /**
   * Show a warning notification
   */
  public warning(message: string, options?: Partial<NotificationOptions>) {
    return this.show({
      description: message,
      type: 'warning',
      ...options
    });
  }

  /**
   * Show an info notification
   */
  public info(message: string, options?: Partial<NotificationOptions>) {
    return this.show({
      description: message,
      type: 'info',
      ...options
    });
  }

  /**
   * Show a loading notification (useful for async operations)
   */
  public loading(message: string, options?: Partial<NotificationOptions>) {
    return this.show({
      description: message,
      type: 'loading',
      duration: Infinity, // Loading notifications don't auto-dismiss
      dismissible: false,
      ...options
    });
  }

  /**
   * Show a promise notification (auto-updates based on promise state)
   */
  public promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    options?: Partial<NotificationOptions>
  ) {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options
    });
  }

  /**
   * Main notification display method
   */
  private show(options: NotificationOptions) {
    const {
      title,
      description,
      type = 'info',
      duration = 4000,
      action,
      onDismiss,
      onAutoClose,
      dismissible = true
    } = options;

    // Persist notification to history
    this.addToHistory({
      type,
      title,
      message: description
    });

    // Show notification based on type
    const toastOptions = {
      description: title ? description : undefined,
      duration,
      onDismiss,
      onAutoClose,
      dismissible,
      action: action
        ? {
            label: action.label,
            onClick: action.onClick
          }
        : undefined
    };

    let toastId: string | number;

    switch (type) {
      case 'success':
        toastId = toast.success(title || description, toastOptions);
        break;
      case 'error':
        toastId = toast.error(title || description, toastOptions);
        break;
      case 'warning':
        toastId = toast.warning(title || description, toastOptions);
        break;
      case 'loading':
        toastId = toast.loading(title || description, toastOptions);
        break;
      case 'info':
      default:
        toastId = toast.info(title || description, toastOptions);
        break;
    }

    return toastId;
  }

  /**
   * Dismiss a specific notification
   */
  public dismiss(toastId?: string | number) {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all notifications
   */
  public dismissAll() {
    toast.dismiss();
  }

  /**
   * Add notification to persistent history
   */
  private addToHistory(notification: {
    type: NotificationType;
    title?: string;
    message: string;
  }) {
    if (typeof window === 'undefined') return;

    const newNotification: PersistentNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);

    // Keep only the most recent notifications
    if (this.notifications.length > this.MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, this.MAX_NOTIFICATIONS);
    }

    this.saveNotifications();
  }

  /**
   * Get all notifications from history
   */
  public getNotifications(): PersistentNotification[] {
    return this.notifications;
  }

  /**
   * Get unread notifications count
   */
  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string) {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.saveNotifications();
  }

  /**
   * Clear notification history
   */
  public clearHistory() {
    this.notifications = [];
    this.saveNotifications();
  }

  /**
   * Delete a specific notification from history
   */
  public deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(
      (n) => n.id !== notificationId
    );
    this.saveNotifications();
  }

  /**
   * Save notifications to localStorage
   */
  private saveNotifications() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(
        'a3s-notifications',
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      // Failed to save notifications
    }
  }

  /**
   * Load notifications from localStorage
   */
  private loadNotifications() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('a3s-notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      // Failed to load notifications, start with empty array
      this.notifications = [];
    }
  }

  /**
   * Category-specific notification helpers
   */
  public client = {
    created: (clientName: string, action?: NotificationAction) =>
      this.success(`Client "${clientName}" created successfully`, { action }),

    updated: (clientName: string) =>
      this.success(`Client "${clientName}" updated successfully`),

    deleted: (clientName: string, action?: NotificationAction) =>
      this.success(`Client "${clientName}" deleted`, { action }),

    error: (operation: string, error: string) =>
      this.error(`Failed to ${operation} client: ${error}`)
  };

  public project = {
    created: (projectName: string, action?: NotificationAction) =>
      this.success(`Project "${projectName}" created successfully`, { action }),

    updated: (projectName: string) =>
      this.success(`Project "${projectName}" updated successfully`),

    deleted: (projectName: string, action?: NotificationAction) =>
      this.success(`Project "${projectName}" deleted`, { action }),

    error: (operation: string, error: string) =>
      this.error(`Failed to ${operation} project: ${error}`)
  };

  public report = {
    generated: (reportTitle: string) =>
      this.success(`Report "${reportTitle}" generated successfully`),

    sent: (recipientCount: number) =>
      this.success(
        `Report sent to ${recipientCount} recipient(s) successfully`
      ),

    saved: (reportTitle: string) =>
      this.success(`Report "${reportTitle}" saved as draft`),

    error: (operation: string, error: string) =>
      this.error(`Failed to ${operation} report: ${error}`)
  };

  public team = {
    created: (teamName: string, action?: NotificationAction) =>
      this.success(`Team "${teamName}" created successfully`, { action }),

    memberAdded: (memberName: string, teamName: string) =>
      this.success(`${memberName} added to ${teamName}`),

    memberRemoved: (memberName: string) =>
      this.success(`${memberName} removed from team`),

    updated: (teamName: string) =>
      this.success(`Team "${teamName}" updated successfully`),

    deleted: (teamName: string, action?: NotificationAction) =>
      this.success(`Team "${teamName}" deleted`, { action }),

    error: (operation: string, error: string) =>
      this.error(`Failed to ${operation} team: ${error}`)
  };

  public ticket = {
    created: (ticketTitle: string, action?: NotificationAction) =>
      this.success(`Ticket "${ticketTitle}" created successfully`, { action }),

    updated: (ticketTitle: string) =>
      this.success(`Ticket "${ticketTitle}" updated successfully`),

    statusChanged: (ticketTitle: string, newStatus: string) =>
      this.info(`Ticket "${ticketTitle}" status changed to ${newStatus}`),

    assigned: (ticketTitle: string, assignee: string) =>
      this.info(`Ticket "${ticketTitle}" assigned to ${assignee}`),

    deleted: (ticketTitle: string, action?: NotificationAction) =>
      this.success(`Ticket "${ticketTitle}" deleted`, { action }),

    error: (operation: string, error: string) =>
      this.error(`Failed to ${operation} ticket: ${error}`)
  };
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Export convenience methods
export const notify = {
  success: (message: string, options?: Partial<NotificationOptions>) =>
    notificationService.success(message, options),

  error: (message: string, options?: Partial<NotificationOptions>) =>
    notificationService.error(message, options),

  warning: (message: string, options?: Partial<NotificationOptions>) =>
    notificationService.warning(message, options),

  info: (message: string, options?: Partial<NotificationOptions>) =>
    notificationService.info(message, options),

  loading: (message: string, options?: Partial<NotificationOptions>) =>
    notificationService.loading(message, options),

  promise: notificationService.promise.bind(notificationService),

  dismiss: (toastId?: string | number) => notificationService.dismiss(toastId),

  dismissAll: () => notificationService.dismissAll(),

  // Category-specific helpers
  client: notificationService.client,
  project: notificationService.project,
  report: notificationService.report,
  team: notificationService.team,
  ticket: notificationService.ticket
};

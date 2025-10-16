# A3S Notification System

A comprehensive, production-ready notification system built on **Sonner** for Next.js 15.

## Quick Start

```typescript
import { notify } from '@/lib/notifications';

// Basic usage
notify.success('Operation completed!');
notify.error('Something went wrong!');
notify.warning('Please review your changes');
notify.info('New feature available');

// With action buttons
notify.error('Failed to save', {
  action: {
    label: 'Retry',
    onClick: () => retryOperation()
  }
});

// Category-specific (recommended)
notify.client.created('Acme Corp');
notify.project.updated('Website Redesign');
notify.report.sent(5); // 5 recipients
notify.team.memberAdded('John Doe', 'Frontend Team');
notify.ticket.statusChanged('Bug #123', 'Resolved');

// Promise-based (for async operations)
notify.promise(
  fetchData(),
  {
    loading: 'Loading...',
    success: 'Data loaded!',
    error: 'Failed to load'
  }
);
```

## Features

- ✅ **Minimal & Clean** - Beautiful UI that matches your design system
- ✅ **Actionable** - Add retry, undo, and custom action buttons
- ✅ **Persistent History** - All notifications saved with timestamps
- ✅ **Notification Center** - View all past notifications in header
- ✅ **Category-Specific** - Pre-configured for Clients, Projects, Reports, Teams, Tickets
- ✅ **Promise Support** - Auto-updating notifications for async operations
- ✅ **Mobile Responsive** - Works perfectly on all screen sizes
- ✅ **Type-Safe** - Full TypeScript support

## Documentation

- **Complete Guide**: `/NOTIFICATIONS_GUIDE.md` - Full documentation with examples
- **Implementation**: `/NOTIFICATION_SYSTEM_IMPLEMENTATION.md` - Technical details

## Files

- `types.ts` - TypeScript type definitions
- `notification-service.ts` - Core notification service (singleton)
- `index.ts` - Public API exports
- `README.md` - This file

## API

### Basic Notifications

- `notify.success(message, options?)` - Success notification
- `notify.error(message, options?)` - Error notification
- `notify.warning(message, options?)` - Warning notification
- `notify.info(message, options?)` - Info notification
- `notify.loading(message, options?)` - Loading notification
- `notify.promise(promise, messages, options?)` - Promise-based notification

### Category-Specific

- `notify.client.*` - Client operations
- `notify.project.*` - Project operations
- `notify.report.*` - Report operations
- `notify.team.*` - Team operations
- `notify.ticket.*` - Ticket operations

### Service Methods

- `notificationService.getNotifications()` - Get all notifications
- `notificationService.getUnreadCount()` - Get unread count
- `notificationService.markAsRead(id)` - Mark notification as read
- `notificationService.markAllAsRead()` - Mark all as read
- `notificationService.deleteNotification(id)` - Delete notification
- `notificationService.clearHistory()` - Clear all notifications

## Examples

See `/NOTIFICATIONS_GUIDE.md` for comprehensive examples and best practices.

## Why Sonner?

Sonner is the best notification library for Next.js 15 in 2025:

- Modern & Minimal
- Zero configuration required
- High performance
- Fully accessible
- Complete TypeScript support
- Actively maintained
- Industry-standard choice

---

**Status**: ✅ Production Ready

For questions or issues, refer to the complete documentation in `/NOTIFICATIONS_GUIDE.md`.


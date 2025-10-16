# A3S Notification System Guide

## Overview

The A3S Admin Dashboard uses a centralized notification system built on top of **Sonner** - a minimal, modern toast notification library optimized for Next.js 15 and React 19.

## Features

✅ **Minimal & Clean** - Beautiful UI that matches your design system  
✅ **Actionable** - Add retry, undo, and custom action buttons  
✅ **Persistent History** - All notifications are saved with timestamps  
✅ **Notification Center** - View all past notifications in the header  
✅ **Category-Specific** - Pre-configured helpers for Clients, Projects, Reports, Teams, Tickets  
✅ **Promise Support** - Auto-updating notifications for async operations  
✅ **Mobile Responsive** - Works perfectly on all screen sizes  
✅ **Type-Safe** - Full TypeScript support

## Quick Start

### Basic Usage

```typescript
import { notify } from '@/lib/notifications';

// Success notification
notify.success('Operation completed successfully!');

// Error notification
notify.error('Something went wrong!');

// Warning notification
notify.warning('Please review your changes');

// Info notification
notify.info('New feature available');

// Loading notification (dismisses manually)
const loadingId = notify.loading('Processing...');
// Later dismiss it
notify.dismiss(loadingId);
```

### With Action Buttons

```typescript
import { notify } from '@/lib/notifications';

// Add a retry button
notify.error('Failed to save changes', {
  action: {
    label: 'Retry',
    onClick: () => saveChanges()
  }
});

// Add an undo button
notify.success('Item deleted', {
  action: {
    label: 'Undo',
    onClick: () => restoreItem()
  },
  duration: 8000 // Longer duration for undo actions
});
```

### Promise Notifications

Perfect for async operations - automatically updates based on promise state:

```typescript
import { notify } from '@/lib/notifications';

const saveOperation = async () => {
  // Your async code
  await fetch('/api/data', { method: 'POST', body: data });
};

notify.promise(
  saveOperation(),
  {
    loading: 'Saving changes...',
    success: 'Changes saved successfully!',
    error: (err) => `Failed to save: ${err.message}`
  }
);
```

## Category-Specific Helpers

Pre-configured notification methods for different features:

### Client Notifications

```typescript
import { notify } from '@/lib/notifications';

// Client created with view action
notify.client.created('Acme Corp', {
  action: {
    label: 'View',
    onClick: () => router.push(`/dashboard/clients/${clientId}`)
  }
});

// Client updated
notify.client.updated('Acme Corp');

// Client deleted with undo
notify.client.deleted('Acme Corp', {
  action: {
    label: 'Undo',
    onClick: () => restoreClient()
  }
});

// Client error
notify.client.error('delete', 'Client has active projects');
```

### Project Notifications

```typescript
notify.project.created('Website Redesign', {
  action: {
    label: 'View',
    onClick: () => router.push(`/dashboard/projects/${projectId}`)
  }
});

notify.project.updated('Website Redesign');
notify.project.deleted('Old Project');
notify.project.error('create', 'Invalid client ID');
```

### Report Notifications

```typescript
notify.report.generated('Monthly Accessibility Report');
notify.report.sent(5); // 5 recipients
notify.report.saved('Draft Report');
notify.report.error('generate', 'AI service unavailable');
```

### Team Notifications

```typescript
notify.team.created('Frontend Team', {
  action: {
    label: 'View',
    onClick: () => router.push(`/dashboard/teams/${teamId}`)
  }
});

notify.team.memberAdded('John Doe', 'Frontend Team');
notify.team.memberRemoved('Jane Smith');
notify.team.updated('Backend Team');
notify.team.deleted('Old Team');
notify.team.error('add member', 'User already in team');
```

### Ticket Notifications

```typescript
notify.ticket.created('Fix accessibility issues', {
  action: {
    label: 'View',
    onClick: () => router.push(`/dashboard/tickets/${ticketId}`)
  }
});

notify.ticket.updated('High priority ticket');
notify.ticket.statusChanged('Bug #123', 'Resolved');
notify.ticket.assigned('Bug #123', 'John Doe');
notify.ticket.deleted('Old Ticket');
notify.ticket.error('assign', 'User not found');
```

## Advanced Options

### Custom Duration

```typescript
notify.success('Quick message', { duration: 2000 }); // 2 seconds
notify.error('Important error', { duration: 10000 }); // 10 seconds
```

### Custom Title & Description

```typescript
notify.success('Operation Complete', {
  title: 'Success!',
  description: 'All changes have been saved to the database.'
});
```

### Non-Dismissible Notifications

```typescript
notify.loading('Critical process running...', {
  dismissible: false,
  duration: Infinity
});
```

## Notification Center

The notification center is automatically added to the header and provides:

- 📜 **Persistent History** - All notifications are saved
- 🔔 **Unread Badge** - Visual indicator of new notifications
- ✅ **Mark as Read** - Individual or bulk mark as read
- 🗑️ **Delete** - Remove individual notifications
- 🧹 **Clear All** - Clear entire history
- ⏰ **Timestamps** - See when each notification occurred

### Accessing Notification Service

```typescript
import { notificationService } from '@/lib/notifications';

// Get all notifications
const all = notificationService.getNotifications();

// Get unread count
const unread = notificationService.getUnreadCount();

// Mark as read
notificationService.markAsRead(notificationId);

// Mark all as read
notificationService.markAllAsRead();

// Delete notification
notificationService.deleteNotification(notificationId);

// Clear history
notificationService.clearHistory();
```

## Migration from Direct Toast Usage

### Before (Old Way)

```typescript
import { toast } from 'sonner';

toast.success('Item created!');
toast.error('Failed to delete');
```

### After (New Way)

```typescript
import { notify } from '@/lib/notifications';

notify.client.created('New Client'); // Category-specific
notify.error('Failed to delete'); // Generic
```

## Best Practices

### 1. Use Category-Specific Methods

✅ **Good:**
```typescript
notify.project.created('New Project');
```

❌ **Avoid:**
```typescript
notify.success('Project "New Project" created successfully');
```

### 2. Add Actions for Important Operations

✅ **Good:**
```typescript
notify.success('Client deleted', {
  action: {
    label: 'Undo',
    onClick: () => restoreClient()
  }
});
```

### 3. Use Promise Notifications for Async Operations

✅ **Good:**
```typescript
notify.promise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: 'Data loaded!',
    error: 'Failed to load'
  }
);
```

❌ **Avoid:**
```typescript
notify.loading('Loading data...');
try {
  await fetchData();
  notify.success('Data loaded!');
} catch (error) {
  notify.error('Failed to load');
}
```

### 4. Provide Clear Error Messages

✅ **Good:**
```typescript
notify.error('Failed to save: Invalid email format');
```

❌ **Avoid:**
```typescript
notify.error('Error');
```

### 5. Use Appropriate Durations

- **Success**: 3-4 seconds (default)
- **Info**: 4-5 seconds
- **Warning**: 5-6 seconds
- **Error**: 6-8 seconds (users need time to read)
- **With Actions**: 6-10 seconds (users need time to act)

## Keyboard Shortcuts

- **Esc** - Dismiss all notifications
- **Click notification** - Mark as read and dismiss

## Examples from the Codebase

### Report Generation with Retry

```typescript
try {
  // Generate report
  const result = await generateReport();
  notify.report.generated(reportTitle);
} catch (error) {
  notify.report.error('generate', error.message, {
    action: {
      label: 'Retry',
      onClick: () => handleGenerateReport()
    }
  });
}
```

### Successful Email Send

```typescript
const totalRecipients = config.recipients.length + 
                       (config.ccRecipients?.length || 0) + 
                       (config.bccRecipients?.length || 0);
notify.report.sent(totalRecipients);
```

### Client Creation with Navigation

```typescript
const client = await createClient(data);
notify.client.created(client.name, {
  action: {
    label: 'View',
    onClick: () => router.push(`/dashboard/clients/${client.id}`)
  }
});
```

## Customization

### Modify Toaster Settings

Edit `/src/components/ui/sonner.tsx`:

```typescript
<Sonner
  position='top-right' // Change position
  duration={4000} // Change default duration
  visibleToasts={5} // Change max visible
  // ... other options
/>
```

### Add Custom Notification Categories

Edit `/src/lib/notifications/notification-service.ts`:

```typescript
public myFeature = {
  created: (name: string) => 
    this.success(`Feature "${name}" created`),
  
  updated: (name: string) => 
    this.success(`Feature "${name}" updated`),
  
  error: (operation: string, error: string) => 
    this.error(`Failed to ${operation}: ${error}`)
};
```

Then use it:

```typescript
notify.myFeature.created('New Feature');
```

## Troubleshooting

### Notifications not appearing

1. Check that `<Toaster />` is in your root layout
2. Verify imports: `import { notify } from '@/lib/notifications'`
3. Check browser console for errors

### Notifications disappearing too quickly

```typescript
// Increase duration
notify.success('Message', { duration: 8000 });
```

### Notification history not persisting

Check browser localStorage is enabled and not blocked.

## API Reference

See `/src/lib/notifications/types.ts` for full TypeScript definitions.

## Support

For issues or questions, check:
- `src/lib/notifications/` - Core notification system
- `src/components/notifications/` - UI components
- This guide for usage examples


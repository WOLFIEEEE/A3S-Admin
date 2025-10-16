'use client';

import React, { useState, useEffect } from 'react';
import {
  IconBell,
  IconBellRinging,
  IconCheck,
  IconTrash,
  IconAlertTriangle,
  IconInfoCircle,
  IconCircleCheck,
  IconCircleX,
  IconLoader2
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationService } from '@/lib/notifications';
import type { PersistentNotification } from '@/lib/notifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<PersistentNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'a3s-notifications') {
        loadNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Refresh notifications periodically
    const interval = setInterval(loadNotifications, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadNotifications = () => {
    const allNotifications = notificationService.getNotifications();
    setNotifications(allNotifications.slice(0, 20)); // Show only recent 20
    setUnreadCount(notificationService.getUnreadCount());
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
    loadNotifications();
  };

  const handleDelete = (notificationId: string) => {
    notificationService.deleteNotification(notificationId);
    loadNotifications();
  };

  const handleClearAll = () => {
    notificationService.clearHistory();
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <IconCircleCheck className='h-5 w-5 text-green-500' />;
      case 'error':
        return <IconCircleX className='h-5 w-5 text-red-500' />;
      case 'warning':
        return <IconAlertTriangle className='h-5 w-5 text-yellow-500' />;
      case 'loading':
        return <IconLoader2 className='h-5 w-5 animate-spin text-blue-500' />;
      default:
        return <IconInfoCircle className='h-5 w-5 text-blue-500' />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative'
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          {unreadCount > 0 ? (
            <IconBellRinging className='h-5 w-5' />
          ) : (
            <IconBell className='h-5 w-5' />
          )}
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center p-0 text-xs'
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-[380px] p-0'>
        {/* Header */}
        <div className='flex items-center justify-between border-b p-4'>
          <div className='flex items-center gap-2'>
            <IconBell className='h-5 w-5' />
            <h3 className='font-semibold'>Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant='secondary' className='ml-auto'>
                {unreadCount} new
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <div className='flex items-center gap-2'>
              {unreadCount > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleMarkAllAsRead}
                  className='h-8 text-xs'
                >
                  <IconCheck className='mr-1 h-3 w-3' />
                  Mark all read
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center p-8 text-center'>
            <IconBell className='text-muted-foreground mb-4 h-12 w-12' />
            <p className='text-muted-foreground text-sm font-medium'>
              No notifications yet
            </p>
            <p className='text-muted-foreground mt-1 text-xs'>
              We&apos;ll notify you when something important happens
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className='h-[400px]'>
              <div className='divide-y'>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'hover:bg-muted/50 relative p-4 transition-colors',
                      !notification.read && 'bg-primary/5'
                    )}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='mt-0.5 flex-shrink-0'>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className='min-w-0 flex-1'>
                        {notification.title && (
                          <p className='mb-1 text-sm font-medium'>
                            {notification.title}
                          </p>
                        )}
                        <p className='text-muted-foreground line-clamp-2 text-sm'>
                          {notification.message}
                        </p>
                        <p className='text-muted-foreground mt-1 text-xs'>
                          {formatDistanceToNow(
                            new Date(notification.timestamp),
                            {
                              addSuffix: true
                            }
                          )}
                        </p>
                      </div>

                      <div className='flex flex-shrink-0 items-center gap-1'>
                        {!notification.read && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            onClick={() => handleMarkAsRead(notification.id)}
                            title='Mark as read'
                          >
                            <IconCheck className='h-4 w-4' />
                          </Button>
                        )}
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={() => handleDelete(notification.id)}
                          title='Delete'
                        >
                          <IconTrash className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>

                    {!notification.read && (
                      <div className='bg-primary absolute top-0 bottom-0 left-0 w-1' />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className='border-t p-2'>
              <Button
                variant='ghost'
                size='sm'
                className='w-full text-xs'
                onClick={handleClearAll}
              >
                <IconTrash className='mr-1 h-3 w-3' />
                Clear all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

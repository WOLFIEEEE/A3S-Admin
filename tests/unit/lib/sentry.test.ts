import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  captureException,
  captureMessage,
  addBreadcrumb,
  setUserContext,
  ErrorSeverity,
  isSentryEnabled
} from '@/lib/sentry';

// Mock @sentry/nextjs
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
  setTag: vi.fn(),
  startSpan: vi.fn((options, callback) => callback?.({})),
  flush: vi.fn().mockResolvedValue(true)
}));

describe('Sentry Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Enable Sentry for tests
    process.env.NEXT_PUBLIC_SENTRY_DISABLED = 'false';
  });

  describe('isSentryEnabled', () => {
    it('should return false when Sentry is disabled', () => {
      process.env.NEXT_PUBLIC_SENTRY_DISABLED = 'true';
      expect(isSentryEnabled()).toBe(false);
    });

    it('should return false when DSN is not set', () => {
      process.env.NEXT_PUBLIC_SENTRY_DISABLED = 'false';
      process.env.NEXT_PUBLIC_SENTRY_DSN = '';
      expect(isSentryEnabled()).toBe(false);
    });

    it('should return true when enabled and DSN is set', () => {
      process.env.NEXT_PUBLIC_SENTRY_DISABLED = 'false';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';
      expect(isSentryEnabled()).toBe(true);
    });
  });

  describe('captureException', () => {
    it('should capture exception with default severity', () => {
      const error = new Error('Test error');
      const Sentry = require('@sentry/nextjs');

      captureException(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({ level: ErrorSeverity.ERROR })
      );
    });

    it('should capture exception with custom severity', () => {
      const error = new Error('Warning error');
      const Sentry = require('@sentry/nextjs');

      captureException(error, undefined, ErrorSeverity.WARNING);

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({ level: ErrorSeverity.WARNING })
      );
    });

    it('should capture exception with context', () => {
      const error = new Error('Test error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        projectId: 'project-123'
      };
      const Sentry = require('@sentry/nextjs');

      captureException(error, context);

      expect(Sentry.setContext).toHaveBeenCalledWith(
        'error_context',
        expect.any(Object)
      );
      expect(Sentry.setTag).toHaveBeenCalledWith('component', 'TestComponent');
      expect(Sentry.setTag).toHaveBeenCalledWith('action', 'testAction');
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const Sentry = require('@sentry/nextjs');

      captureException(error);

      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should not capture when Sentry is disabled', () => {
      process.env.NEXT_PUBLIC_SENTRY_DISABLED = 'true';
      const error = new Error('Test error');
      const Sentry = require('@sentry/nextjs');

      const result = captureException(error);

      expect(result).toBeNull();
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('captureMessage', () => {
    it('should capture message with default severity', () => {
      const Sentry = require('@sentry/nextjs');

      captureMessage('Test message');

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Test message',
        expect.objectContaining({ level: ErrorSeverity.INFO })
      );
    });

    it('should capture message with custom severity', () => {
      const Sentry = require('@sentry/nextjs');

      captureMessage('Warning message', undefined, ErrorSeverity.WARNING);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Warning message',
        expect.objectContaining({ level: ErrorSeverity.WARNING })
      );
    });

    it('should capture message with context', () => {
      const context = {
        component: 'TestComponent',
        action: 'testAction'
      };
      const Sentry = require('@sentry/nextjs');

      captureMessage('Test message', context);

      expect(Sentry.setContext).toHaveBeenCalledWith(
        'message_context',
        expect.any(Object)
      );
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumb with default category', () => {
      const Sentry = require('@sentry/nextjs');

      addBreadcrumb('Test breadcrumb');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Test breadcrumb',
        category: 'action',
        level: 'info',
        data: undefined
      });
    });

    it('should add breadcrumb with custom category and data', () => {
      const Sentry = require('@sentry/nextjs');
      const data = { userId: 'user-123' };

      addBreadcrumb('User action', data, 'user-action');

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User action',
        category: 'user-action',
        level: 'info',
        data
      });
    });
  });

  describe('setUserContext', () => {
    it('should set user context', () => {
      const Sentry = require('@sentry/nextjs');
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User'
      };

      setUserContext(user);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
        username: 'Test User'
      });
    });

    it('should clear user context when null', () => {
      const Sentry = require('@sentry/nextjs');

      setUserContext(null);

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it('should handle user without email', () => {
      const Sentry = require('@sentry/nextjs');
      const user = {
        id: 'user-123',
        name: 'Test User'
      };

      setUserContext(user);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: undefined,
        username: 'Test User'
      });
    });
  });

  describe('ErrorSeverity', () => {
    it('should have all severity levels', () => {
      expect(ErrorSeverity.FATAL).toBe('fatal');
      expect(ErrorSeverity.ERROR).toBe('error');
      expect(ErrorSeverity.WARNING).toBe('warning');
      expect(ErrorSeverity.INFO).toBe('info');
      expect(ErrorSeverity.DEBUG).toBe('debug');
    });
  });
});

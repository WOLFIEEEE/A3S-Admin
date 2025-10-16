'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException, addBreadcrumb, ErrorSeverity } from '@/lib/sentry';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Catches React errors and reports them to Sentry
 * Provides a user-friendly fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to Sentry
    const eventId = captureException(
      error,
      {
        component: this.props.componentName || 'ErrorBoundary',
        action: 'render',
        additional: {
          componentStack: errorInfo.componentStack,
          errorBoundary: true
        }
      },
      ErrorSeverity.ERROR
    );

    // Add breadcrumb
    addBreadcrumb(
      `Error caught by ErrorBoundary in ${this.props.componentName || 'unknown component'}`,
      {
        errorMessage: error.message,
        eventId
      },
      'error'
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state
    this.setState({
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className='bg-background flex min-h-screen items-center justify-center p-4'>
          <Card className='w-full max-w-2xl'>
            <CardHeader>
              <div className='text-destructive mb-4 flex items-center gap-3'>
                <AlertTriangle className='h-8 w-8' />
                <CardTitle className='text-2xl'>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. Our team has been notified and
                we&apos;re working on fixing it.
              </CardDescription>
            </CardHeader>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='mb-2 text-sm font-semibold'>
                    Error Details (Development Only):
                  </h3>
                  <div className='bg-muted max-h-60 overflow-auto rounded-md p-4'>
                    <p className='text-destructive mb-2 font-mono text-sm'>
                      {this.state.error.message}
                    </p>
                    <pre className='text-muted-foreground text-xs'>
                      {this.state.error.stack}
                    </pre>
                  </div>
                </div>

                {this.state.errorInfo && (
                  <div>
                    <h3 className='mb-2 text-sm font-semibold'>
                      Component Stack:
                    </h3>
                    <div className='bg-muted max-h-40 overflow-auto rounded-md p-4'>
                      <pre className='text-muted-foreground text-xs'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            )}

            <CardFooter className='flex gap-3'>
              <Button
                onClick={this.handleReset}
                variant='default'
                className='flex items-center gap-2'
              >
                <RefreshCw className='h-4 w-4' />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant='outline'
                className='flex items-center gap-2'
              >
                <Home className='h-4 w-4' />
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple Error Fallback Component
 */
export function SimpleErrorFallback({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center p-4'>
      <AlertTriangle className='text-destructive mb-4 h-12 w-12' />
      <h2 className='mb-2 text-xl font-semibold'>Something went wrong</h2>
      <p className='text-muted-foreground mb-4 max-w-md text-center'>
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset} variant='default'>
        Try Again
      </Button>
    </div>
  );
}

/**
 * Inline Error Boundary (for wrapping specific components)
 */
export function InlineErrorBoundary({
  children,
  componentName
}: {
  children: ReactNode;
  componentName: string;
}) {
  return (
    <ErrorBoundary
      componentName={componentName}
      fallback={
        <div className='border-destructive/50 bg-destructive/10 rounded-md border p-4'>
          <p className='text-destructive text-sm'>
            Error loading {componentName}. Please try refreshing the page.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

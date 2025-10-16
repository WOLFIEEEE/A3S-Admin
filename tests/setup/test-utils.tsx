import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

/**
 * Custom render function that includes providers
 * Add your app providers here as needed (QueryClient, ThemeProvider, etc.)
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    // Add providers here when needed
    return <>{children}</>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Wait for an element to be removed (useful for loading states)
 */
export async function waitForLoadingToFinish() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create mock fetch response
 */
export function createMockResponse<T>(
  data: T,
  options?: {
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
  }
) {
  return {
    ok: options?.status ? options.status >= 200 && options.status < 300 : true,
    status: options?.status || 200,
    statusText: options?.statusText || 'OK',
    headers: new Headers(options?.headers),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    arrayBuffer: async () => new ArrayBuffer(0),
    formData: async () => new FormData()
  } as Response;
}

/**
 * Create mock API error
 */
export function createMockError(message: string, status = 500) {
  return createMockResponse(
    { success: false, error: message },
    { status, statusText: message }
  );
}

/**
 * Create mock API success
 */
export function createMockSuccess<T>(data: T) {
  return createMockResponse({ success: true, data }, { status: 200 });
}

/**
 * Wait for async updates
 */
export const waitFor = (
  callback: () => void | Promise<void>,
  options?: { timeout?: number }
) => {
  return new Promise((resolve) => {
    const timeout = options?.timeout || 1000;
    const startTime = Date.now();

    const check = async () => {
      try {
        await callback();
        resolve(true);
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          throw error;
        }
        setTimeout(check, 50);
      }
    };

    check();
  });
};

// Re-export everything from testing library
export * from '@testing-library/react';
export { customRender as render };

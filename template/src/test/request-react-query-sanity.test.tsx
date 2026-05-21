// react-query + axios + msw sanity — proves the full chain is live.
//
// useQuery → queryFn calls axios `request.get('/api/health')` → msw 2.x
// setupServer intercepts → returns mock data. Passing this is the floor
// for any react-query + axios test.
//
// Note: tests don't reuse `src/services/queryClient.ts`'s singleton — they
// instantiate a per-test QueryClient (retry: false, fresh cache) to avoid
// cross-test pollution.

import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { request } from '@/services/request';

describe('react-query + axios + msw sanity', () => {
  it('useQuery returns /api/health data via axios + msw mock', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ['health'],
          queryFn: () => request.get('/api/health').then((r) => r.data),
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ status: 'ok' });
  });
});

// Singleton React Query client.
//
//   - queryCache + mutationCache onError = backstop telemetry only.
//     Non-user-visible toast — wire user-visible toast in the sub-app's
//     business-specific error mapping (typically via axios response
//     interceptor + notifier).
//   - defaults aligned with master:
//       queries.retry = 0                     (401 is handled by axios
//                                              interceptor; auto-retry would
//                                              amplify failures)
//       queries.refetchOnWindowFocus = false  (platform-style apps avoid
//                                              hijacking user focus)
//       queries.staleTime = 30_000            (30s freshness window before
//                                              background refetch)
//       mutations.retry = 0                   (no side-effect duplication)
//
// Each sub-app owns its own QueryClient — qiankun isolation prevents cache
// pollution across sibling sub-apps. Don't try to share via externals from
// master.

import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { reportError } from '@/utils/report';

function backstopReport(error: unknown): void {
  reportError(error, { phase: 'react-query' });
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: backstopReport }),
  mutationCache: new MutationCache({ onError: backstopReport }),
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

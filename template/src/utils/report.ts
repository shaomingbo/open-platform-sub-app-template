// Error reporting entry point.
//
// Thin wrapper over `createLogger('report').error(...)`. The schema
// invariant is `properties.{app, version, ns, level, msg, ...}` —
// dashboards typically filter by these properties, with top-level
// `name` / `source` / `message` as secondary. Don't bypass the logger;
// route every error through here so ARMS sees a consistent shape.
//
// Call sites:
//   - src/services/request.ts axios response interceptor
//     `reportError(error, { phase: 'request' })`
//   - src/services/queryClient.ts queryCache + mutationCache onError
//     `reportError(error, { phase: 'react-query' })`
//   - src/components/ErrorBoundary.tsx componentDidCatch
//     `reportError(error, { scope, componentStack })`

import { createLogger } from './logger';

const log = createLogger('report');

export interface ReportContext {
  scope?: string;
  componentStack?: string;
  phase?: 'request' | 'react-query' | 'qiankun-bootstrap' | 'root' | string;
  [key: string]: unknown;
}

export function reportError(error: unknown, context: ReportContext = {}): void {
  const err = error instanceof Error ? error : new Error(String(error));
  log.error('caught error', {
    errName: err.name,
    errMessage: err.message,
    errStack: err.stack,
    ...context,
  });
}

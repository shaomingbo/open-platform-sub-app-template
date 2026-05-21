// Phase 1 mock auth accessor for standalone dev.
//
// Called from src/app.tsx at module top-level when
// `!window.__POWERED_BY_QIANKUN__`. Injects a mock accessor so axios
// interceptors + business code take the same `getToken()` path as in
// qiankun mode (where mount(props) overrides the mock with the real
// master-injected accessor).
//
// The mock token is a deliberate non-JWT literal. Production server-side
// rejects it; no information leaks since the token authenticates against
// nothing real. Webpack DCE cannot strip the standalone bootstrap (runtime
// `__POWERED_BY_QIANKUN__` check is value-based, not constant), so the
// mock literal does ship in production bundles — accepted trade-off.

import { createLogger } from '@/utils/logger';
import { setAuthAccessor } from './accessor';

const log = createLogger('mock-auth');

export function initStandaloneAuthMock(): void {
  setAuthAccessor({
    getToken: () => 'mock-token-standalone',
    refresh: async () => 'mock-token-standalone-refreshed',
    logout: () => {
      log.info('logout called in standalone mode');
    },
  });
}

// Umi Max runtime configuration for the sub-app.
//
// Exports consumed by the framework at boot:
//   - export const antd        — max.antd plugin runtime config (appConfig).
//   - export const qiankun     — slave lifecycle (bootstrap / mount / unmount).
//   - export async function getInitialState — populates @@initialState
//     model namespace, drives src/access.ts.
//   - export function rootContainer — wraps Umi's route tree with providers.
//
// Layer chain at runtime (outermost → innermost):
//
//   user rootContainer (this file):
//     <ErrorBoundary> → <ThemedRoot> → <QueryClientProvider>
//   Umi plugin providers (auto-injected by @umijs/renderer-react,
//   outermost → innermost):
//     outerProvider → dataflowProvider → accessProvider → i18nProvider →
//     innerProvider  (plugin-antd injects <App {...appConfig}/> here)
//   conventional global layout (src/layouts/index.tsx):
//     <NotifierRegistry/> + <Outlet/>
//   routes (src/pages/...)
//
// NotifierRegistry MUST live in src/layouts/index.tsx (inside plugin-antd's
// <App/>) — see that file's header for the rationale. Putting it in
// rootContainer here would call App.useApp() above the <App/> ancestor and
// hit the empty-context fallback.
//
// Lifecycle order invariant (load-bearing):
//   qiankun mode:    mount(props) → setAuthAccessor → defer.resolve →
//                    React render → plugin-initialState refresh() →
//                    await getInitialState
//   standalone mode: top-level initStandaloneAuthMock →
//                    React render → plugin-initialState refresh() →
//                    await getInitialState
//   Either way, setAuthAccessor runs strictly before getInitialState
//   (plugin-qiankun-slave's genMount awaits mount(props) before resolving
//   the deferred). Don't call getAuthAccessor() from any module-top-level
//   code that runs before mount.

// ARMS RUM init runs as a side-effect on first import — load it BEFORE any
// module that could throw so the SDK's window.onerror /
// unhandledrejection hooks register early enough to capture boot-time
// exceptions. Test environment (NODE_ENV='test') is gated inside arms.ts.
import '@/services/arms';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ThemedRoot } from '@/components/ThemedRoot';
import StandaloneLayout from '@/layouts/Standalone';
import { getAuthAccessor, setAuthAccessor } from '@/services/auth/accessor';
import { initStandaloneAuthMock } from '@/services/auth/mock';
import { queryClient } from '@/services/queryClient';
import { createLogger } from '@/utils/logger';
import '@/styles/global.css';

const log = createLogger('qiankun');

// Standalone dev mode bootstrap — injects a mock auth accessor at module
// top level so axios's first request can read `getAuthAccessor()?.getToken()`
// before any React renders. qiankun mode skips this; the real accessor
// arrives via mount(props) below and overwrites the mock.
if (typeof window !== 'undefined' && !window.__POWERED_BY_QIANKUN__) {
  initStandaloneAuthMock();
}

export const antd = {
  appConfig: {
    message: { maxCount: 3 },
  },
};

// qiankun slave lifecycle — master injects MicroAppProps via microAppProps
// in its app config; mount(props) wires the accessor here.
//
// basename: plugin-qiankun-slave reads props.basename and takes over the
// react-router base internally. Don't call history.push() inside mount —
// it conflicts with the plugin's own routing setup.

export interface MicroAppProps {
  getToken(): string | undefined;
  refresh(): Promise<string | undefined>;
  logout(): void;
  basename?: string;
}

export const qiankun = {
  async bootstrap() {
    log.info('bootstrap');
  },
  async mount(props: MicroAppProps) {
    log.info('mount', {
      hasGetToken: typeof props.getToken === 'function',
      basename: props.basename,
    });
    setAuthAccessor({
      getToken: props.getToken,
      refresh: props.refresh,
      logout: props.logout,
    });
  },
  async unmount() {
    log.info('unmount');
    // Do NOT clearAuthAccessor() here — avoids race with a fast
    // unmount → mount re-cycle. The next mount overwrites.
  },
};

// getInitialState — Umi access plugin runtime entry.
//
// Called by plugin-initialState/Provider on first render. By the time it
// runs, setAuthAccessor has already executed (see lifecycle invariant in
// the file header), so getAuthAccessor() returns the mock (standalone) or
// the real master-injected accessor (qiankun).
//
// Return shape matches src/access.ts's InitialState ({ jwt? }). Extend
// with business-domain fields (currentUser, theme, etc.) when needed.
export async function getInitialState(): Promise<{ jwt?: string }> {
  const accessor = getAuthAccessor();
  const jwt = accessor?.getToken();
  return { jwt };
}

export function rootContainer(container: ReactNode): ReactNode {
  // Standalone dev wraps routes in StandaloneLayout (Header + Content
  // padding) for a visible chrome. qiankun mode renders bare — master's
  // AppShell already provides the outer chrome.
  const inner =
    typeof window !== 'undefined' && window.__POWERED_BY_QIANKUN__ ? (
      container
    ) : (
      <StandaloneLayout>{container}</StandaloneLayout>
    );

  // 3 visible layers here. NotifierRegistry is NOT placed in rootContainer
  // because user rootContainer is OUTSIDE plugin-antd's <App/> wrapper —
  // see src/layouts/index.tsx for the wrap-order explanation.
  return (
    <ErrorBoundary scope="root">
      <ThemedRoot>
        <QueryClientProvider client={queryClient}>{inner}</QueryClientProvider>
      </ThemedRoot>
    </ErrorBoundary>
  );
}

// Module-level singleton bridge from React tree to non-React call sites.
//
// Why this file exists:
//   antd 6 `App.useApp()` returns message / modal / notification instances
//   only inside the React tree. axios interceptors, react-query onError,
//   zustand actions, etc. all live outside the React tree and can't call
//   `App.useApp()` directly. This module bridges the gap.
//
// How it works:
//   `<NotifierRegistry/>` (a React component mounted inside plugin-antd's
//   auto-injected `<App/>` via src/layouts/index.tsx) calls
//   `registerNotifier(...)` in its useEffect, injecting hook instances
//   into this module. Non-React code then calls `notifier.message().error(...)`
//   etc.
//
// =============================================================================
// TRADE-OFF 1 — registry is empty before NotifierRegistry's first mount.
// =============================================================================
//   Anything that runs before NotifierRegistry's first useEffect (axios
//   interceptors triggered synchronously, boot-time exceptions thrown
//   before React renders, etc.) hits the empty registry.
//
//   Decision: fall back to logger.error. **Do NOT buffer + flush on mount.**
//
//   Why no buffer? Buffering requires:
//     - bounded queue (avoid memory leaks)
//     - flush trigger in registerNotifier
//     - stale-message policy (a 500ms-old "Network error" toast firing after
//       the user has navigated is worse UX than silence)
//     - error-ordering guarantees
//   Complexity not worth it for a rare boot-window error. Revisit if
//   boot-window UX becomes a problem.
//
// =============================================================================
// TRADE-OFF 2 — HMR / React Strict Mode double-mount must overwrite cleanly.
// =============================================================================
//   In dev (Strict Mode, HMR), NotifierRegistry's useEffect can fire twice.
//   `registerNotifier` must support repeated registration by OVERWRITING
//   (direct assign — NEVER push to an array). Accidental array accumulation
//   means every HMR reload would cause `notifier.message().error('x')` to
//   fire N times.
// =============================================================================

import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';
import { createLogger } from './logger';

interface NotifierRefs {
  message: MessageInstance;
  notification: NotificationInstance;
  modal: Omit<ModalStaticFunctions, 'warn'>;
}

const log = createLogger('notifier');

let refs: NotifierRefs | null = null;

function fallbackLog(channel: string, args: unknown[]): void {
  log.error(`${channel} called before NotifierRegistry mounted`, { args });
}

export const notifier = {
  message: (): MessageInstance => {
    if (refs) return refs.message;
    return new Proxy({} as MessageInstance, {
      get:
        (_, method) =>
        (...args: unknown[]) =>
          fallbackLog(`message.${String(method)}`, args),
    });
  },
  notification: (): NotificationInstance => {
    if (refs) return refs.notification;
    return new Proxy({} as NotificationInstance, {
      get:
        (_, method) =>
        (...args: unknown[]) =>
          fallbackLog(`notification.${String(method)}`, args),
    });
  },
  modal: (): NotifierRefs['modal'] => {
    if (refs) return refs.modal;
    return new Proxy({} as NotifierRefs['modal'], {
      get:
        (_, method) =>
        (...args: unknown[]) =>
          fallbackLog(`modal.${String(method)}`, args),
    });
  },
};

/**
 * Register hook instances captured from <App/>'s `App.useApp()` return.
 * Repeated calls overwrite — see TRADE-OFF 2.
 */
export function registerNotifier(next: NotifierRefs): void {
  refs = next;
}

/** Internal helper for tests. */
export function clearNotifierForTest(): void {
  refs = null;
}

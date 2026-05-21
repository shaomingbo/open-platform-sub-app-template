// Module-level auth accessor singleton.
//
// Design:
//   - `currentAccessor` is a module-level singleton; setter injects
//     getToken/refresh/logout callables.
//   - axios interceptors (request.ts) read `getAuthAccessor()?.getToken()`
//     to attach Authorization headers.
//   - 401 → `await getAuthAccessor()?.refresh()` retry once, on second
//     failure invoke `logout()`.
//
// Injection sites:
//   - standalone dev    → src/services/auth/mock.ts at app.tsx top-level
//   - qiankun mode      → src/app.tsx qiankun.mount(props) wires real
//                         master-provided accessor over the mock.

export interface AuthAccessor {
  /** Current access token; undefined if not signed in / expired. */
  getToken(): string | undefined;
  /** Trigger refresh; resolves to a new token, or undefined on failure. */
  refresh(): Promise<string | undefined>;
  /** Clear store + redirect to /login (caller-defined behavior). */
  logout(): void;
}

let currentAccessor: AuthAccessor | undefined;

export function setAuthAccessor(accessor: AuthAccessor): void {
  currentAccessor = accessor;
}

export function getAuthAccessor(): AuthAccessor | undefined {
  return currentAccessor;
}

export function clearAuthAccessor(): void {
  currentAccessor = undefined;
}

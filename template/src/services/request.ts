// axios instance + interceptors.
//
// Auth pattern:
//   - The request interceptor reads `getAuthAccessor()?.getToken()` and
//     injects an `Authorization: Bearer <token>` header.
//   - The accessor is injected by src/app.tsx `qiankun.mount(props)` in
//     qiankun mode, or by src/services/auth/mock.ts `initStandaloneAuthMock()`
//     in standalone dev.
//
// Error reporting is wired through `reportError(error, { phase: 'request' })`
// (see src/utils/report.ts), which routes to ARMS for telemetry.
//
// What's NOT in the template (sub-app territory):
//   - 401 retry: when the response interceptor sees 401, call
//     `await getAuthAccessor()?.refresh()`, retry the original request once,
//     and on second failure call `getAuthAccessor()?.logout()`. Requires
//     concurrency lock + retry queue + redirect logic — add when your
//     sub-app's auth needs it.
//   - BusinessError typology + REDIRECT_ERROR_CODES / SPECIAL_ERROR_CODES
//     branches — domain-specific to your sub-app.
//   - user-visible toast on errors (`notifier.message().error(...)` or
//     `App.useApp().message.error(...)`) — wire per-business error mapping
//     when you have one.

import axios from 'axios';
import { reportError } from '@/utils/report';
import { getAuthAccessor } from './auth/accessor';

export const request = axios.create({
  baseURL: process.env.UMI_APP_API_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
});

// Request interceptor — Authorization header injection.
//
// accessor.getToken() returns:
//   - string (real token in qiankun mode, mock token in standalone) →
//     `Authorization: Bearer <token>`
//   - undefined (not signed in / expired / accessor not set up) →
//     don't attach Authorization; let the server handle 401.
request.interceptors.request.use((config) => {
  const token = getAuthAccessor()?.getToken();
  if (token !== undefined) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — telemetry + propagate.
//
// Telemetry-only here. user-visible UI (notifier toast / route redirect /
// BusinessError classification) is sub-app territory; wire it on top.
request.interceptors.response.use(
  (response) => response,
  (error) => {
    reportError(error, { phase: 'request' });
    return Promise.reject(error);
  },
);

export default request;

// MSW handlers — test-time mock for src/services/request.ts.
//
// Add per-business handlers as your sub-app's API surface grows. The
// `/api/health` stub mirrors mock/index.ts so both test and dev share the
// same endpoint.
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [http.get('/api/health', () => HttpResponse.json({ status: 'ok' }))];
export const server = setupServer(...handlers);

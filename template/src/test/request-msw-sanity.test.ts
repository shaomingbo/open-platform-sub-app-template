// request + msw sanity — proves the axios instance + msw setupServer +
// handlers chain is live under happy-dom + node http interception. Passing
// this is the floor for any per-business request tests.

import { describe, expect, it } from 'vitest';
import { request } from '@/services/request';

describe('request layer + msw sanity', () => {
  it('GET /api/health returns { status: ok } via msw mock', async () => {
    const res = await request.get('/api/health');
    expect(res.data).toEqual({ status: 'ok' });
  });
});

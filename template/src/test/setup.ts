import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './handlers';

// Mock @arms/rum-browser globally — the SDK transitively pulls rrweb whose
// package.json declares `"type": "module"` but
// `lib/record/rrweb-record.js` uses CJS `module.exports`. Under
// vitest/esbuild ESM parse, this crashes with `module is not defined`. The
// .umirc.ts `chainWebpack javascript/auto` rule fixes the webpack side;
// vitest doesn't run chainWebpack, so we bypass the SDK import chain here
// with a vi.mock. `reportError` in tests then routes through this no-op
// `sendEvent` and stays silent — telemetry never affects assertions.
vi.mock('@arms/rum-browser', () => ({
  default: { init: vi.fn(), sendEvent: vi.fn() },
  armsRum: { init: vi.fn(), sendEvent: vi.fn() },
}));

// Required by antd: matchMedia mock (happy-dom doesn't implement it).
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

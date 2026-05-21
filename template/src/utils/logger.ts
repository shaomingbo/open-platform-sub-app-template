// Project-wide logger — the SINGLE allowed `console` entry point in the
// sub-app.
//
// Why a module-local logger (vs 3rd-party loglevel / debug / pino / etc.):
//   - No new dep — @arms/rum-browser is already in deps for telemetry, and
//     this logger forwards warn/error to ARMS while keeping debug/info on
//     `console`.
//   - Per-sub-app ownership — each sub-app owns its logger and emits the
//     shared `properties.{app, version, ns, level, msg}` shape so the ARMS
//     dashboard can filter across sub-apps consistently.
//
// Channel routing:
//   dev   (NODE_ENV !== 'production' && !== 'test') — all levels → console
//   prod  (NODE_ENV === 'production')               — warn/error → console
//   test  (NODE_ENV === 'test')                     — silent everywhere
//   ARMS  warn/error only (volume control + alignment with the exception
//                          channel; debug/info would flood remote logging)
//
// Usage:
//   const log = createLogger('my-namespace');
//   log.warn('rate-limited', { traceId: 'abc' });
//   //   → console.warn('[my-namespace]', 'rate-limited', { traceId: 'abc' })
//   //   → armsRum.sendEvent({
//   //       event_type: 'exception',
//   //       name: '<APP_NAME>:my-namespace',
//   //       message: 'rate-limited',
//   //       source: 'logger:warn',
//   //       properties: {
//   //         app: '<APP_NAME>', version: '<APP_VERSION>',
//   //         ns: 'my-namespace', level: 'warn', msg: 'rate-limited',
//   //         traceId: 'abc',
//   //       },
//   //     });
//
// `APP_NAME` / `APP_VERSION` derive from `package.json` automatically — no
// manual sync needed after replacing the `name` field.

import { armsRum } from '@/services/arms';
import pkg from '../../package.json';

type Level = 'debug' | 'info' | 'warn' | 'error';
type Extra = Record<string, unknown>;

const APP_NAME = pkg.name;
const APP_VERSION = pkg.version;

// SDK type tunnel — `event_type: 'exception'` is RumEventType.EXCEPTION at
// runtime, but @arms/rum-core is an indirect dep (pnpm strict deps) so we
// can't import the enum directly. Same workaround as report.ts.
type SendEventPayload = Parameters<typeof armsRum.sendEvent>[0];
const EXCEPTION_EVENT_TYPE = 'exception' as SendEventPayload['event_type'];

export interface Logger {
  debug: (msg: string, extra?: Extra) => void;
  info: (msg: string, extra?: Extra) => void;
  warn: (msg: string, extra?: Extra) => void;
  error: (msg: string, extra?: Extra) => void;
}

// ARMS `properties` only accepts BaseObjectValue (string | number | boolean
// + nested + arrays). Flatten Extra → string. logger is the upstream, and
// report.ts is a thin wrapper that reuses this — don't reverse-import.
function flattenForProperties(extra: Extra): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(extra)) {
    if (value === undefined || value === null) continue;
    out[key] =
      typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
        ? String(value)
        : JSON.stringify(value);
  }
  return out;
}

function emit(level: Level, ns: string, msg: string, extra?: Extra): void {
  if (process.env.NODE_ENV === 'test') return;

  const isProd = process.env.NODE_ENV === 'production';
  const consoleAllowed = !isProd || level === 'warn' || level === 'error';

  if (consoleAllowed) {
    const method: 'log' | 'info' | 'warn' | 'error' = level === 'debug' ? 'log' : level;
    // eslint-disable-next-line no-console -- the project-wide single console entry
    console[method](`[${ns}]`, msg, extra ?? '');
  }

  if (level === 'warn' || level === 'error') {
    try {
      armsRum.sendEvent({
        event_type: EXCEPTION_EVENT_TYPE,
        name: `${APP_NAME}:${ns}`,
        message: msg,
        source: `logger:${level}`,
        properties: flattenForProperties({
          app: APP_NAME,
          version: APP_VERSION,
          ns,
          level,
          msg,
          ...extra,
        }),
      });
    } catch {
      // ARMS itself throwing must not recursively trigger logger.error.
      // Swallow silently — the observability layer must not pollute the
      // business flow.
    }
  }
}

export function createLogger(namespace: string): Logger {
  return {
    debug: (msg, extra) => emit('debug', namespace, msg, extra),
    info: (msg, extra) => emit('info', namespace, msg, extra),
    warn: (msg, extra) => emit('warn', namespace, msg, extra),
    error: (msg, extra) => emit('error', namespace, msg, extra),
  };
}

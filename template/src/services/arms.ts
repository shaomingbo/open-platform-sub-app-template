// ARMS RUM monitoring initialization + wrapper.
//
// SDK: @arms/rum-browser (exact-pinned in package.json).
//
// Each sub-app initializes its own armsRum instance against its own
// `service_id` so events stream into the right ARMS workspace. Don't try
// to share the master's instance via externals — qiankun sub-apps benefit
// from independent SDK contexts (separate service_id / env / app_name).
//
// Endpoint gating:
//   - `process.env.UMI_APP_ARMS_ENDPOINT` is replaced at build time by Umi.
//   - Empty or unset → skip init, console-only fallback. This is the
//     fork-safe default so a fresh fork never accidentally streams events
//     into an unintended workspace.
//   - dev + production both init (provided endpoint is set).
//   - Test environment (`NODE_ENV='test'`) skips init regardless, to keep
//     unit tests free of network side-effects.
//
// `reportError()` (src/utils/report.ts) is the structured entry for errors;
// `createLogger()` (src/utils/logger.ts) routes warn/error through ARMS
// `sendEvent`.

import armsRum from '@arms/rum-browser';

const ENDPOINT = process.env.UMI_APP_ARMS_ENDPOINT;

type ArmsEnv = 'prod' | 'gray' | 'pre' | 'daily' | 'local';

// UMI_ENV → ARMS env mapping. Defaults to 'prod' when UMI_ENV is unset to
// avoid mis-labeling production traffic as 'local'.
function resolveEnv(): ArmsEnv {
  const umiEnv = process.env.UMI_ENV;
  switch (umiEnv) {
    case 'local':
      return 'local';
    case 'dev':
    case 'daily':
      return 'daily';
    case 'test':
    case 'pre':
      return 'pre';
    case 'prod':
    case undefined:
      return 'prod';
    default:
      return 'prod';
  }
}

// Sensitive API path filter — block these paths from RUM resource
// telemetry. Extend with substring matches, regex, or predicates as your
// sub-app's API surface grows (auth, signin, password endpoints typically
// belong here).
const SENSITIVE_API_PATTERNS: string[] = [];

if (process.env.NODE_ENV !== 'test' && ENDPOINT) {
  void armsRum.init({
    endpoint: ENDPOINT,
    env: resolveEnv(),
    spaMode: 'history',
    tracing: false,
    filters: {
      resource: SENSITIVE_API_PATTERNS,
    },
  });
}

export { armsRum };
export default armsRum;

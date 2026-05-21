# Architecture

This template carries the architectural decisions distilled from the device
sub-app (Tasks 1–13). It is opinionated about boot flow, provider layering,
and how the sub-app talks to the qiankun master shell. If you need to diverge
from any of these, document the reason in your sub-app's own `docs/` so the
next person doesn't accidentally undo it.

## 5-layer `rootContainer` + 1-layer global layout

```
                              ── outermost
  user rootContainer (src/app.tsx)
   ├─ <ErrorBoundary scope="root">                  ← catches business-tree throws
   │   └─ <ThemedRoot>                              ← single antd ConfigProvider
   │       └─ <QueryClientProvider client={…}>      ← React Query
   │           └─ {container}  (= Umi's route tree)
   │
   └─ Umi plugin providers (auto-injected, outer→inner):
       outerProvider  → BrowserRouter etc.
       dataflowProvider
       accessProvider
       i18nProvider
       innerProvider  → <App {...appConfig}/>      ← max.antd injects <App/> HERE
         └─ src/layouts/index.tsx (conventional global layout)
             ├─ <NotifierRegistry/>                ← App.useApp() registers notifier
             └─ <Outlet/>                          ← routes mount here
                                                                    ── innermost
```

### Why NotifierRegistry is NOT in `rootContainer`

`App.useApp()` only returns real hook handles when called from **inside** the
`<App>` wrapper that `max.antd` plugin-antd injects. `<App>` is injected at
the `innerProvider` step — the **innermost** layer of Umi 4's plugin wrap
chain (`@umijs/renderer-react/dist/browser.js:77`, the `priority` array
iterated index 0 → end, comment "Lowest to the highest priority").

User `rootContainer` is the **outermost** layer. A `<NotifierRegistry/>`
placed there sits ABOVE `<App>` → `App.useApp()` returns the default empty
context (`{message:{}, modal:{}, notification:{}}`) → module-level
`notifier.*` calls fall back to the Proxy (which logs an error and never
invokes a real antd hook).

`src/layouts/index.tsx` is Umi 4's conventional global layout. It's wired
via `addParentRoute({ addToAll: true })` regardless of whether routes come
from config (`.umirc.ts routes:`) or convention (`src/pages/`) — verified in
`@umijs/preset-umi/dist/features/tmpFiles/routes.js:97-129`. The layout
renders inside the route tree, which is inside `<App>`. So
`<NotifierRegistry/>` mounted here gets the real `App.useApp()` HookAPI.

**Discovery credit**: the device sub-app at Task 13. Device was the first
slave to exercise `notifier.modal().confirm()` from a real React click
handler and immediately hit the empty-context bug. The fix is upstream-PR'd
to master; see [`upstream-master-pr.md`](upstream-master-pr.md).

## Boot flow + lifecycle order

```
0. ARMS RUM SDK init                       (src/services/arms.ts — FIRST import)
1. Theme bootstrap                          (Standalone only; qiankun owns its own)
2. Standalone auth mock                     (only if !__POWERED_BY_QIANKUN__)
3. Umi calls export const antd / qiankun    (read by max.antd / plugin-qiankun-slave)
4. qiankun-slave plugin awaits mount(props) (qiankun mode only)
   → setAuthAccessor(props)                 (real accessor injected over mock)
5. React tree renders                       (rootContainer wrap chain)
6. plugin-initialState refresh()
   → await getInitialState()                (reads accessor → returns { jwt })
7. access plugin reads initialState         (drives useAccess())
8. routes render                            (page components, App.useApp() works)
```

Steps 4 and 6 are ordered: plugin-qiankun-slave's `genMount` awaits
`mount(props)` before resolving its boot deferred, so `setAuthAccessor` is
guaranteed to run before `getInitialState`. This is the load-bearing
invariant — never call `getAuthAccessor()` from module-level top-level code
without a `typeof window` / `__POWERED_BY_QIANKUN__` guard.

## The `accessor → initialState → access` wire

```
src/services/auth/accessor.ts          src/app.tsx              src/access.ts
┌──────────────────────────────┐    ┌───────────────────────┐  ┌──────────────────┐
│ module-level singleton:      │    │ getInitialState() {   │  │ default ({jwt})  │
│   currentAccessor            │ ──▶│   acc = getAccessor() │──│  → { canSee }    │
│   setAuthAccessor()          │    │   return {            │  │                  │
│   getAuthAccessor()          │    │     jwt: acc?.token() │  │                  │
└──────────────────────────────┘    │   }                   │  └──────────────────┘
        ▲                            │ }                     │           │
        │                            └───────────────────────┘           ▼
        │                                                       ┌────────────────────┐
   set from:                                                    │ useAccess() →      │
   - qiankun mount(props) (real master accessor)               │  access.canSee     │
   - initStandaloneAuthMock (mock token in dev)                 └────────────────────┘
```

`initialState` is the bridge between async accessor reads and synchronous
`useAccess()` reads. Component code never calls `getAuthAccessor()` directly
— it always goes through `useAccess()`.

## antd v6 `prefixCls` + cssVar

- `prefixCls` is set in `ThemedRoot.tsx` to the sub-app's `{{PREFIX_CLS}}`
  placeholder (e.g. `device`, `engagement`, `my-sub-app`). All antd DOM
  classes become `<prefix>-button`, `<prefix>-modal-root`, etc. — including
  **portal-render** components like `Modal`, `Drawer`, `Popover` (verified
  by `src/test/spike-prefixcls.test.tsx` and the Task 13 runtime click test
  in device).
- `cssVar.prefix` is set to `{{CSS_VAR_PREFIX}}` (default `op` — matches
  master). antd v6 cssVar hashes attach to portal nodes as
  `<prefix>-modal-css-var`, sharing the same hash with inline non-portal
  nodes.
- The sub-app does NOT bring its own `ConfigProvider` `theme` token —
  tokens come from `src/styles/tokens.json` (derived 1:1 from
  `platform-design`).

`oxlint` enforces "no direct `import { message, notification, Modal } from
'antd'`" via `no-restricted-imports`. Use `App.useApp().{message,modal,
notification}` inside React components, or the module-level `notifier.*`
exports from `@/utils/notifier` outside React.

## Three-piece access plugin

`access` plugin alone won't boot. You need all three:

```js
// .umirc.ts
access: {},
model: {},
initialState: {},
```

- `access` — reads `src/access.ts` as the access function entry.
- `model` — provides the `useModel('@@initialState')` hook that `access`
  plugin's runtime consumes.
- `initialState` — provides the `@@initialState` model namespace that
  plugin-initialState populates via `getInitialState`.

Master and console-engagement both register all three (master `app.tsx`
inline comment confirms). Don't omit any.

## Logger / report / ARMS three-layer

```
   any caller       ──▶  createLogger('namespace')  ──▶  console.* (the SOLE entry)
                                  │
                                  ├─ ARMS sendEvent (if init'd)
                                  └─ formatted output `[namespace] msg`

   throw / error    ──▶  reportError(err, {scope})  ──▶  armsRum.sendException
                                                    ──▶  log.error(formatted)
```

- **Single `console.*` entry** — `src/utils/logger.ts` is the only file in
  `src/` that calls `console.*` (enforced by `oxlint no-console: warn` and a
  scoped `eslint-disable-next-line` carve-out in logger). Every other module
  uses `createLogger('namespace').{info,warn,error,debug}`.
- The `APP_NAME` shown in logs auto-derives from `package.json#name`.
- `reportError` is the structured entry for errors that escape into
  ErrorBoundary / `componentDidCatch` / global `unhandledrejection`.

## Standalone vs qiankun mode

```
                          standalone (pnpm dev)              qiankun mode (mount from master)
┌─────────────────────────────────────────────────────┬─────────────────────────────────────────┐
│ basename                                            │                                         │
│  derived from package.json#name                     │ inherited from props.basename           │
│  (`/{{APP_NAME}}`, e.g. `/open-platform-device`).   │ (master URL prefix, e.g.                │
│  NOT `/` — Umi auto-prefixes to avoid root          │ `/console/device`).                     │
│  collision in dev.                                  │                                         │
├─────────────────────────────────────────────────────┼─────────────────────────────────────────┤
│ auth accessor                                       │                                         │
│  initStandaloneAuthMock() runs at module load       │ mount(props) → setAuthAccessor(props)   │
│  (`__POWERED_BY_QIANKUN__` is undefined).           │ injects the real accessor.              │
├─────────────────────────────────────────────────────┼─────────────────────────────────────────┤
│ Layout shell                                        │                                         │
│  StandaloneLayout (Layout + Header padding) wraps   │ container rendered as-is (master's      │
│  routes so dev mode has visible chrome.             │ AppShell is the outer chrome).          │
└─────────────────────────────────────────────────────┴─────────────────────────────────────────┘
```

The standalone mock token is a literal string `mock-token-standalone` —
production rejects it server-side. Webpack DCE cannot eliminate it (runtime
`__POWERED_BY_QIANKUN__` check is a value-based gate), but that's accepted:
no actual credential leaks since the token doesn't authenticate against
anything real.

## What's deliberately deferred

- `applyTheme` DOM `data-theme` sync — `themeStore` is a module-level stub
  here. Sub-apps that need dark/light switching wire `applyTheme.ts` from
  master (see master pattern); device hasn't yet (Task 13/14 scope per
  device's own plan).
- `request.ts` / `queryClient.ts` integration with `notifier` toast — the
  template ships the typology hooks but no auto-toast. Sub-apps wire their
  own per-business error mapping when they have one.
- Real `currentUser` / business-domain fields in `getInitialState` — the
  template returns `{ jwt? }` only. Business state expansion is sub-app
  territory.

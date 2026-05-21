# Troubleshooting

Gotchas surfaced during device sub-app Tasks 1–13. New sub-apps will hit
these in similar order if they follow the template's task progression.

## MFSU stale cache

**Symptom**: `pnpm dev` fails with `Module not found: ... fast-deep-equal`
or similar dependency that *should* be there. Persists across `pnpm
install` and even `rm -rf node_modules && pnpm install`.

**Cause**: Umi MFSU pre-bundles dependencies into a cache (`src/.umi/cache/
mfsu-v4/` and `node_modules/.cache/mf/`). When dependencies update but
cache hashes don't invalidate, the cache references stale module paths.

**Fix**:

```bash
mv src/.umi /tmp/
mv node_modules/.cache /tmp/
pnpm dev
```

(Not `rm -rf` — the user's hook setup blocks `rm -rf` for safety. `mv` to
`/tmp/` is the safe escape hatch.)

## rrweb dual-package CJS/ESM crash

**Symptom**: Boot crashes with `ReferenceError: module is not defined` in
`lib/record/rrweb-record.js`. Started after adding `@arms/rum-browser`
(transitive dep `rrweb@2.0.0-alpha.4`).

**Cause**: rrweb's `package.json` has `"type": "module"` but
`lib/record/rrweb-record.js` uses CJS `module.exports`. Webpack defers to
`type: module` and parses as ESM → `module` undefined → boot crash.

**Fix in template** (`.umirc.ts`):

```js
chainWebpack(memo) {
  memo.module
    .rule('rrweb-record-cjs-fix')
    .test(/rrweb-record\.js$/)
    .set('type', 'javascript/auto');
}
```

`javascript/auto` lets webpack detect format from content. The rule is
already in the template — don't remove it.

**Vitest also needs a fix** (separate from webpack):

```js
// src/test/setup.ts
vi.mock('@arms/rum-browser');
```

ARMS SDK is not exercised in tests anyway.

## chrome-devtools-mcp profile lock → Playwright fallback

**Symptom**: `mcp__chrome-devtools__navigate_page` fails with profile-lock
error when your daily Chrome session is already open.

**Workaround**: Use `mcp__playwright__browser_navigate` instead, with the
default isolated session. Re-launches a clean profile per-run, no overlap
with your daily Chrome state. Tradeoff: no shared login state, so manual
sign-in steps.

For sub-app dev verification, Playwright with `isolatedContext` is
typically fine — most sub-app tests don't need real auth (the mock token
covers it).

## macOS proxy intercepts localhost

**Symptom**: `curl http://localhost:8000/...` hangs or returns proxy error
when a system proxy (Clash / Surge / etc.) is on.

**Fix**:

```bash
curl --noproxy '*' http://localhost:8000/...
```

Or set `NO_PROXY=localhost,127.0.0.1` in the shell.

## Service Worker pollution across local dev servers

**Symptom**: After running another local project (port 3000, 5173, etc.)
with a Service Worker, switching to this sub-app's dev server shows stale
content / old assets.

**Fix**: When verifying via `chrome-devtools-mcp`, pass `isolatedContext`
mode so the test runs in a clean profile without inherited SW
registrations.

## Standalone basename is `/<package.name>`, NOT `/`

**Symptom**: After `pnpm dev`, the page renders at
`http://localhost:8000/my-sub-app/` not `http://localhost:8000/`. Initial
navigation works but `<Link to="/">` lands at wrong URL.

**Cause**: Umi auto-prefixes the basename with `package.json#name` in
standalone mode (this is intentional, prevents root collision when running
multiple Umi apps on the same machine). The qiankun-slave plugin overrides
this with `props.basename` when mounted by master.

**Adapt**: All `Link to=` and `useNavigate` calls should use relative paths
or paths starting with `/` — both Standalone and qiankun mode resolve them
through React Router which knows about the active basename.

## Standalone mock token enters production bundle

**Symptom**: `grep mock-token` finds matches in `dist/<version>/umi.js`.

**Cause**: The standalone mock auth runs in an `if (typeof window !==
'undefined' && !window.__POWERED_BY_QIANKUN__)` runtime gate. Webpack DCE
doesn't strip it because the condition is value-based, not constant.

**Accepted risk**: `mock-token-standalone` is a literal that the real
backend rejects. No information leaks since the token authenticates against
nothing in production. If your security policy requires this stripped, gate
it on `process.env.NODE_ENV !== 'production'` instead.

## antd v6 breaking changes (vs v5)

- `<Space direction="vertical">` → `<Space orientation="vertical">` (renamed
  in v6).
- Static `import { Modal, message, notification } from 'antd'` is deprecated
  and emits a console warning. Use `App.useApp().{message,modal,notification}`
  in React components, or the module-level `notifier.*` from
  `@/utils/notifier` outside React. The template's `.oxlintrc.jsonc`
  enforces this via `no-restricted-imports`.
- `app.config` JSX prop / static `Modal.confirm` calls still work but with
  the deprecation warning. Don't bypass — use the hook API.

## Access plugin needs three pieces, not one

`access: {}` alone won't boot. The full set:

```js
// .umirc.ts
access: {},
model: {},
initialState: {},
```

See [`architecture.md`](architecture.md) for the explanation. The template
ships all three.

## Umi 4 conventional dynamic routes use `$param.tsx`

**Symptom**: `src/pages/[deviceId].tsx` doesn't match `/device-001` —
returns 404.

**Cause**: Umi 4 conventional routes use the `$param` syntax (verified in
`@umijs/preset-umi`'s `routesConvention.js:87`, `replace($→:`)). The
`[param]` syntax is Next.js, not Umi.

**Fix**: rename `[id].tsx` → `$id.tsx`. The template's dynamic detail page
is `template/src/pages/$id.tsx`.

## ARMS bundle is heavy (~30 KB gzipped)

`@arms/rum-browser` with rrweb pulls ~30 KB gzipped into `umi.js`. If your
sub-app is small and ARMS overhead is a concern, consider:

- Lazy-loading ARMS init (split into a deferred async chunk).
- Conditional init based on `UMI_ENV` (skip `local` / `dev`).

The template inits ARMS eagerly because the SDK's `window.onerror` hooks
should be in place before any other module throws. Reorder only if you
understand the trade-off.

## react-intl bundle is heavy too

Umi locale plugin pulls `react-intl` (~30 KB). This is fixed by the
plugin — no opt-out short of removing locale support entirely. Accept it as
the cost of i18n.

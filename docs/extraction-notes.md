# Extraction notes (v0 audit trail)

This file is the audit trail for the template's v0 baseline. It records
**what was extracted from where**, what was simplified, and what was left
behind. Use this as the diff source when v1 lands.

## Provenance

- **Source**: `/Users/shaomingbo/Code/web/open-platform/device` at commit
  `4e24e18` (Task 13 complete + Task 13.5 triggers documented).
- **Extraction date**: 2026-05-21.
- **Extractor**: Claude Code on behalf of 明博, autonomous (明博 ack'd 5
  decision points and delegated execution).

## File-by-file mapping

### Top-level configs

| Template | From device | Parameterized | Notes |
|---|---|---|---|
| `.env.example` | `.env.example` | `{{YAPI_CATEGORY}}` | Header comment cleaned (`device`-specific phrasing removed). `UMI_APP_ARMS_ENDPOINT=` empty kept (fork-safe default). |
| `.gitignore` | `.gitignore` | — | 1:1. |
| `.npmrc` | `.npmrc` | — | 1:1. |
| `.nvmrc` | `.nvmrc` | — | 1:1. Node `22.22.0`. |
| `.oxfmtrc.json` | `.oxfmtrc.json` | — | 1:1. |
| `.oxlintrc.jsonc` | `.oxlintrc.jsonc` | — | 1:1. The `__POWERED_BY_QIANKUN__` carve-out and the `no-restricted-imports` antd rule are both load-bearing. |
| `.umirc.ts` | `.umirc.ts` | — | Comments cleaned to remove `device` / plan-§X / master-engagement references. The `chainWebpack rrweb-record-cjs-fix` rule kept as-is (generic ARMS gotcha). |
| `lefthook.yml` | `lefthook.yml` | — | Header comment cleaned. `docs/**` exclude in `format-staged` kept (template users likely want the same carve-out for their CJK/ASCII-art docs). |
| `package.json` | `package.json` | `{{APP_NAME}}` | All deps exact-pinned. Scripts 1:1. |
| `tsconfig.json` | `tsconfig.json` | — | 1:1. |
| `vitest.config.ts` | `vitest.config.ts` | — | 1:1. |
| `ytt.config.ts` | `ytt.config.ts` | `{{YAPI_CATEGORY}}` | Comments cleaned (`device` / `master 3316` comparison removed); just describes the YAPI codegen flow generically. |

### `src/`

| Template | From device | Parameterized / changed | Notes |
|---|---|---|---|
| `src/access.ts` | `src/access.ts` | — | 1:1. `{ jwt? }` stub. |
| `src/app.tsx` | `src/app.tsx` | — | Comments cleaned (Task X references → generic narrative). `qiankun.bootstrap/mount/unmount` lifecycle kept verbatim. The Task 13 layout-position commentary kept (load-bearing). |
| `src/components/ErrorBoundary.tsx` | `src/components/ErrorBoundary.tsx` | — | 1:1. Class component (React 19 still requires class for error boundaries). |
| `src/components/NotifierRegistry.tsx` | `src/components/NotifierRegistry.tsx` | — | 1:1. |
| `src/components/ThemedRoot.tsx` | `src/components/ThemedRoot.tsx` | `{{PREFIX_CLS}}`, `{{CSS_VAR_PREFIX}}` | Comments cleaned. |
| `src/layouts/index.tsx` | `src/layouts/index.tsx` | — | 1:1. Comments cleaned (device-specific Task 13 narrative → generic). |
| `src/layouts/Standalone.tsx` | `src/layouts/Standalone.tsx` | — | 1:1. |
| `src/locales/en-US.ts` | `src/locales/en-US.ts` | `{{LOCALE_NS}}` | `page.device-list/.detail.*` → `{{LOCALE_NS}}list/.detail.*`. Message text simplified to neutral English (`Items`, `Item Detail`). |
| `src/locales/zh-CN.ts` | `src/locales/zh-CN.ts` | `{{LOCALE_NS}}` | Same as en-US. |
| `src/pages/index.tsx` | `src/pages/index.tsx` | `{{LOCALE_NS}}` | **Simplified**: removed `useAccess()` demo (device Task 10 verification residue), removed portal-render Modal spike button (device Task 13 verification residue), removed `<Link to="/device-001">` placeholder. Kept the bare minimum: Title + Button + neutral placeholder text. |
| `src/pages/$id.tsx` | `src/pages/$deviceId.tsx` | `{{LOCALE_NS}}`, **renamed file** | `useParams<{ deviceId }>` → `useParams<{ id }>`. The parameter name `id` is generic. |
| `src/services/arms.ts` | `src/services/arms.ts` | — | Comments cleaned (device / plan §4.8 references → generic). Logic 1:1. |
| `src/services/auth/accessor.ts` | `src/services/auth/accessor.ts` | — | Comments cleaned. |
| `src/services/auth/mock.ts` | `src/services/auth/mock.ts` | — | Comments cleaned. Mock literal `mock-token-standalone` kept. |
| `src/services/queryClient.ts` | `src/services/queryClient.ts` | — | 1:1. |
| `src/services/request.ts` | `src/services/request.ts` | — | 1:1. |
| `src/stores/themeStore.ts` | `src/stores/themeStore.ts` | — | 1:1. |
| `src/styles/global.css` | `src/styles/global.css` | — | 1:1. |
| `src/styles/theme.ts` | `src/styles/theme.ts` | — | 1:1. |
| `src/styles/tokens.json` | `src/styles/tokens.json` | — | 1:1. Derived from `platform-design`. |
| `src/styles/tokens.ts` | `src/styles/tokens.ts` | — | 1:1. |
| `src/test/setup.ts` | `src/test/setup.ts` | — | 1:1. |
| `src/test/sanity.test.ts` | `src/test/sanity.test.ts` | — | 1:1. |
| `src/test/handlers.ts` | `src/test/handlers.ts` | — | 1:1. MSW handlers stub. |
| `src/test/request-msw-sanity.test.ts` | `src/test/request-msw-sanity.test.ts` | — | 1:1. |
| `src/test/request-react-query-sanity.test.tsx` | `src/test/request-react-query-sanity.test.tsx` | — | 1:1. |
| `src/types/css.d.ts` | `src/types/css.d.ts` | — | 1:1. |
| `src/types/qiankun.d.ts` | `src/types/qiankun.d.ts` | — | 1:1. |
| `src/utils/logger.ts` | `src/utils/logger.ts` | — | 1:1. `APP_NAME = pkg.name` reads automatically — no parameterization needed. |
| `src/utils/notifier.ts` | `src/utils/notifier.ts` | — | 1:1. |
| `src/utils/report.ts` | `src/utils/report.ts` | — | 1:1. |
| `mock/index.ts` | `mock/index.ts` | — | 1:1. Stub. |

### Deliberately **not** copied

| File | Reason |
|---|---|
| `src/types/api/**` | YAPI-generated; sub-app runs `pnpm generate:api` after replacing `{{YAPI_CATEGORY}}`. |
| `src/test/spike-prefixcls.test.tsx` | Task 4 device-specific verification spike (asserts `device-*` prefix on a fixed set of nodes). New sub-apps don't need it — the spike was a one-off to confirm `prefixCls` propagation, which v0 documents in `architecture.md`. |
| `docs/` (device's docs) | Device's docs are about the device sub-app journey (plan, decisions, etc.). The template's `docs/` is for template users. New sub-apps write their own. |
| `.env.local` | Per-sub-app secret. |
| `dist/`, `coverage/`, `node_modules/`, `src/.umi/`, `src/.umi-production/`, `.playwright-mcp/` | Build/cache artifacts. |
| `pnpm-lock.yaml` | Re-generated by sub-app's first `pnpm install`. |

## Six placeholders introduced

See [`parameters.md`](parameters.md) for the full table. Summary:

| Placeholder | Replacement (device baseline) | Files touched |
|---|---|---|
| `{{APP_NAME}}` | `open-platform-device` | `package.json` |
| `{{PREFIX_CLS}}` | `device` | `src/components/ThemedRoot.tsx` |
| `{{CSS_VAR_PREFIX}}` | `op` | `src/components/ThemedRoot.tsx` |
| `{{YAPI_CATEGORY}}` | `3298` | `ytt.config.ts`, `.env.example` |
| `{{YAPI_PROJECT_ID}}` | `144` | reserved — not in template by default |
| `{{LOCALE_NS}}` | `page.device-` | `src/locales/zh-CN.ts`, `src/locales/en-US.ts`, `src/pages/index.tsx`, `src/pages/$id.tsx` |

## Master upstream fix coordinated

The Task 13 NotifierRegistry positional bug was originally a master pattern
issue (master shipped `<NotifierRegistry/>` in `rootContainer` even though
the Umi 4 plugin wrap order puts it outside `<App/>`). Device fixed it
locally first; the template ships the fix. A corresponding PR to master is
prepared:

- **Branch (master local)**: `fix/notifier-conventional-layout`
- **PR body**: `<master>/PR_BODY-fix-notifier-conventional-layout.md`
- **Status**: ready to push (明博 reviews + pushes after return)

See [`upstream-master-pr.md`](upstream-master-pr.md) for the full PR rationale.

## Known v1 audit items

The next sub-app to fork from this template should specifically check:

1. **Locale namespace pattern**: device used `page.device-list.*` /
   `page.device-detail.*` with explicit page name. `{{LOCALE_NS}}` =
   `page.device-` flattens the page name into the placeholder, which only
   works if sub-app keys keep the same shape (`page.<sub-app>-<page>.<field>`).
   If a sub-app wants a deeper namespace (e.g.
   `page.<sub-app>.<area>.<page>.<field>`), this placeholder needs to be
   redesigned.

2. **`src/pages/index.tsx` simplification**: device's `index.tsx` had a
   useful `useAccess()` wire-check + portal-render Modal spike button. The
   template stripped both for cleanliness — sub-apps that want to verify
   their own access wire / portal-render setup may want to re-add a spike
   page (maybe `src/pages/_diag.tsx` or similar). Decide once we see
   multiple sub-apps and a pattern emerges.

3. **`src/test/spike-prefixcls.test.tsx`**: see above. Worth re-introducing
   if sub-app `prefixCls` collisions become a recurring concern.

4. **ARMS endpoint sharing strategy**: device decided each sub-app has its
   own ARMS `service_id` (plan §4.8). Template documents this in
   `architecture.md`. Confirm or revise when the second sub-app's ARMS
   workspace settles.

5. **Mock auth token in production bundle**: see `troubleshooting.md` —
   accepted trade-off. If any sub-app security review pushes back, the fix
   is to gate `initStandaloneAuthMock()` on `process.env.NODE_ENV !==
   'production'`. Template ships the current device pattern.

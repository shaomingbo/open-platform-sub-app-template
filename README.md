# open-platform-sub-app-template

Sub-app template for the open-platform qiankun monorepo. **v0** by the device
sub-app at Task 13.5 (2026-05-21) — Tasks 1–13 generic infrastructure baked
into a single fork-friendly starting point.

## What's included (Tasks 1–13 generic)

- **Scaffold**: Umi Max 4.6.9 + React 19.2 + TypeScript 6 (all deps `exact`-pinned).
- **Toolchain**: oxlint + oxfmt + lefthook + vitest + msw.
- **Design tokens**: derived from `platform-design`, antd v6 with custom `prefixCls`.
- **Network**: axios + Umi mock + 401 refresh handshake against a module-level
  auth accessor.
- **Codegen**: yapi-to-typescript wiring (`pnpm generate:api`).
- **Data layer**: `@tanstack/react-query` with a single `QueryClient`.
- **qiankun slave**: lifecycle + Standalone fallback + mount-props accessor injection.
- **Routes / access / i18n**: Umi conventional routes, access plugin three-piece
  (access + model + initialState), Umi locale (4 fields).
- **State stores**: zustand themeStore + `getInitialState` wire (`accessor →
  initialState → access`).
- **Observability**: `@arms/rum-browser` init + project-wide `logger` (the
  sole `console.*` entry) + `reportError`.
- **Notifiers + Error boundary**: `NotifierRegistry` + `ErrorBoundary`,
  mounted via Umi 4 conventional global layout (fixes the master-canonical
  positional bug where `App.useApp()` returned an empty default context).

See [`docs/architecture.md`](docs/architecture.md) for the 5-layer
`rootContainer` wrap pattern, plugin wrap order, wire-chain diagram, and
sub-app vs. master differences.

## What's NOT included (sub-app responsibilities)

- Business pages (Task 14+ in the device timeline).
- Domain-specific YAPI generated types (`src/types/api/`) — run `pnpm
  generate:api` once you've set `YAPI_TOKEN` in `.env.local`.
- Locale message keys past the namespace stub.
- ARMS endpoint configuration (`.env.local` per-sub-app `pid` / `endpoint`).
- The sub-app's actual product code.

## Quick start

1. **Copy the template** to your new directory:

   ```bash
   cp -r open-platform-sub-app-template/template open-platform/my-sub-app
   cd open-platform/my-sub-app
   ```

2. **Replace the 6 placeholders** — see [`docs/parameters.md`](docs/parameters.md)
   for the full list and meaning. On macOS BSD sed (Linux: drop the trailing
   `''` after `-i`):

   ```bash
   find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.json" \
        -o -name "*.css" -o -name "*.md" -o -name "*.jsonc" -o -name "*.yml" \
        -o -name ".env*" \) \
     -not -path "./node_modules/*" \
     -exec sed -i '' \
       -e 's/{{APP_NAME}}/my-sub-app/g' \
       -e 's/{{PREFIX_CLS}}/myapp/g' \
       -e 's/{{CSS_VAR_PREFIX}}/op/g' \
       -e 's/{{YAPI_CATEGORY}}/3300/g' \
       -e 's/{{YAPI_PROJECT_ID}}/144/g' \
       -e 's|{{LOCALE_NS}}|page.myapp-|g' \
       {} +
   ```

3. **Install dependencies**:

   ```bash
   pnpm install
   ```

4. **Set up `.env.local`** for YAPI codegen + ARMS RUM:

   ```bash
   cp .env.example .env.local
   # edit YAPI_TOKEN and UMI_APP_ARMS_ENDPOINT
   ```

5. **Generate API types** (optional, once `YAPI_TOKEN` is set):

   ```bash
   pnpm generate:api
   ```

6. **Start the dev server**:

   ```bash
   pnpm dev
   ```

## Evolution

- **v0** (2026-05-21): seeded from the device sub-app at commit `4e24e18`
  (Task 13 complete).
- **v1** (expected): real-world parameterization audit when the second
  sub-app is forked from this template. Anything device-specific that leaks
  through gets caught and parameterized away here.
- **v2+**: continued evolution as new shared infrastructure decisions land in
  one of the sub-apps and propagate upstream.

## Related

- **master repo**: <https://github.com/<account>/open-platform-master>
- **master PR** (NotifierRegistry conventional layout): branch
  `fix/notifier-conventional-layout`, pending push + PR. See
  [`docs/upstream-master-pr.md`](docs/upstream-master-pr.md) for the full
  rationale.

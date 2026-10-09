# Upstream master PR — NotifierRegistry conventional layout

The template's `src/layouts/index.tsx` carries a fix that originated in the
device sub-app at Task 13 and corrects a latent positional bug in the master
canonical pattern. This file is the record of the cross-repo coordination.

## What master gets wrong

`master/src/app.tsx` (at `main` HEAD before this fix) places
`<NotifierRegistry/>` inside `rootContainer`:

```tsx
export function rootContainer(container: ReactNode): ReactNode {
  return (
    <ErrorBoundary scope="root">
      <NotifierRegistry />            //  ← positioned here
      <ThemedRoot>
        <QueryClientProvider client={queryClient}>{container}</QueryClientProvider>
      </ThemedRoot>
    </ErrorBoundary>
  );
}
```

The inline comment claims "max.antd's `<App/>` wrapper lives at a higher
level [...] so `App.useApp()` in NotifierRegistry works regardless of
ThemedRoot's position." This is **wrong**:

- Umi 4 plugin wrap order
  (`@umijs/renderer-react/dist/browser.js:77`) sets
  `['innerProvider', 'i18nProvider', 'accessProvider', 'dataflowProvider',
  'outerProvider', 'rootContainer']` with comment "Lowest to the highest
  priority", iterated index 0 → end = innermost → outermost.
- `plugin-antd` injects `<App/>` at `innerProvider` — the **innermost** layer.
- User `rootContainer` is the **outermost**.
- `<NotifierRegistry/>` in `rootContainer` therefore sits ABOVE `<App/>` →
  `App.useApp()` returns the default empty context
  (`{message:{}, modal:{}, notification:{}}`).
- Module-level `notifier.*` callers silently hit the Proxy fallback (logs
  an error, never invokes a real antd hook).

## Why master never noticed

Master's `App.useApp()` callers all live inside route components (e.g.
`AppShell`'s `UserMenu`, `Login` page, etc.). Route components render
inside `<App/>` (the route tree is what `innerProvider` wraps), so direct
`App.useApp()` calls work.

Only the **module-level `notifier.*` path** — designed for axios
interceptors, error reporters, anywhere outside the React tree — requires
`NotifierRegistry` to register hook instances from inside `<App/>`. Master
had not yet wired up a module-level call site, so the bug stayed latent.

## How device surfaced it

Device's Task 13 includes a portal-render Modal spike (Task 4 closure):

```tsx
<Button onClick={() => {
  notifier.modal().confirm({ title: '...', content: '...' });
}}>
  portal-render Modal spike
</Button>
```

This is the first cross-cutting use of `notifier.*` in the codebase.
Calling it triggered the Proxy fallback and crashed the spike, leading to
the wrap-order investigation in `@umijs/renderer-react`'s source and the
conventional-layout fix.

## The fix

`src/layouts/index.tsx` Umi 4 conventional global layout:

```tsx
import { Outlet } from '@umijs/max';
import { NotifierRegistry } from '@/components/NotifierRegistry';

export default function GlobalLayout() {
  return (
    <>
      <NotifierRegistry />
      <Outlet />
    </>
  );
}
```

Conventional layout is wired via `addParentRoute({ addToAll: true })` to
ALL routes — verified in
`@umijs/preset-umi/dist/features/tmpFiles/routes.js:97-129`. It works for
both config-mode routes (master's case, `.umirc.ts routes:`) and
convention-mode routes (device's case, `src/pages/`). The layout component
renders inside the route tree, inside `<App/>`. `App.useApp()` now returns
the real HookAPI.

Build verification: webpack emits a new `layouts__index.async.js` chunk
(~333 B for master, ~577 B for device) wrapping existing routes.

## PR status

- **Local branch (in `<master>`)**: `fix/notifier-conventional-layout`
- **Commit (in `<master>`)**: `c520a07` (see `<master>/PR_BODY-fix-
  notifier-conventional-layout.md` for full PR description)
- **Status**: ready to push. 明博 reviews + pushes after returning.

After push:

```bash
cd ../master
git checkout fix/notifier-conventional-layout
git push -u origin fix/notifier-conventional-layout
# Then open PR with the PR_BODY content on GitHub:
#   https://github.com/<account>/open-platform-master/compare/main...fix/notifier-conventional-layout
```

## Backward compatibility

- `App.useApp()` callers inside route components are unaffected — they were
  never broken.
- Module-level `notifier.*` callers move from Proxy fallback (silent
  `log.error`) to real antd Modal/message/notification render. This is the
  intended behavior.
- No public API changes.

// Umi 4 conventional global layout — wraps **all** routes (both config-mode
// and convention-mode).
//
// Why this file exists:
//   <NotifierRegistry/> calls App.useApp() to read antd 6 message/modal/
//   notification hook instances. App.useApp() only returns real handles
//   when the calling component is INSIDE plugin-antd's <App/> wrapper.
//
//   max.antd plugin-antd injects <App/> at `innerProvider` — the innermost
//   layer of Umi 4's plugin wrap chain
//   (@umijs/renderer-react/dist/browser.js:77 priority array
//   `['innerProvider', 'i18nProvider', 'accessProvider', 'dataflowProvider',
//    'outerProvider', 'rootContainer']`, commented "Lowest to the highest
//   priority", iter index 0 → end = innermost → outermost).
//
//   User src/app.tsx rootContainer is therefore the OUTERMOST layer. A
//   <NotifierRegistry/> placed there runs ABOVE the <App/> ancestor →
//   App.useApp() returns the default empty context
//   ({message:{}, modal:{}, notification:{}}) → module-level notifier.*
//   callers silently fall back to the Proxy (logs error, never invokes a
//   real antd hook).
//
//   Umi 4 conventional src/layouts/index.tsx is applied as a parent route
//   to ALL routes via addParentRoute({ addToAll: true }) — verified in
//   @umijs/preset-umi/dist/features/tmpFiles/routes.js:97-129. The layout
//   component renders inside the route tree, which is inside <App/>. So
//   App.useApp() called from <NotifierRegistry/> here returns the real
//   HookAPI.
//
// Nesting at runtime (outermost → innermost):
//   user rootContainer (ErrorBoundary > ThemedRoot > QueryClientProvider)
//     → outerProvider / dataflowProvider / accessProvider / i18nProvider
//       → plugin-antd <App/>
//         → src/layouts/index.tsx (this file: <NotifierRegistry/> + <Outlet/>)
//           → routes (src/pages/...)

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

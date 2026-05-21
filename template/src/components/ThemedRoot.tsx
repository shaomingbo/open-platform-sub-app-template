// Single ConfigProvider wrapper for the sub-app.
//
// `opTheme` is the light-mode default (see @/styles/theme). Dark-mode and
// theme-store switching are deferred — wire them in when your sub-app needs
// it (see master for the `applyTheme` + `useThemeStore` pattern).
//
// `prefixCls='{{PREFIX_CLS}}'` namespaces every antd DOM class to your
// sub-app (e.g. `<prefix>-button`, `<prefix>-modal-root`). This isolates
// styling from the master shell and from sibling sub-apps in qiankun mode.
// `prefixCls` propagates to portal-render components (Modal, Drawer,
// Popover) too — verified during the device sub-app's Task 4 + Task 13
// spikes.
//
// `cssVar.prefix='{{CSS_VAR_PREFIX}}'` is set in @/styles/theme (the
// ThemeConfig). The default ('op') matches master so design tokens stay
// consistent across sub-apps; change only if you want a separate cssVar
// namespace.

import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import { opTheme } from '@/styles/theme';

export function ThemedRoot({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={opTheme} prefixCls="{{PREFIX_CLS}}">
      {children}
    </ConfigProvider>
  );
}

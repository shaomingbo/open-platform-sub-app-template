// Antd v6 ThemeConfig for the sub-app.
//
// Two theme exports — opTheme (light) and opDarkTheme (dark). Sub-apps that
// don't need dark mode can use only opTheme; ThemedRoot.tsx currently wires
// opTheme statically. To enable theme switching, follow master's pattern:
// useThemeStore + matchMedia + applyTheme.ts.

import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';
import {
  antdDarkComponents,
  antdDarkToken,
  antdLightComponents,
  antdLightToken,
  antdSharedToken,
} from './tokens';

// cssVar.prefix='{{CSS_VAR_PREFIX}}' makes antd emit
// `--{{CSS_VAR_PREFIX}}-<token-key>` CSS variables. The sub-app's custom
// design tokens in global.css use un-prefixed names (--color-bg,
// --spacing-12, etc.) so they don't collide with antd's generated vars.
// Default '{{CSS_VAR_PREFIX}}' = 'op' matches master so design tokens stay
// consistent across sub-apps; change only if you want a separate namespace.

export const opTheme: ThemeConfig = {
  cssVar: { prefix: '{{CSS_VAR_PREFIX}}' },
  hashed: false,
  algorithm: antdTheme.defaultAlgorithm,
  token: { ...antdSharedToken, ...antdLightToken },
  components: antdLightComponents,
};

export const opDarkTheme: ThemeConfig = {
  cssVar: { prefix: '{{CSS_VAR_PREFIX}}' },
  hashed: false,
  algorithm: antdTheme.darkAlgorithm,
  token: { ...antdSharedToken, ...antdDarkToken },
  components: antdDarkComponents,
};

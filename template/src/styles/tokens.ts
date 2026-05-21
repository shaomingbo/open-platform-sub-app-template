// Antd v6 ThemeConfig tokens, derived from ./tokens.json.
//
// Source of truth: platform-design/design-tokens/tokens.json. Re-derive
// here when platform-design upstream changes — DO NOT edit token values in
// this file directly. Edit tokens.json instead, then re-derive.
//
// Field name conventions follow platform-design strictly. CSS variables
// consumed via `var(--<key>)` are defined in global.css.

import type { ThemeConfig } from 'antd';
import tokens from './tokens.json';

const s = tokens.shared;
const c = tokens.light.color;
const cd = tokens.dark.color;

const px = (v: string): number => Number.parseInt(v, 10);

// Shared antd tokens (font / radius / control sizing / line / motion / z-index).
export const antdSharedToken: ThemeConfig['token'] = {
  fontFamily: s.font.sans.$value,
  fontFamilyCode: s.font.mono.$value,
  fontSize: px(s.size['font-base'].$value),

  borderRadius: px(s.radius.control.$value),
  borderRadiusLG: px(s.radius.card.$value),
  borderRadiusSM: px(s.radius.tag.$value),
  borderRadiusXS: px(s.radius.xs.$value),

  controlHeight: px(s.size.control.$value),
  controlHeightSM: px(s.size['control-sm'].$value),
  controlHeightLG: px(s.size['control-lg'].$value),
  controlHeightXS: px(s.size['control-xs'].$value),
  sizeStep: px(s.size.step.$value),
  sizeUnit: px(s.size.unit.$value),

  lineWidth: px(s.line.default.$value),
  lineWidthBold: px(s.line.bold.$value),
  lineWidthFocus: px(s.line.focus.$value),

  motionDurationFast: s.motion.fast.$value,
  motionDurationMid: s.motion.mid.$value,
  motionDurationSlow: s.motion.slow.$value,

  zIndexPopupBase: Number.parseInt(s['z-index']['popup-base'].$value, 10),
};

// Light-mode color tokens.
export const antdLightToken: ThemeConfig['token'] = {
  colorPrimary: c['cta-primary'].$value,
  colorTextBase: c['text-heading'].$value,
  colorBgBase: c.bg.$value,
  colorSuccess: c.success.$value,
  colorWarning: c.warning.$value,
  colorError: c.error.$value,
  colorInfo: c.info.$value,
  colorLink: c.link.$value,
};

// Per-component customization (light mode).
// Mirrors platform-design/src/styles/theme/tokens.light.ts.
// Some values reference CSS variables defined in global.css (e.g. --spacing-12).
export const antdLightComponents: ThemeConfig['components'] = {
  Button: {
    defaultShadow: 'none',
    primaryShadow: 'none',
    dangerShadow: 'none',
    fontWeight: 500,
    paddingInline: 'var(--spacing-12)',
    paddingInlineSM: 8,
    paddingInlineLG: 16,
    contentFontSize: 13,
    contentFontSizeSM: 12.5,
    contentFontSizeLG: 14,
    colorPrimary: c['cta-primary'].$value,
    colorPrimaryHover: c['cta-primary-hover'].$value,
    colorPrimaryActive: c['cta-primary-active'].$value,
    solidTextColor: c['cta-text'].$value,
    defaultBg: c.bg.$value,
    defaultBorderColor: c.border.$value,
    defaultColor: c['text-heading'].$value,
    defaultHoverBg: c['bg-layout'].$value,
    defaultHoverBorderColor: c['default-border-hover'].$value,
    defaultHoverColor: c['text-heading'].$value,
    defaultActiveBg: c['bg-subtle'].$value,
    defaultActiveBorderColor: c['default-border-active'].$value,
  },
  Input: {
    activeShadow: 'none',
    errorActiveShadow: 'none',
    warningActiveShadow: 'none',
  },
  Card: {
    headerBg: 'transparent',
    headerHeight: 48,
    headerHeightSM: 40,
    bodyPadding: 20,
    headerPadding: 20,
  },
  Table: {
    cellPaddingBlock: 12,
    cellPaddingInline: 16,
    cellPaddingBlockMD: 10,
    cellPaddingInlineMD: 14,
    cellPaddingBlockSM: 8,
    cellPaddingInlineSM: 12,
    headerBg: c['bg-layout'].$value,
    headerColor: c['text-meta'].$value,
    headerSortActiveBg: c['bg-subtle'].$value,
    headerSortHoverBg: c['bg-subtle'].$value,
    rowHoverBg: c['row-hover'].$value,
    borderColor: c.border.$value,
    headerSplitColor: c.border.$value,
    cellFontSize: 13,
    cellFontSizeMD: 13,
    cellFontSizeSM: 12,
  },
  Layout: {
    bodyBg: c['bg-layout'].$value,
    headerBg: c.bg.$value,
    siderBg: c.bg.$value,
    headerHeight: 56,
    headerPadding: '0 24px',
  },
  Menu: {
    itemBg: 'transparent',
    itemHoverBg: c['menu-hover'].$value,
    itemSelectedBg: c['menu-hover'].$value,
    itemSelectedColor: c['text-heading'].$value,
    itemHeight: 32,
    itemMarginInline: 0,
  },
  Tabs: {
    itemColor: c['text-meta'].$value,
    itemSelectedColor: c['text-heading'].$value,
    itemHoverColor: c['text-heading'].$value,
    inkBarColor: c['text-heading'].$value,
    titleFontSize: 13,
  },
  Tag: {
    defaultBg: c['bg-layout'].$value,
    defaultColor: c['text-body'].$value,
  },
  Modal: {
    titleFontSize: 16,
    titleColor: c['text-heading'].$value,
  },
  Drawer: {
    colorBgElevated: c['bg-elevated'].$value,
  },
  Tooltip: {
    colorBgSpotlight: c['tooltip-spotlight'].$value,
    colorTextLightSolid: c['tooltip-text'].$value,
  },
};

// Dark-mode color tokens. Mirrors antdLightToken plus `colorTextLightSolid`
// (dark cta inverts text color, so we expose this antd v6 token explicitly).
export const antdDarkToken: ThemeConfig['token'] = {
  colorPrimary: cd['cta-primary'].$value,
  colorTextBase: cd['text-heading'].$value,
  colorBgBase: cd.bg.$value,
  colorTextLightSolid: cd['cta-text'].$value,
  colorSuccess: cd.success.$value,
  colorWarning: cd.warning.$value,
  colorError: cd.error.$value,
  colorInfo: cd.info.$value,
  colorLink: cd.link.$value,
};

// Per-component customization (dark mode). Field set mirrors antdLightComponents
// with three additions specific to dark mode where the default antd
// defaultAlgorithm-derived values don't pop:
//   - Input gets explicit colorBgContainer / colorBorder (light algorithm
//     auto-derives sensible defaults; dark needs nudging to bg-elevated)
//   - Table headerBg / headerSortActiveBg / headerSortHoverBg uses the
//     `table-header-bg` / `table-sort-bg` tokens (only present in dark)
//   - Segmented enters here at all (light defaults are fine)
export const antdDarkComponents: ThemeConfig['components'] = {
  Button: {
    defaultShadow: 'none',
    primaryShadow: 'none',
    dangerShadow: 'none',
    fontWeight: 500,
    paddingInline: 'var(--spacing-12)',
    paddingInlineSM: 8,
    paddingInlineLG: 16,
    contentFontSize: 13,
    contentFontSizeSM: 12.5,
    contentFontSizeLG: 14,
    colorPrimary: cd['cta-primary'].$value,
    colorPrimaryHover: cd['cta-primary-hover'].$value,
    colorPrimaryActive: cd['cta-primary-active'].$value,
    solidTextColor: cd['cta-text'].$value,
    defaultBg: cd['bg-elevated'].$value,
    defaultBorderColor: cd.border.$value,
    defaultColor: cd['text-heading'].$value,
    defaultHoverBg: cd['bg-subtle'].$value,
    defaultHoverBorderColor: cd['default-border-hover'].$value,
    defaultHoverColor: cd['text-heading'].$value,
    defaultActiveBg: cd['border-soft'].$value,
    defaultActiveBorderColor: cd['default-border-active'].$value,
  },
  Input: {
    activeShadow: 'none',
    errorActiveShadow: 'none',
    warningActiveShadow: 'none',
    colorBgContainer: cd['bg-elevated'].$value,
    colorBorder: cd.border.$value,
  },
  Card: {
    headerBg: 'transparent',
    headerHeight: 48,
    headerHeightSM: 40,
    bodyPadding: 20,
    headerPadding: 20,
  },
  Table: {
    cellPaddingBlock: 12,
    cellPaddingInline: 16,
    cellPaddingBlockMD: 10,
    cellPaddingInlineMD: 14,
    cellPaddingBlockSM: 8,
    cellPaddingInlineSM: 12,
    headerBg: cd['table-header-bg'].$value,
    headerColor: cd['text-meta'].$value,
    headerSortActiveBg: cd['table-sort-bg'].$value,
    headerSortHoverBg: cd['table-sort-bg'].$value,
    rowHoverBg: cd['row-hover'].$value,
    borderColor: cd.border.$value,
    headerSplitColor: cd.border.$value,
    cellFontSize: 13,
    cellFontSizeMD: 13,
    cellFontSizeSM: 12,
  },
  Layout: {
    bodyBg: cd['bg-layout'].$value,
    headerBg: cd.bg.$value,
    siderBg: cd.bg.$value,
    headerHeight: 56,
    headerPadding: '0 24px',
  },
  Menu: {
    itemBg: 'transparent',
    itemHoverBg: cd['menu-hover'].$value,
    itemSelectedBg: cd['menu-hover'].$value,
    itemSelectedColor: cd['text-heading'].$value,
    itemHeight: 32,
    itemMarginInline: 0,
  },
  Tabs: {
    itemColor: cd['text-meta'].$value,
    itemSelectedColor: cd['text-heading'].$value,
    itemHoverColor: cd['text-heading'].$value,
    inkBarColor: cd['text-heading'].$value,
    titleFontSize: 13,
  },
  Tag: {
    defaultBg: cd['bg-subtle'].$value,
    defaultColor: cd['text-meta'].$value,
  },
  Modal: {
    titleFontSize: 16,
    titleColor: cd['text-heading'].$value,
    contentBg: cd['bg-elevated'].$value,
    headerBg: cd['bg-elevated'].$value,
  },
  Drawer: {
    colorBgElevated: cd['bg-elevated'].$value,
  },
  Tooltip: {
    colorBgSpotlight: cd['tooltip-spotlight'].$value,
    colorTextLightSolid: cd['tooltip-text'].$value,
  },
  Segmented: {
    itemSelectedBg: cd['segmented-selected'].$value,
    itemSelectedColor: cd['text-heading'].$value,
    itemHoverBg: cd['table-sort-bg'].$value,
    trackBg: cd['segmented-track'].$value,
  },
};

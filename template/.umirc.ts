import { defineConfig } from '@umijs/max';

export default defineConfig({
  npmClient: 'pnpm',

  // max.antd plugin — `appConfig: {}` at compile-time activates the <App/>
  // wrap injection (Umi 4.6.9 + antd v6 does NOT auto-enable). Required for
  // App.useApp() in NotifierRegistry (see src/layouts/index.tsx).
  antd: { appConfig: {} },

  // qiankun slave — plugin-qiankun-slave is built into @umijs/max. Empty
  // options activate it: the plugin auto-derives react-router basename from
  // props.basename (master injects it) in qiankun mode, and exposes
  // src/app.tsx's `export const qiankun = { bootstrap, mount, unmount }`
  // lifecycle. Standalone dev (`pnpm dev` directly) bypasses the plugin;
  // basename then derives from package.json#name (e.g. `/my-sub-app`),
  // NOT `/` — Umi auto-prefixes to prevent root-collision in dev.
  qiankun: { slave: {} },

  // Umi access plugin reads src/access.ts at runtime. Three-piece set —
  // omit any and boot fails:
  //   - access:       src/access.ts entry
  //   - model:        access plugin runtime uses useModel('@@initialState')
  //   - initialState: provides the @@initialState model namespace populated
  //                   by `export async function getInitialState` in app.tsx
  access: {},
  model: {},
  initialState: {},

  // Umi locale plugin — 4 fields:
  //   - default:        the boot-time locale
  //   - antd true:      keeps antd ConfigProvider locale in sync
  //   - baseSeparator:  'zh-CN' / 'en-US' style (not 'zh_CN')
  //   - title false:    don't auto-mutate document.title
  locale: {
    default: 'zh-CN',
    antd: true,
    baseSeparator: '-',
    title: false,
  },

  // Required by Umi for prod build with multi-chunk routes. Without this,
  // esbuild minifier emits "Found conflicts in esbuild helpers" once the
  // route count + access/model/initialState/locale pull the chunk count
  // above its threshold.
  esbuildMinifyIIFE: true,

  // rrweb dual-package CJS/ESM fix for @arms/rum-browser (transitive
  // dependency). rrweb's package.json has `"type": "module"` but
  // `lib/record/rrweb-record.js` uses CJS `module.exports`. Webpack defers
  // to `type: module` and parses as ESM → `module` undefined → boot crash.
  // Forcing `javascript/auto` lets webpack detect format from content.
  chainWebpack(memo) {
    memo.module
      .rule('rrweb-record-cjs-fix')
      .test(/rrweb-record\.js$/)
      .set('type', 'javascript/auto');
  },
});

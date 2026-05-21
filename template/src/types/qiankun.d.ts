// Ambient declaration — qiankun runtime global flag.
//
// `__POWERED_BY_QIANKUN__` is injected onto the sub-app's window by qiankun
// when it mounts. In standalone dev (`pnpm dev` directly), it's undefined.
// The Standalone fallback layout, Phase-1 mock auth, and basename branching
// all rely on this flag.
//
// No import/export → TS treats this as ambient and auto-merges with
// lib.dom.d.ts's Window interface (no `declare global { ... }` wrap +
// `export {}` needed).

interface Window {
  __POWERED_BY_QIANKUN__?: boolean;
}

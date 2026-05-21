// Standalone fallback layout.
//
// Used only when `!window.__POWERED_BY_QIANKUN__` (see app.tsx
// rootContainer's conditional). In qiankun mount mode, master's AppShell
// provides the outer chrome (Header + Sider) so the sub-app renders bare;
// in standalone dev mode this layout adds visible padding so routes don't
// hug the viewport edge.
//
// Extend as needed — e.g. a dev-only debug header showing the current mock
// token or auth state.

import type { ReactNode } from 'react';
import { Layout } from 'antd';

export default function StandaloneLayout({ children }: { children: ReactNode }) {
  return (
    <Layout style={{ padding: 24, minHeight: '100vh', background: 'transparent' }}>
      {children}
    </Layout>
  );
}

// Generic React error boundary.
//
// Two layers planned (architectural spec, optional — depends on your
// sub-app's needs):
//   - Root level: wraps the whole app; fallback is a full-screen error.
//   - Route level: wraps <Outlet/> inside a layout; fallback is inline.
//
// This component is layer-agnostic — the mount position + the `fallback`
// prop decide the behavior.
//
// Implementation note: React 19 still requires a class component for error
// boundaries (`getDerivedStateFromError` + `componentDidCatch`). Stable
// React has no hooks-API replacement.

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportError } from '@/utils/report';

interface Props {
  fallback?: ReactNode | ((error: Error) => ReactNode);
  /** Optional tag forwarded to reportError for telemetry context. */
  scope?: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, {
      scope: this.props.scope ?? 'unknown',
      componentStack: info.componentStack ?? undefined,
    });
  }

  render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;

    const { fallback } = this.props;
    if (typeof fallback === 'function') return fallback(error);
    if (fallback !== undefined) return fallback;

    // Minimal default fallback — pass a custom one (e.g. antd Result) per
    // mount site for production-quality UI.
    return (
      <div
        role="alert"
        style={{
          padding: 24,
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-text-heading)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'var(--font-size-title)' }}>Something went wrong.</h2>
        <p style={{ marginTop: 12, color: 'var(--color-text-meta)' }}>{error.message}</p>
      </div>
    );
  }
}

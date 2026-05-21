// Umi access plugin runtime entry.
//
// Consumed by useAccess() / <Access /> / route-level access markers. The
// stub here only checks for `jwt` presence in initialState — extend the
// shape as your sub-app's permission model grows (admin / developer /
// feature flags / etc.).
//
// The wire:
//   accessor → app.tsx getInitialState() → InitialState.jwt → this access()
//   → useAccess() in components.

type InitialState = {
  jwt?: string;
};

export type AccessShape = {
  canSee: boolean;
};

export default function access(initialState?: InitialState): AccessShape {
  const isAuthenticated = Boolean(initialState?.jwt);
  return {
    canSee: isAuthenticated,
  };
}

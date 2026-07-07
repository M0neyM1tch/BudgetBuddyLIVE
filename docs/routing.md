# Routing Convention

BudgetBuddy V2 keeps route configuration in `src/app/router.tsx` and lazy route wrappers in `src/app/routeElements.tsx`.

Feature page files may use named exports. `routeElements.tsx` adapts those named exports into the default component shape expected by `React.lazy()`.

Example:

```tsx
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);
```

If a future branch switches to direct `lazy(() => import(...))`, the corresponding page files must provide default exports first. Do not mix both conventions in the same routing layer.

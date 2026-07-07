# BudgetBuddy V2 Phase 3 Onboarding Amendments

Date: 2026-06-22
Branch: `phase-3/tooltips-onboarding`
Base commit before amendments: `07606da`

## Summary

This update applies the requested amendments to the Phase 3 Tooltips & Onboarding branch before review and squash-merge.

## Changes

- Centered the onboarding wizard by adding a scoped `className` hook to the shared `Modal` component and applying `onboarding-wizard-modal` styling.
- Changed the onboarding wizard Goals step to route to `/dashboard/goals?new=1`.
- Added Goals deep-link handling so `/dashboard/goals?new=1` opens the create-goal modal on first render and then cleans the URL.
- Added reusable calculator field info buttons through `FieldTooltip`.
- Added inline info tooltips to:
  - Safe withdrawal rate
  - Expected annual return
  - Needs target
  - Wants target
  - Savings target
- Updated `CalculatorField` and `ScenarioSlider` to support inline hint content.
- Made Compound Growth the default calculator tab.
- Replaced the Compound Growth year table with a responsive SVG Wealth Projection chart.
- Added guardrails in the chart so 1-year and all-zero projection states do not produce invalid SVG coordinates.

## Noteworthy Implementation Notes

- The original amendment brief suggested using `setState` inside a `useEffect` for Goals deep-linking. I intentionally avoided that pattern because the React Compiler lint already flagged it in the Transactions flow. Goals now initializes modal state from the URL on first render and uses the effect only to clean the browser URL.
- The app's `Modal` is a native `<dialog>`, so the centering class is applied directly to the dialog instead of targeting a nonexistent modal backdrop wrapper.
- The chart axis and highlight labels use compact `$K` / `$M` formatting so they do not crowd the SVG at smaller widths.
- No Supabase schema or policy changes were required for these amendments.

## Validation

- `npm.cmd run typecheck` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- Browser smoke testing with temporary process-only Vite env values passed:
  - desktop landing render loads with no horizontal overflow
  - mobile landing render at 375px loads with no horizontal overflow
  - unauthenticated `/dashboard/goals?new=1` redirects to `/login`
  - browser console showed no warnings or errors during smoke

## Testing Limitation

Full protected-app interaction testing for the onboarding wizard, calculator tooltips, Goals modal auto-open, and Compound Growth chart requires a real logged-in local Supabase session. I did not fake auth for this because it would not prove the actual Supabase-backed user flow.

## Recommendation

Before squash-merge, manually test this branch while signed in locally:

- Restart onboarding from Preferences and confirm the wizard is centered on desktop and mobile.
- Click through to the Goals step and confirm `Go to Goals` opens the create-goal modal.
- Open Calculator and confirm Compound Growth is the default tab.
- Click each of the five field info buttons and confirm the popovers fit on mobile.
- Test Compound Growth at 1, 10, 20, and 40 years.

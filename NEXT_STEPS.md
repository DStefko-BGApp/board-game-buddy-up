[ ] Establish consistent lint and formatting (ESLint + Prettier) and enforce via CI pipelines.
[ ] Integrate SQLFluff checks into CI (if SQL used) or remove if irrelevant.
[ ] Setup environment config files (.env for dev, prod) and a mechanism in builds to inject them.
[ ] Add performance tools: lazy-loading, image optimization, bundle analysis in Vite.
[ ] Configure error tracking (e.g. Sentry) and implement React Error Boundaries.
[ ] Add dependency vulnerability scanning (npm audit, Dependabot alerts).
[ ] Introduce testing frameworks: Jest for unit, React Testing Library, and E2E tests (Cypress/Playwright).
[ ] Define security headers (CSP) and ensure secure HTTP headers.
[ ] Audit web-only dependencies (Tailwind, shadcn-ui) and identify RN-compatible alternatives (NativeWind, etc.).
[ ] Refactor UI components to be platform-agnostic or create separate RN components.
[ ] Replace React Router with React Navigation for mobile routing.
[ ] Restructure asset handling for Expo (fonts, images) using `expo-asset`.
[ ] Setup Expo project skeleton alongside web, sharing logic where possible.
[ ] Ensure app logic (state management) is abstracted away from platform UI to maximize code reuse.

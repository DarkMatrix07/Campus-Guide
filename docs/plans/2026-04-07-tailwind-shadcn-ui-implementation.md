# Tailwind + shadcn UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the client UI to use Tailwind + shadcn consistently, remove inline page styling, and deliver a cohesive clean premium light experience across auth pages and dashboards.

**Architecture:** Keep the current route and auth structure intact while moving visual decisions into shared Tailwind classes, theme tokens, and existing shadcn/ui primitives. Use a small set of reusable layout patterns across auth and dashboard pages so the app reads as one product instead of isolated screens.

**Tech Stack:** React 19, Vite, Tailwind CSS v4, shadcn/ui primitives, framer-motion, Playwright/Vitest-compatible test tooling as needed

---

### Task 1: Add UI regression test scaffolding

**Files:**
- Modify: `client/package.json`
- Create: `client/vitest.config.js`
- Create: `client/src/test/setup.js`
- Create: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Add tests that render the login, signup, student, owner, and admin experiences and assert:

- each screen shows its primary heading or role label
- the rendered container has no inline `style` attributes

**Step 2: Run test to verify it fails**

Run: `npm run test -- ui-shell`

Expected: FAIL because the test runner is not configured yet and/or current screens still include inline styles.

**Step 3: Write minimal implementation**

Add the smallest viable test setup:

- `vitest` config with jsdom
- testing setup file
- package script for test execution

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm run test -- ui-shell`

Expected: FAIL because current page implementations still use inline styles or old copy/layout expectations.

**Step 5: Commit**

```bash
git add client/package.json client/vitest.config.js client/src/test/setup.js client/src/test/ui-shell.test.jsx
git commit -m "test: add UI regression scaffolding"
```

### Task 2: Refresh global tokens and reusable decorative utilities

**Files:**
- Modify: `client/src/index.css`
- Modify: `client/src/App.css` or remove its import relevance if unnecessary

**Step 1: Write the failing test**

Extend the UI shell test with expectations that auth and dashboard pages expose the updated container classes or semantic text that depends on the new shared styling structure.

**Step 2: Run test to verify it fails**

Run: `npm run test -- ui-shell`

Expected: FAIL because the shared styling hooks are not present yet.

**Step 3: Write minimal implementation**

Update `index.css` to define:

- improved premium-light tokens
- reusable background/grid/glow utility classes
- refined body defaults

Remove leftover unused app-level CSS noise if it no longer contributes anything.

**Step 4: Run test to verify it passes**

Run: `npm run test -- ui-shell`

Expected: PASS for token/style-hook assertions, with later screen-specific failures still remaining.

**Step 5: Commit**

```bash
git add client/src/index.css client/src/App.css
git commit -m "style: refresh shared UI tokens"
```

### Task 3: Rebuild auth screens on Tailwind + shadcn only

**Files:**
- Modify: `client/src/pages/Login.jsx`
- Modify: `client/src/pages/Signup.jsx`
- Reuse: `client/src/components/ui/button.jsx`
- Reuse: `client/src/components/ui/input.jsx`
- Reuse: `client/src/components/ui/label.jsx`
- Reuse: `client/src/components/ui/card.jsx`
- Reuse: `client/src/components/ui/badge.jsx`
- Test: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Add/adjust tests asserting:

- login and signup render their editorial hero copy
- signup role options render as buttons/cards
- neither auth page outputs inline `style` attributes

**Step 2: Run test to verify it fails**

Run: `npm run test -- ui-shell`

Expected: FAIL against current auth markup.

**Step 3: Write minimal implementation**

Refactor auth pages to:

- remove all inline styles
- share the new premium-light layout
- keep existing form behavior and navigation intact
- use Tailwind + shadcn primitives consistently

**Step 4: Run test to verify it passes**

Run: `npm run test -- ui-shell`

Expected: PASS for auth scenarios.

**Step 5: Commit**

```bash
git add client/src/pages/Login.jsx client/src/pages/Signup.jsx client/src/test/ui-shell.test.jsx
git commit -m "feat: redesign auth pages with tailwind and shadcn"
```

### Task 4: Rebuild role dashboards into one visual system

**Files:**
- Modify: `client/src/pages/dashboards/StudentDashboard.jsx`
- Modify: `client/src/pages/dashboards/OwnerDashboard.jsx`
- Modify: `client/src/pages/dashboards/AdminDashboard.jsx`
- Test: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Add/adjust tests asserting:

- each dashboard renders the correct role-specific heading
- each dashboard uses the shared shell copy/sections
- no dashboard output includes inline `style` attributes

**Step 2: Run test to verify it fails**

Run: `npm run test -- ui-shell`

Expected: FAIL because student and shared shell styling still differ or contain inline styles.

**Step 3: Write minimal implementation**

Refactor the dashboards to:

- use one premium-light navigation/header/card language
- preserve role-specific content
- remove inline styles entirely

**Step 4: Run test to verify it passes**

Run: `npm run test -- ui-shell`

Expected: PASS for all dashboard scenarios.

**Step 5: Commit**

```bash
git add client/src/pages/dashboards/StudentDashboard.jsx client/src/pages/dashboards/OwnerDashboard.jsx client/src/pages/dashboards/AdminDashboard.jsx client/src/test/ui-shell.test.jsx
git commit -m "feat: unify dashboard visual system"
```

### Task 5: Final verification

**Files:**
- Verify only

**Step 1: Run targeted tests**

Run: `npm run test -- ui-shell`

Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`

Expected: PASS with 0 errors

**Step 3: Run production build**

Run: `npm run build`

Expected: PASS and emit Vite production assets

**Step 4: Review diff**

Run: `git diff --stat`

Expected: changes limited to the intended client UI files, docs, and test setup

**Step 5: Commit**

```bash
git add docs/plans client
git commit -m "feat: refresh client ui with tailwind and shadcn"
```

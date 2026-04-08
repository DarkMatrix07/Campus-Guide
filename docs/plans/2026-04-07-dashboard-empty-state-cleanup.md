# Dashboard Empty-State Cleanup Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove fake and overloaded dashboard content from the student, owner, and admin views while keeping the polished shared shell intact.

**Architecture:** Keep `DashboardShell` as the visual frame and simplify each role page into one restrained empty-state card with only role-specific heading and neutral copy. Lock the new baseline with the existing Vitest UI shell coverage before editing production code.

**Tech Stack:** React 19, Vite, Tailwind CSS v4, shadcn/ui primitives, Vitest, Testing Library

---

### Task 1: Tighten dashboard regression coverage

**Files:**
- Modify: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Update the three dashboard tests so they assert:

- the existing top-level dashboard headings still render
- the new neutral empty-state copy appears
- fake labels such as `Open map`, `Register business`, `Review queue`, `Top-rated right now`, `Priority queue`, and `What happens after submission` do not render
- no inline `style` attributes are present

**Step 2: Run test to verify it fails**

Run: `npm run test -- ui-shell`

Expected: FAIL because the current dashboards still render hardcoded action buttons and fake sections.

**Step 3: Write minimal implementation**

Do not change production code in this task.

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm run test -- ui-shell`

Expected: FAIL on the new dashboard assertions only.

**Step 5: Commit**

```bash
git add client/src/test/ui-shell.test.jsx
git commit -m "test: cover dashboard empty states"
```

### Task 2: Simplify the student dashboard

**Files:**
- Modify: `client/src/pages/dashboards/StudentDashboard.jsx`
- Test: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Use the failing assertions from Task 1.

**Step 2: Run test to verify it fails**

Run: `npm run test -- ui-shell`

Expected: FAIL because the student dashboard still shows fake discovery content and the `Open map` action.

**Step 3: Write minimal implementation**

Replace the hardcoded student collections, search, spotlight, and metric cards with one clean empty-state card inside `DashboardShell`. Remove the `headerAction` prop entirely.

**Step 4: Run test to verify it passes**

Run: `npm run test -- ui-shell`

Expected: student assertions PASS while owner/admin assertions may still fail.

**Step 5: Commit**

```bash
git add client/src/pages/dashboards/StudentDashboard.jsx client/src/test/ui-shell.test.jsx
git commit -m "refactor: simplify student dashboard shell"
```

### Task 3: Simplify the owner dashboard

**Files:**
- Modify: `client/src/pages/dashboards/OwnerDashboard.jsx`
- Test: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Use the failing assertions from Task 1.

**Step 2: Run test to verify it fails**

Run: `npm run test -- ui-shell`

Expected: FAIL because the owner dashboard still shows launch steps, stats, and the `Register business` action.

**Step 3: Write minimal implementation**

Replace the hardcoded owner launch workflow, stats, and support blocks with one clean empty-state card inside `DashboardShell`. Remove the `headerAction` prop entirely.

**Step 4: Run test to verify it passes**

Run: `npm run test -- ui-shell`

Expected: student and owner assertions PASS while admin assertions may still fail.

**Step 5: Commit**

```bash
git add client/src/pages/dashboards/OwnerDashboard.jsx client/src/test/ui-shell.test.jsx
git commit -m "refactor: simplify owner dashboard shell"
```

### Task 4: Simplify the admin dashboard

**Files:**
- Modify: `client/src/pages/dashboards/AdminDashboard.jsx`
- Test: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Use the failing assertions from Task 1.

**Step 2: Run test to verify it fails**

Run: `npm run test -- ui-shell`

Expected: FAIL because the admin dashboard still shows fake stats, queue cards, and the `Review queue` action.

**Step 3: Write minimal implementation**

Replace the hardcoded admin overview cards and platform health section with one clean empty-state card inside `DashboardShell`. Remove the `headerAction` prop entirely.

**Step 4: Run test to verify it passes**

Run: `npm run test -- ui-shell`

Expected: PASS for all dashboard assertions.

**Step 5: Commit**

```bash
git add client/src/pages/dashboards/AdminDashboard.jsx client/src/test/ui-shell.test.jsx
git commit -m "refactor: simplify admin dashboard shell"
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

Expected: changes limited to the three dashboard pages, the UI shell test, and this plan doc

**Step 5: Commit**

```bash
git add docs/plans client
git commit -m "refactor: clear dashboard placeholder content"
```

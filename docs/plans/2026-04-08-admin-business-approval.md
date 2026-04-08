# Admin Business Approval Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let admins review pending business submissions, approve or reject them from the admin dashboard, make approved businesses publicly queryable, and show updated approval status back to the owner dashboard.

**Architecture:** Extend the existing `Business` route layer with admin-only read/update endpoints plus a public approved-business endpoint. Keep the owner dashboard bound to `/api/businesses/mine` so status updates flow through automatically, and replace the empty admin dashboard with a real pending-review surface driven by the new admin endpoints.

**Tech Stack:** Express 5, Mongoose, express-session, Multer, React 19, Vite, Vitest, Testing Library, Supertest

---

### Task 1: Add failing server tests for admin approval behavior

**Files:**
- Modify: `server/test/business.routes.test.mjs`

**Step 1: Write the failing test**

Extend the route tests to prove:

- admins can fetch all pending businesses
- admins can set a business status to `approved` or `rejected`
- invalid statuses are rejected
- only approved businesses appear in the public business list

**Step 2: Run test to verify it fails**

Run: `npm test -- business.routes`

Expected: FAIL because the admin and public business endpoints do not exist yet.

**Step 3: Write minimal implementation**

Do not change production code in this task.

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm test -- business.routes`

Expected: FAIL on missing admin/public business behavior, not on test harness setup.

**Step 5: Commit**

```bash
git add server/test/business.routes.test.mjs
git commit -m "test: cover admin business approval routes"
```

### Task 2: Implement admin/public business endpoints

**Files:**
- Modify: `server/routes/businesses.js`
- Modify: `server/middleware/auth.js` only if role guards need adjustment
- Modify: `server/models/Business.js` only if serialization helpers need fields

**Step 1: Write the failing test**

Use the failing route tests from Task 1.

**Step 2: Run test to verify it fails**

Run: `npm test -- business.routes`

Expected: FAIL because the new endpoints still do not exist.

**Step 3: Write minimal implementation**

Add:

- `GET /api/businesses/pending` for admins
- `PATCH /api/businesses/:id/status` for admin approval/rejection
- `GET /api/businesses/public` for approved business visibility
- shared serialization so admins see owner details and public clients only see approved data

**Step 4: Run test to verify it passes**

Run: `npm test -- business.routes`

Expected: PASS

**Step 5: Commit**

```bash
git add server/routes/businesses.js server/models/Business.js server/middleware/auth.js
git commit -m "feat: add admin business approval api"
```

### Task 3: Add failing client tests for admin approval and owner status updates

**Files:**
- Create: `client/src/test/admin-dashboard.test.jsx`
- Modify: `client/src/test/owner-dashboard.test.jsx`
- Modify: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Add tests that assert:

- admins see pending business cards pulled from the API
- admin approve/reject actions send status updates and refresh the list
- owners see updated approved/rejected status copy on their dashboard

**Step 2: Run test to verify it fails**

Run: `npm run test -- admin-dashboard owner-dashboard ui-shell`

Expected: FAIL because the admin dashboard is still a placeholder and the owner status card is still hardcoded for pending.

**Step 3: Write minimal implementation**

Do not change production code in this task.

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm run test -- admin-dashboard owner-dashboard ui-shell`

Expected: FAIL on missing admin approval UI and owner status copy.

**Step 5: Commit**

```bash
git add client/src/test/admin-dashboard.test.jsx client/src/test/owner-dashboard.test.jsx client/src/test/ui-shell.test.jsx
git commit -m "test: cover admin approval workflow"
```

### Task 4: Implement the admin approval dashboard and owner status updates

**Files:**
- Modify: `client/src/pages/dashboards/AdminDashboard.jsx`
- Modify: `client/src/pages/dashboards/OwnerDashboard.jsx`
- Modify: `client/src/test/admin-dashboard.test.jsx`
- Modify: `client/src/test/owner-dashboard.test.jsx`
- Modify: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Use the failing client tests from Task 3.

**Step 2: Run test to verify it fails**

Run: `npm run test -- admin-dashboard owner-dashboard ui-shell`

Expected: FAIL because the admin UI still lacks data loading and actions.

**Step 3: Write minimal implementation**

Implement:

- admin dashboard fetch of pending businesses
- approve/reject buttons wired to the status endpoint
- success refresh after each decision
- dynamic owner status card copy for pending, approved, and rejected

**Step 4: Run test to verify it passes**

Run: `npm run test -- admin-dashboard owner-dashboard ui-shell`

Expected: PASS

**Step 5: Commit**

```bash
git add client/src/pages/dashboards/AdminDashboard.jsx client/src/pages/dashboards/OwnerDashboard.jsx client/src/test/admin-dashboard.test.jsx client/src/test/owner-dashboard.test.jsx client/src/test/ui-shell.test.jsx
git commit -m "feat: add admin business approval dashboard"
```

### Task 5: Final verification

**Files:**
- Verify only

**Step 1: Run server tests**

Run: `npm test -- startup business.routes`

Expected: PASS

**Step 2: Run client tests**

Run: `npm run test -- admin-dashboard owner-dashboard ui-shell`

Expected: PASS

**Step 3: Run lint**

Run: `npm run lint`

Expected: PASS

**Step 4: Run production build**

Run: `npm run build`

Expected: PASS

**Step 5: Commit**

```bash
git add server client docs/plans
git commit -m "feat: add admin approval workflow"
```

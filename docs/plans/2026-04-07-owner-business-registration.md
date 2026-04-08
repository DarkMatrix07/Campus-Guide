# Owner Business Registration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let a newly created owner account register a business with an image upload, persist that business in `pending` status, and show the owner their submitted business summary, rating block, and public reviews area on subsequent dashboard visits.

**Architecture:** Add a dedicated `Business` model on the server with an owner relationship, upload metadata, status, and review storage prepared for owner-facing display. Gate the owner dashboard client-side by fetching the authenticated owner's business: render the setup form when none exists, otherwise render the submitted business summary with sanitized public review data and no reviewer identity.

**Tech Stack:** Express 5, Mongoose, express-session, Multer, React 19, Vite, Vitest, Testing Library, Supertest, mongodb-memory-server

---

### Task 1: Add failing server tests for the owner business API

**Files:**
- Create: `server/app.js`
- Create: `server/test/business.routes.test.js`
- Modify: `server/package.json`

**Step 1: Write the failing test**

Add integration tests that prove:

- `GET /api/businesses/mine` returns `404` for an owner without a business
- `POST /api/businesses` creates a business for the authenticated owner, stores it as `pending`, and returns sanitized review data
- `GET /api/businesses/mine` returns the created business for that owner
- duplicate business registration for the same owner is rejected

**Step 2: Run test to verify it fails**

Run: `npm test -- business.routes`

Expected: FAIL because there is no app export, no business route, and no business model yet.

**Step 3: Write minimal implementation**

Do not change production behavior in this task beyond the minimum app export scaffolding required for test loading.

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm test -- business.routes`

Expected: FAIL on missing route/model behavior, not broken test setup.

**Step 5: Commit**

```bash
git add server/app.js server/test/business.routes.test.js server/package.json
git commit -m "test: cover owner business routes"
```

### Task 2: Implement backend business persistence and upload handling

**Files:**
- Create: `server/models/Business.js`
- Create: `server/routes/businesses.js`
- Modify: `server/index.js`
- Modify: `server/app.js`
- Modify: `server/middleware/auth.js`
- Modify: `server/package.json`

**Step 1: Write the failing test**

Use the failing integration tests from Task 1.

**Step 2: Run test to verify it fails**

Run: `npm test -- business.routes`

Expected: FAIL because the business API still does not exist.

**Step 3: Write minimal implementation**

Implement:

- a `Business` schema with `owner`, `name`, `category`, `location`, `description`, `contact`, `imageUrl`, `imagePath`, `status`, and `reviews`
- owner-only `GET /api/businesses/mine`
- owner-only `POST /api/businesses` with Multer single-image upload
- response serialization that exposes rating totals and public review text/date but hides reviewer identity
- app wiring for `/api/businesses`

**Step 4: Run test to verify it passes**

Run: `npm test -- business.routes`

Expected: PASS

**Step 5: Commit**

```bash
git add server/models/Business.js server/routes/businesses.js server/index.js server/app.js server/middleware/auth.js server/package.json
git commit -m "feat: add owner business registration api"
```

### Task 3: Add failing client tests for the owner dashboard gate

**Files:**
- Create: `client/src/test/owner-dashboard.test.jsx`
- Modify: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Add tests that assert:

- owners without a business see the registration form fields
- owners with a submitted business see the business summary, `pending` status, rating summary, and public reviews without reviewer identity
- the dashboard output still contains no inline styles

**Step 2: Run test to verify it fails**

Run: `npm run test -- owner-dashboard`

Expected: FAIL because the current owner dashboard is a static placeholder.

**Step 3: Write minimal implementation**

Do not change production code in this task.

**Step 4: Run test to verify it still fails for the right reason**

Run: `npm run test -- owner-dashboard`

Expected: FAIL on the missing owner registration flow and submitted-business view.

**Step 5: Commit**

```bash
git add client/src/test/owner-dashboard.test.jsx client/src/test/ui-shell.test.jsx
git commit -m "test: cover owner dashboard business setup flow"
```

### Task 4: Implement the owner registration dashboard flow

**Files:**
- Create: `client/src/components/ui/textarea.jsx`
- Modify: `client/src/pages/dashboards/OwnerDashboard.jsx`
- Modify: `client/src/api/axios.js` only if needed for upload or asset handling
- Modify: `client/src/test/owner-dashboard.test.jsx`
- Modify: `client/src/test/ui-shell.test.jsx`

**Step 1: Write the failing test**

Use the failing client tests from Task 3.

**Step 2: Run test to verify it fails**

Run: `npm run test -- owner-dashboard`

Expected: FAIL because the dashboard still has no business fetch or form submission flow.

**Step 3: Write minimal implementation**

Implement:

- owner dashboard fetch of `/businesses/mine`
- registration form for missing business with name, category, location, description, contact, and image file
- form submission via `FormData`
- submitted business summary view with status badge, image, detail fields, average rating, review count, and public reviews list without reviewer names

**Step 4: Run test to verify it passes**

Run: `npm run test -- owner-dashboard`

Expected: PASS

**Step 5: Commit**

```bash
git add client/src/components/ui/textarea.jsx client/src/pages/dashboards/OwnerDashboard.jsx client/src/test/owner-dashboard.test.jsx client/src/test/ui-shell.test.jsx
git commit -m "feat: add owner business setup dashboard"
```

### Task 5: Final verification

**Files:**
- Verify only

**Step 1: Run server tests**

Run: `npm test -- business.routes`

Expected: PASS

**Step 2: Run client tests**

Run: `npm run test -- ui-shell owner-dashboard`

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
git commit -m "feat: add owner business registration flow"
```

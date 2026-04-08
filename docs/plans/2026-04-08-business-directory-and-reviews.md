# Business Directory And Reviews Implementation Plan

**Goal:** Build the student-facing approved-business directory and a public business detail experience with reviews, star ratings, and like/dislike reactions.

**Architecture:** Extend the existing `Business` route layer with public listing/detail endpoints plus student-only review and reaction mutations. Replace the student dashboard placeholder with a real directory view and add a dedicated business detail route that consumes the new public API.

**Tech Stack:** Express 5, Mongoose, express-session, React 19, React Router, Vite, Vitest, Testing Library, Supertest

---

### Task 1: Add failing server tests for listing filters and review actions

**Files:**
- Modify: `server/test/business.routes.test.mjs`

Add route tests that prove:

- only approved businesses are visible in the public list
- the public list supports category, search, and minimum-rating filters
- a single approved business can be fetched for detail view
- students can add one star review with text
- students can like or dislike reviews

Run: `npm test -- business.routes`

Expected: FAIL until the new public detail and student review routes exist.

### Task 2: Implement backend public detail and review routes

**Files:**
- Modify: `server/models/Business.js`
- Modify: `server/middleware/auth.js`
- Modify: `server/routes/businesses.js`

Implement:

- public listing filters for approved businesses
- public business detail endpoint
- student-only review creation
- student-only like/dislike review reactions
- review serialization with counts and current-user reaction state

Run: `npm test -- business.routes`

Expected: PASS

### Task 3: Add failing client tests for the student directory and detail flow

**Files:**
- Create: `client/src/test/student-directory.test.jsx`
- Create: `client/src/test/business-detail.test.jsx`
- Modify: `client/src/test/ui-shell.test.jsx`

Add tests that prove:

- the student dashboard renders approved business cards from the API
- search and filters narrow the visible businesses
- the detail page renders business content and review counts
- students can submit a review and react to reviews

Run: `npm run test -- student-directory business-detail ui-shell`

Expected: FAIL until the student UI and routing are implemented.

### Task 4: Implement the student directory and business detail UI

**Files:**
- Modify: `client/src/App.jsx`
- Modify: `client/src/pages/dashboards/StudentDashboard.jsx`
- Create: `client/src/pages/BusinessDetail.jsx`

Implement:

- approved-business listing UI
- search/category/rating filters
- navigation from directory to detail
- business detail hero, images, rating summary, review list, and review form
- like/dislike buttons wired to the review reaction endpoint

Run: `npm run test -- student-directory business-detail ui-shell`

Expected: PASS

### Task 5: Final verification

Run:

- `npm test -- startup business.routes`
- `npm run test -- student-directory business-detail admin-dashboard owner-dashboard ui-shell`
- `npm run lint`
- `npm run build`

Expected: PASS

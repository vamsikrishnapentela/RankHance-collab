# Mock Test List Page Implementation TODO

## Plan Steps (from approved plan):

### 1. Update frontend/src/api.js
- Add getMockTests function.

### 2. Create frontend/src/MockTests.jsx
- New component with fetch, UI matching Dashboard/Practice.

### 3. Update frontend/src/App.jsx
- Import MockTests.
- Add Route path="/mock-tests".

### 4. Update frontend/src/Dashboard.jsx
- Enable cards[2]: active:true, link:'/mock-tests', change icon to Edit3 (import).

### 5. Test
- Run frontend dev server.
- Navigate Dashboard → Mock Tests → Verify cards, API fetch.

**Progress:** Steps 1-4 complete. Next: Step 5 (Test).

**Completed:** [1. api.js, 2. MockTests.jsx, 3. App.jsx, 4. Dashboard.jsx]



# Result.jsx Chapter Performance Fix - TODO

## Plan Status: ✅ APPROVED

**Breakdown into steps:**

### ✅ Step 1: Create TODO.md [DONE]

### ✅ Step 2: Add static chapterNameMap to Result.jsx
- Extract all mappings from JSON data
- maths: 29 chapters (m1-m29)
- phy: 28 chapters (p1-p28)  
- che: 25 chapters (c1-c25)

### ✅ Step 3: Replace useEffect processing logic
- Build `subjectChapters = {maths:{}, phy:{}, che:{}}`
- Use `q.subject` + `q.chapter` keys
- Calculate accuracy + level per chapter

### ✅ Step 4: Fix UI rendering
- Remove conditional rendering for subjects
- Always show all 3 subjects (empty → "No data")
- Use `chap.name` from map
- Keep sorting + colors

### ✅ Step 5: Test & Validate
- Run mock test
- Verify: All subjects visible, real chapter names, correct grouping
- Update this TODO with progress

**Final Check:** ✅ ALL PASSED
- [x] Maths/Physics/Chemistry sections all appear
- [x] Chapter names: "Complex Numbers..." not question text
- [x] Colors: green(70+), yellow(40-69), red(<40)
- [x] No regressions in scores/review

**COMPLETED** 🎉


---

*Updated when steps complete*


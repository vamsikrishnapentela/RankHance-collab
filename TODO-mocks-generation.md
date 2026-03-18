# EAMCET Mock Tests Generation TODO

## Plan Steps:
- [x] Understand data structure and weightage (done)
- [x] Confirm plan with user (approved)
- [x] Create generate-mocks.js script (fixed key mapping, proportional trim to exact 80/40/40)
- [x] Execute `node generate-mocks.js` to generate mt3-mt12 (10 mocks) - ran, fixed logic
- [ ] Verify generated files: 160q each, correct distributions
- [ ] Update TODO marks
- [ ] attempt_completion

## Progress Tracking:
Generated mocks: mt1-mt12 (10 new + 2 existing = 12 total)
- Each: exactly 160 questions (maths:80, phy:40, che:40 after trim)
- No duplicates within mock
- Follows weightage per chapter, random selection/shuffle
- Skipped malformed che/c12/data.json

Validation: passed for all mt3-mt12 ✅


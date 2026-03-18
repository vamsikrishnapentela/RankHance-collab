const fs = require('fs');
const path = require('path');

const DATA_DIR = './backend/data';
const OUTPUT_DIR = path.join(DATA_DIR, '3-mocktests-questions');
const WEIGHTAGE_PATH = path.join(DATA_DIR, '4-Chapter-Weightage', 'weightage.json');
const QUIZ_DIR = path.join(DATA_DIR, '1-quiz-questions');

// Chapter lists from file listing
const chapters = {
  maths: Array.from({length: 29}, (_, i) => `m${i+1}`),
  phy: Array.from({length: 28}, (_, i) => `p${i+1}`),
  che: Array.from({length: 25}, (_, i) => `c${i+1}`)
};

const subjects = ['maths', 'phy', 'che'];
const targetTotals = {maths: 80, phy: 40, che: 40};

// Load weightage
const weightage = JSON.parse(fs.readFileSync(WEIGHTAGE_PATH, 'utf8'));

// Verify sums
const subjectMap = { maths: 'maths', phy: 'physics', che: 'chemistry' };
const sums = {};
subjects.forEach(sub => {
  const w = weightage[subjectMap[sub]];
  if (!w) {
    console.error(`No weightage for ${sub}`);
    process.exit(1);
  }
  sums[sub] = Object.values(w).reduce((a, b) => a + b, 0);
});
console.log('Subject map:', subjectMap);
console.log('Weightage sums:', sums);
subjects.forEach(sub => {
  if (sums[sub] !== targetTotals[sub]) {
    console.warn(`Warning: ${sub} sum ${sums[sub]} != target ${targetTotals[sub]}`);
  }
});

// Function to shuffle array Fisher-Yates
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Load current metadata
let metadata = [];
try {
  metadata = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'data.json'), 'utf8'));
  console.log(`Current mocks: ${metadata.length}`);
} catch (e) {
  console.log('No existing metadata');
}

// Generate 10 new mocks mt3 to mt12
const startMock = 21;
  const endMock = 40;
for (let mockNum = startMock; mockNum <= endMock; mockNum++) {
  console.log(`\\nGenerating mock mt${mockNum}...`);
  
  const questions = [];
  const usedIds = new Set();
  
  // Per subject
  subjects.forEach(subject => {
    let subQuestions = [];
    const subChapters = chapters[subject];
    const targetSub = targetTotals[subject];
    
    subChapters.forEach(chap => {
      const chapPath = path.join(QUIZ_DIR, subject, chap, 'data.json');
      let chapData;
      try {
        chapData = JSON.parse(fs.readFileSync(chapPath, 'utf8'));
      } catch (e) {
        console.error(`Error loading ${chapPath}:`, e.message);
        return;
      }
      
      const weight = weightage[subjectMap[subject]][chap];
      const available = chapData.filter(q => !usedIds.has(q.id));
      
      if (available.length < weight) {
        console.warn(`Warning: ${subject}/${chap} only ${available.length} available, need ${weight}`);
      }
      
      // Random select min(weight, available)
      const toPick = Math.min(weight, available.length);
      const selected = shuffle([...available]).slice(0, toPick);
      
      selected.forEach(q => {
        subQuestions.push({
          ...q,
          subject,
          chapter: chap
        });
        usedIds.add(q.id);
      });
      
      console.log(`  ${subject}/${chap}: picked ${selected.length}/${weight}`);
    });
    
    // Trim subQuestions to target if excess
    const originalSubLen = subQuestions.length;
    if (originalSubLen > targetSub) {
      shuffle(subQuestions);
      subQuestions = subQuestions.slice(0, targetSub);
      console.log(`  Trimmed ${subject} from ${originalSubLen} to ${targetSub}`);
    } else {
      console.log(`  ${subject} total: ${originalSubLen} (target ${targetSub})`);
    }
    
    // Add to main questions
    questions.push(...subQuestions);
  });
  
  // Shuffle all questions
  shuffle(questions);
  
  // Validate
  const total = questions.length;
  const counts = {};
  subjects.forEach(sub => {
    counts[sub] = questions.filter(q => q.subject === sub).length;
  });
const finalIds = new Set(questions.map(q => q.id));
  const dupCount = finalIds.size !== total ? total - finalIds.size : 0;
  
  console.log(`Generated: total=${total}, ${JSON.stringify(counts)}, dups=${dupCount}`);
  
  // Check exact per subject
  let valid = true;
  subjects.forEach(sub => {
    if (counts[sub] !== targetTotals[sub]) {
      console.error(`Invalid ${sub}: ${counts[sub]} != ${targetTotals[sub]}`);
      valid = false;
    }
  });
  if (!valid || dupCount > 0 || total !== 160) {
    console.error('Validation failed for mt' + mockNum);
    continue;
  }
  
  // Ensure dir exists
  const mockDir = path.join(OUTPUT_DIR, `mt${mockNum}`);
  if (!fs.existsSync(mockDir)) {
    fs.mkdirSync(mockDir, { recursive: true });
  }
  
  // Write data.json
  fs.writeFileSync(path.join(mockDir, 'data.json'), JSON.stringify(questions, null, 2));
  
  // Append metadata
  metadata.push({
    id: `mt${mockNum}`,
    name: `EAMCET Grand Mock Test ${mockNum}`,
    totalQuestions: 160,
    duration: 180,
    distribution: {math: 80, phy: 40, che: 40}
  });
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'data.json'), JSON.stringify(metadata, null, 2));
  
  console.log(`✅ Saved mt${mockNum}/data.json (${total} questions)`);
}

console.log('\\n✅ Generation complete! Added mocks mt' + startMock + '-' + endMock);
console.log('Total mocks now:', metadata.length);


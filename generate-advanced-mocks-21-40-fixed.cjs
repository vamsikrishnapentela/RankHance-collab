const fs = require('fs');
const path = require('path');

const DATA_DIR = './backend/data';
const OUTPUT_DIR = path.join(DATA_DIR, '3-mocktests-questions');
const ADVANCED_DIR = path.join(OUTPUT_DIR, 'advanced');
const WEIGHTAGE_PATH = path.join(DATA_DIR, '4-Chapter-Weightage', 'weightage.json');
const QUIZ_DIR = path.join(DATA_DIR, '2-Chapter Practice-questions');

const chapters = {
  maths: Array.from({length: 29}, (_, i) => `m${i+1}`),
  phy: Array.from({length: 28}, (_, i) => `p${i+1}`),
  che: Array.from({length: 25}, (_, i) => `c${i+1}`)
};

const subjects = ['maths', 'phy', 'che'];
const targetTotals = {maths: 80, phy: 40, che: 40};

const weightage = JSON.parse(fs.readFileSync(WEIGHTAGE_PATH, 'utf8'));

const subjectMap = { maths: 'maths', phy: 'physics', che: 'chemistry' };
console.log('Weightage sums:', Object.fromEntries(subjects.map(sub => [sub, Object.values(weightage[subjectMap[sub]]).reduce((a,b) => a+b, 0)])));

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

if (!fs.existsSync(ADVANCED_DIR)) {
  fs.mkdirSync(ADVANCED_DIR, { recursive: true });
}

// Generate adv21-adv40
for (let mockNum = 21; mockNum <= 40; mockNum++) {
  console.log(`\\nGenerating advanced mock adv${mockNum}...`);
  
  const questions = [];
  const usedIds = new Set();
  
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
        console.log(`Skipped ${chapPath}`);
        return;
      }
      
      const weight = weightage[subjectMap[subject]][chap];
      const available = chapData.filter(q => !usedIds.has(q.id));
      const toPick = Math.min(weight, available.length);
      const selected = shuffle([...available]).slice(0, toPick);
      
      selected.forEach(q => {
        subQuestions.push({...q, subject, chapter: chap});
        usedIds.add(q.id);
      });
      
      console.log(`  ${subject}/${chap}: ${selected.length}/${weight}`);
    });
    
    const origLen = subQuestions.length;
    if (origLen > targetSub) {
      shuffle(subQuestions);
      subQuestions = subQuestions.slice(0, targetSub);
      console.log(`  Trimmed ${subject}: ${origLen}→${targetSub}`);
    }
    questions.push(...subQuestions);
  });
  
  shuffle(questions);
  
  const total = questions.length;
  const counts = subjects.reduce((acc, sub) => ({...acc, [sub]: questions.filter(q => q.subject === sub).length}), {});
  console.log(`Generated: ${total}q ${JSON.stringify(counts)} dups:${Array.from(usedIds).length !== total ? total - Array.from(usedIds).length : 0}`);
  
  const mockDir = path.join(ADVANCED_DIR, `adv${mockNum}`);
  fs.mkdirSync(mockDir, { recursive: true });
  fs.writeFileSync(path.join(mockDir, 'data.json'), JSON.stringify(questions, null, 2));
  
  console.log(`✅ adv${mockNum} saved (${total} questions)`);
}

console.log('\\n✅ Advanced mocks adv21-adv40 complete from practice questions!');


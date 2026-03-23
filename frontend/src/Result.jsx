import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Card from './components/Card';
import Button from './components/Button';
import Container from './components/Container';

const Result = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  // testId is now included in state (set by MockAttempt.jsx after submit)
  const { test, questions, answers, flags, testId } = location.state || {};

  const [stats, setStats] = useState({
    total: 0, correct: 0, wrong: 0, unattempted: 0, score: 0, accuracy: 0, attempted: 0
  });
  const [subjectStats,       setSubjectStats]       = useState({});
  const [groupedChapterStats, setGroupedChapterStats] = useState({ maths: {}, phy: {}, che: {} });

  const chapterNameMap = {
    maths: {
      "m1": "Complex Numbers and De-Moivre's Theorem",
      "m2": "Quadratic Expressions",
      "m3": "Theory of Equations",
      "m4": "Functions",
      "m5": "Mathematical Induction",
      "m6": "Partial Fractions",
      "m7": "Binomial Theorem",
      "m8": "Permutations and Combinations",
      "m9": "Matrices and Determinants",
      "m10": "Measures of Dispersion",
      "m11": "Probability",
      "m12": "Trigonometric Functions and Identities",
      "m13": "Trigonometric Equations",
      "m14": "Properties of Triangles",
      "m15": "Inverse Trigonometric Functions",
      "m16": "Hyperbolic Functions",
      "m17": "Rectangular Cartesian Coordinates",
      "m18": "Straight Line and Pair of Straight Lines",
      "m19": "Circle and System of Circles",
      "m20": "Conic Sections",
      "m21": "Vector Algebra",
      "m22": "Three Dimensional Geometry",
      "m23": "Limits and Continuity",
      "m24": "Differentiation",
      "m25": "Applications of Derivatives",
      "m26": "Indefinite Integrals",
      "m27": "Definite Integrals and Its Applications",
      "m28": "Differential Equations",
      "m29": "Miscellaneous"
    },
    phy: {
      "p1": "Physical World, Units and Measurements",
      "p2": "Kinematics",
      "p3": "Laws of Motion",
      "p4": "Work, Energy and Power",
      "p5": "Rotational Motion",
      "p6": "Gravitation",
      "p7": "Mechanical Properties of Solids",
      "p8": "Mechanical Properties of Fluids",
      "p9": "Thermal Properties of Matter",
      "p10": "Thermodynamics",
      "p11": "Kinetic Theory of Gases",
      "p12": "Oscillations",
      "p13": "Waves",
      "p14": "Electric Charges and Fields",
      "p15": "Electrostatic Potential and Capacitance",
      "p16": "Current Electricity",
      "p17": "Magnetic Effects of Current",
      "p18": "Magnetism and Matter",
      "p19": "Electromagnetic Induction",
      "p20": "Alternating Current",
      "p21": "Electromagnetic Waves",
      "p22": "Ray Optics and Optical Instruments",
      "p23": "Wave Optics",
      "p24": "Dual Nature of Radiation and Matter",
      "p25": "Atoms",
      "p26": "Nuclei",
      "p27": "Semiconductor Electronics: Materials, Devices and Simple Circuits",
      "p28": "Communication Systems"
    },
    che: {
      "c1": "Some Basic Concepts and Stoichiometry",
      "c2": "Atomic Structure",
      "c3": "Chemical Bonding and Molecular Structure",
      "c4": "Gaseous and Liquid States",
      "c5": "Solid State",
      "c6": "Solutions",
      "c7": "Thermodynamics",
      "c8": "Chemical Equilibrium",
      "c9": "Chemical Kinetics",
      "c10": "Electrochemistry",
      "c11": "Surface Chemistry",
      "c12": "General Principles of Metallurgy",
      "c13": "Classification of Elements and Periodic Properties",
      "c14": "Hydrogen and Its Compounds",
      "c15": "s and p-Block Elements",
      "c16": "Transition Elements (d & f - Block Elements)",
      "c17": "Coordination Compounds",
      "c18": "General Organic Chemistry and Hydrocarbons",
      "c19": "Haloalkanes and Haloarenes",
      "c20": "Alcohols, Phenols and Ethers",
      "c21": "Aldehydes, Ketones and Carboxylic Acids",
      "c22": "Organic Compounds Containing Nitrogen (Diazonium Salts, Cyanides and Isocyanides)",
      "c23": "Polymers",
      "c24": "Biomolecules and Chemistry in Everyday Life",
      "c25": "Environmental Chemistry"
    }
  };

  useEffect(() => {
    if (!questions || questions.length === 0) return;

    const total = questions.length;
    let correct = 0, wrong = 0, unattempted = 0;

    const subjStats = {
      maths:     { correct: 0, wrong: 0, total: 0 },
      physics:   { correct: 0, wrong: 0, total: 0 },
      chemistry: { correct: 0, wrong: 0, total: 0 },
    };

    const subjectChapters = { maths: {}, phy: {}, che: {} };

    questions.forEach((q) => {
      const userAns   = answers[q.globalIdx];
      const isCorrect = userAns === q.correctIndex;

      if (userAns !== undefined) { isCorrect ? correct++ : wrong++; }
      else { unattempted++; }

      // Subject stats
      const subjectFull = q.subject === 'maths' ? 'maths' : q.subject === 'phy' ? 'physics' : 'chemistry';
      subjStats[subjectFull].total++;
      if (userAns !== undefined) {
        isCorrect ? subjStats[subjectFull].correct++ : subjStats[subjectFull].wrong++;
      }

      // Chapter stats
      const subjectShort = q.subject;
      const chapterId    = q.chapter;
      if (chapterId && subjectChapters[subjectShort] !== undefined) {
        if (!subjectChapters[subjectShort][chapterId]) {
          subjectChapters[subjectShort][chapterId] = {
            correct: 0, wrong: 0, total: 0,
            name: chapterNameMap[subjectShort]?.[chapterId] || chapterId,
          };
        }
        subjectChapters[subjectShort][chapterId].total++;
        if (userAns !== undefined) {
          isCorrect
            ? subjectChapters[subjectShort][chapterId].correct++
            : subjectChapters[subjectShort][chapterId].wrong++;
        }
      }
    });

    // Accuracy + level per chapter
    ['maths', 'phy', 'che'].forEach(sub => {
      Object.values(subjectChapters[sub]).forEach(ch => {
        const acc  = ch.total > 0 ? (ch.correct / ch.total) * 100 : 0;
        ch.accuracy = Math.round(acc);
        ch.level    = acc >= 70 ? 'strong' : acc >= 40 ? 'medium' : 'weak';
      });
    });

    // Accuracy per subject
    Object.keys(subjStats).forEach(s => {
      const acc = subjStats[s].total > 0 ? (subjStats[s].correct / subjStats[s].total) * 100 : 0;
      subjStats[s].accuracy = Math.round(acc);
    });

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const score    = Math.round((correct / total) * 100);

    setStats({ total, correct, wrong, unattempted, score, accuracy, attempted: correct + wrong });
    setSubjectStats(subjStats);
    setGroupedChapterStats(subjectChapters);
  }, [questions, answers]);

  // ── No data guard ────────────────────────────────────────────────────────
  if (!questions) {
    return (
      <div className="flex-1 w-full bg-gray-50 flex flex-col items-center justify-center p-6 min-h-[calc(100dvh-64px)]">
        <Card className="text-center p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Results</h2>
          <p className="text-gray-500 mb-6">No test data found.</p>
          <Button onClick={() => navigate('/mock-tests')} variant="primary">
            Back to Mock Tests
          </Button>
        </Card>
      </div>
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const handleReview = () => {
    navigate('/review', {
      state: {
        // legacy fields (kept in case Review ever falls back to them)
        questions,
        answers,
        flags,
        // ✅ THIS is what Review.jsx uses to fetch from the DB
        testId,
      },
    });
  };

  return (
    <div className="flex-1 w-full bg-gray-50 min-h-[calc(100dvh-64px)] p-6">
      <Container>
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          Back
        </Button>

        {/* ── Summary Card ──────────────────────────────────────────────────── */}
        <Card className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            {stats.score}%
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.wrong}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Wrong</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-500">{stats.unattempted}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Unattempted</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wide">Total</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">Accuracy: {stats.accuracy}%</div>
        </Card>

        {/* ── Subject Cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(subjectStats).map(([subject, data]) => (
            <Card key={subject}>
              <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">{subject}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-green-600 font-semibold">{data.correct}</span>
                  <span>Correct</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600 font-semibold">{data.wrong}</span>
                  <span>Wrong</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--color-primary)]">{data.accuracy}%</div>
            </Card>
          ))}
        </div>

        {/* ── Action Buttons ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={handleReview}          // ← uses the fixed handler
            className="flex-1"
          >
            Review Questions
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="flex-1"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* ── Chapter Analysis ───────────────────────────────────────────────── */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Chapter Performance</h2>

          {/* Mathematics */}
          <Card className="mb-8 p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">📐 Mathematics</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(groupedChapterStats.maths || {}).length > 0 ? (
                Object.entries(groupedChapterStats.maths)
                  .sort(([, a], [, b]) => b.accuracy - a.accuracy)
                  .map(([chId, data]) => <ChapterCard key={chId} chapter={data.name} data={data} />)
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">No data available</div>
              )}
            </div>
          </Card>

          {/* Physics */}
          <Card className="mb-8 p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">⚛️ Physics</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(groupedChapterStats.phy || {}).length > 0 ? (
                Object.entries(groupedChapterStats.phy)
                  .sort(([, a], [, b]) => b.accuracy - a.accuracy)
                  .map(([chId, data]) => <ChapterCard key={chId} chapter={data.name} data={data} />)
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">No data available</div>
              )}
            </div>
          </Card>

          {/* Chemistry */}
          <Card className="mb-8 p-0">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">🧪 Chemistry</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(groupedChapterStats.che || {}).length > 0 ? (
                Object.entries(groupedChapterStats.che)
                  .sort(([, a], [, b]) => b.accuracy - a.accuracy)
                  .map(([chId, data]) => <ChapterCard key={chId} chapter={data.name} data={data} />)
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">No data available</div>
              )}
            </div>
          </Card>
        </Card>
      </Container>
    </div>
  );
};

// ── Chapter card ─────────────────────────────────────────────────────────────
const ChapterCard = ({ chapter, data }) => {
  const styles = {
    strong: { bg: 'bg-green-50 border-green-200', dot: 'bg-green-500', text: 'text-green-700', val: 'text-green-600' },
    medium: { bg: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500', text: 'text-yellow-700', val: 'text-yellow-600' },
    weak:   { bg: 'bg-red-50 border-red-200',    dot: 'bg-red-500',    text: 'text-red-700',   val: 'text-red-600'   },
  };
  const s = styles[data?.level] || styles.weak;

  return (
    <div className={`p-4 ${s.bg} border rounded-xl`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 ${s.dot} rounded-full`} />
        <span className={`font-semibold text-sm ${s.text}`}>
          {data?.level ? data.level.charAt(0).toUpperCase() + data.level.slice(1) : 'Unknown'}
        </span>
      </div>
      <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1">{chapter}</h4>
      <div className={`text-2xl font-bold ${s.val}`}>{data?.accuracy}%</div>
      <div className="text-xs text-gray-500 mt-1">{data?.correct}✓ {data?.wrong}✗ of {data?.total}</div>
    </div>
  );
};

export default Result;
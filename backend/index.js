const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const readJsonFile = (filePath) => {
    try {
        const absolutePath = path.join(__dirname, 'data', filePath);
        if (fs.existsSync(absolutePath)) {
            const data = fs.readFileSync(absolutePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error("Error reading file:", filePath, error);
        return null;
    }
};

app.get('/api/subjects', (req, res) => {
    const data = readJsonFile('subjects/data.json');
    res.json(data || []);
});

app.get('/api/:chapterType/:subjectId', (req, res, next) => {
    const { chapterType, subjectId } = req.params;
    if (chapterType.startsWith('chapters')) {
        let data = readJsonFile(`${chapterType}/${subjectId}/data.json`);
        if (!data) {
            data = readJsonFile(`chapter-names/${subjectId}/data.json`) || readJsonFile(`chapters_formulas/${subjectId}/data.json`) || readJsonFile(`chapters_practice/${subjectId}/data.json`);
            if (!data) {
                // To prevent completely breaking the frontend, read the very first available chapters logic
                try {
                    const fallbackFolder = fs.readdirSync(path.join(__dirname, 'data')).find(f => f.startsWith('chapter'));
                    if (fallbackFolder) data = readJsonFile(`${fallbackFolder}/${subjectId}/data.json`);
                } catch(e) {}
            }
        }
        
        if (data) {
            return res.json(data);
        } else {
            return res.status(404).json({ message: "Subject not found" });
        }
    }
    next();
});

app.get('/api/formulas/:chapterId', (req, res) => {
    const { chapterId } = req.params;
    const subjectId = chapterId.startsWith('m') ? 'maths' : chapterId.startsWith('p') ? 'phy' : 'che';
    const data = readJsonFile(`formulas/${subjectId}/${chapterId}/data.json`);
    res.json(data || []);
});

app.get('/api/questions/:chapterId', (req, res) => {
    const { chapterId } = req.params;
    const subjectId = chapterId.startsWith('m') ? 'maths' : chapterId.startsWith('p') ? 'phy' : 'che';
    const data = readJsonFile(`2-Chapter Practice-questions/${subjectId}/${chapterId}/data.json`);
    res.json(data || []);
});

app.get('/api/quiz/:chapterId', (req, res) => {
    const { chapterId } = req.params;
    const subjectId = chapterId.startsWith('m') ? 'maths' : chapterId.startsWith('p') ? 'phy' : 'che';
    const data = readJsonFile(`1-quiz-questions/${subjectId}/${chapterId}/data.json`);
    res.json(data || []);
});

app.get('/api/mocktests', (req, res) => {
    const data = readJsonFile('3-mocktests-questions/data.json');
    if (data) {
        res.json(data.map(t => ({ id: t.id, name: t.name, duration: t.duration, totalQuestions: t.totalQuestions, distribution: t.distribution })));
    } else {
        res.json([]);
    }
});

app.get('/api/mocktest/:testId', (req, res) => {
    const { testId } = req.params;
    const data = readJsonFile('3-mocktests-questions/data.json');
    if (data) {
        const test = data.find(t => t.id === testId);
        if (test) {
            const questions = readJsonFile(`3-mocktests-questions/${testId}/data.json`);
            test.questions = questions || [];
            return res.json(test);
        }
    }
    res.status(404).json({ message: "Mock test not found" });
});

app.get('/api/weightage', (req, res) => {
    const data = readJsonFile('weightage/data.json');
    res.json(data || []);
});

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`);
});

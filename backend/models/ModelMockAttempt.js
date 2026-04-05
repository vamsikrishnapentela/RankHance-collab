const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  globalIdx: { type: Number, required: true },
  subject: { type: String, required: true },
  selectedOption: { type: Number, default: null },
  isFlagged: { type: Boolean, default: false },
}, { _id: false });

const modelMockAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: String, required: true },
  batchId: { type: Number, required: true },
  testName: { type: String },
  questions: [
    {
      questionId: { type: String },
      globalIdx: { type: Number },
      subject: { type: String },
      _id: false,
    }
  ],
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number },
  timeTakenSeconds: { type: Number },
  submittedAt: { type: Date, default: Date.now },
});

modelMockAttemptSchema.index({ userId: 1, batchId: 1 }, { unique: true });
modelMockAttemptSchema.index({ batchId: 1, score: -1, timeTakenSeconds: 1 });

module.exports = mongoose.model('ModelMockAttempt', modelMockAttemptSchema);

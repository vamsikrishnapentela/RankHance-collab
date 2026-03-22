const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  globalIdx: { type: Number, required: true },
  subject: { type: String, required: true },
  selectedOption: { type: Number, default: null },
  isFlagged: { type: Boolean, default: false },
}, { _id: false });

const mockTestAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: String, required: true },
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

mockTestAttemptSchema.index({ userId: 1, testId: 1 });

module.exports = mongoose.model('MockTestAttempt', mockTestAttemptSchema);
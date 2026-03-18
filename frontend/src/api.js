import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL + '/api',
});

// GET /api/chapters/:subject
export const getChapters = async (subject) => {
  const { data } = await api.get(`/chapters/${subject}`);
  return data;
};

// GET /api/questions/:chapterId
export const getQuestions = async (chapterId) => {
  const { data } = await api.get(`/questions/${chapterId}`);
  return data;
};

// GET /api/quiz/:chapterId
export const getQuiz = async (chapterId) => {
  const { data } = await api.get(`/quiz/${chapterId}`);
  return data;
};

// GET /api/mocktests
export const getMockTests = async () => {
  const { data } = await api.get('/mocktests');
  return data;
};

// GET /api/mocktest/:testId
export const getMockTest = async (testId) => {
  const { data } = await api.get(`/mocktest/${testId}`);
  return data;
};

// GET /api/subjects
export const getSubjects = async () => {
  const { data } = await api.get('/subjects');
  return data;
};

export default api;



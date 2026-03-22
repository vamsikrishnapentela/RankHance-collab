import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL + '/api',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rankhance_token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// --- Auth API ---
export const register = async (userData) => {
  const referral = localStorage.getItem("referral");

  console.log("Sending referral:", referral); // 👈 DEBUG

  const { data } = await api.post('/auth/register', {
    ...userData,
    referredBy: referral || null
  });

  return data;
};

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const loginWithGoogle = async (tokenId) => {
  const referral = localStorage.getItem("referral");

  const { data } = await api.post('/auth/google', { 
    tokenId,
    referredBy: referral || null
  });

  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/user');
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const verifyOtp = async (email, otp) => {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
  return data;
};

// --- Payment API ---
export const createOrder = async () => {
  const { data } = await api.post('/payment/create-order');
  return data;
};

// POST /api/payment/verify
export const verifyPayment = async (paymentData) => {
  const { data } = await api.post('/payment/verify', paymentData);
  return data;
};

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

// GET /api/creator/dashboard
export const getCreatorDashboard = async () => {
  const { data } = await api.get('/creator/dashboard');
  return data;
};

//admin apis
export const getAdminDashboard = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};

export default api;



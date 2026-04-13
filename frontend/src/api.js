import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

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

// GET /api/formulas/:subject/:year
export const getFormulas = async (subject, year) => {
  const subjectMap = {
    'maths': 'maths',
    'physics': 'phy',
    'chemistry': 'che'
  };
  const mappedSubject = subjectMap[subject] || subject;
  const { data } = await api.get(`/formulas/${mappedSubject}/${year}`);
  return data;
};

// GET /api/manager/dashboard
export const getManagerDashboard = async () => {
  const { data } = await api.get('/manager/dashboard');
  return data;
};

// GET /api/creator/dashboard
export const getCreatorDashboard = async () => {
  const { data } = await api.get('/creator/dashboard');
  return data;
};

// --- Super Admin API ---
export const superAdminUserSearch = async (email) => {
  const { data } = await api.get(`/superadmin/user-search?email=${email}`);
  return data;
};

export const superAdminUpdateUser = async (email, updates, key) => {
  const { data } = await api.post('/superadmin/update-user', { email, updates, key });
  return data;
};

export const superAdminReferralReport = async () => {
  const { data } = await api.get('/superadmin/referral-report');
  return data;
};

export const superAdminGetAnalytics = async () => {
  const { data } = await api.get('/superadmin/analytics');
  return data;
};

export const superAdminExportUsers = async (type) => {
  const { data } = await api.get(`/superadmin/export-users?type=${type}`);
  return data;
};

export const getPublicAnnouncement = async () => {
  const { data } = await api.get('/public/announcement');
  return data;
};

export const superAdminUpdateAnnouncement = async (announcementData) => {
  const { data } = await api.post('/superadmin/announcement', announcementData);
  return data;
};

export const superAdminBatchVerify = async (emails) => {
  const { data } = await api.post('/superadmin/batch-verify', { emails });
  return data;
};

// --- Support API ---
export const createTicket = async (ticketData) => {
  const { data } = await api.post('/support/ticket', ticketData);
  return data;
};

export const getUserTickets = async () => {
  const { data } = await api.get('/support/user-tickets');
  return data;
};

export const getAdminTickets = async () => {
  const { data } = await api.get('/support/admin-tickets');
  return data;
};

export const replyToTicketAdmin = async (replyData) => {
  const { data } = await api.post('/support/admin-reply', replyData);
  return data;
};

export default api;



import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  signup: (username, password, email) =>
    apiClient.post('/auth/signup', { username, password, email }),
  login: (username, password) =>
    apiClient.post('/auth/login', { username, password }),
  getProfile: () => apiClient.get('/auth/profile'),
};

export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return apiClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  get: () => apiClient.get('/resume'),
};


export const jobsAPI = {
  fetch: (search, location) =>
    apiClient.post('/jobs/fetch', { search, location }),
  getFiltered: async(filters) =>
    apiClient.get('/jobs', { params: filters }),
  getJob: (jobId) =>
    apiClient.get(`/jobs/${jobId}`),
  getFilterOptions: () =>
    apiClient.get('/jobs/options/filters'),
  search: (search, location) =>
    apiClient.post('/jobs/search', { search, location }),
};

export const applicationsAPI = {
  apply: (jobDetails ) =>
    apiClient.post('/applications/apply', jobDetails), 
  getAll: () => 
    apiClient.get('/applications'),
  updateStatus: (jobId, status) =>
    apiClient.put(`/applications/${jobId}/status`, { status }),
};

export const aiAPI = {
  chat: (messages) => apiClient.post('/ai/chat', { messages }),
  matchJobs: (jobIds, maxJobs = 5) => apiClient.post('/ai/match-jobs', { jobIds, maxJobs }),
  getStatus: () => apiClient.get('/ai/status'),
};

export default apiClient;

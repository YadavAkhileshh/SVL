import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout - please try again';
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Network error - please check if backend is running';
    }
    return Promise.reject(error);
  }
);

export const processVideo = async (url) => {
  try {
    const response = await api.post('/process-video', { url });
    return response.data;
  } catch (error) {
    // Fallback for demo purposes
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Backend server is not running. Please start the backend first.');
    }
    throw error;
  }
};

export const chatWithTutor = async (videoId, message) => {
  const response = await api.post('/chat', {
    video_id: videoId,
    message
  });
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
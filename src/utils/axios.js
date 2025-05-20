import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_HOST_URL || 'http://localhost:8000';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // Enable sending cookies in cross-origin requests
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get stored credentials
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');

        if (!username || !password) {
          // If no credentials stored, redirect to login
          window.location.href = '/';
          return Promise.reject(error);
        }

        // Try to get a new token
        const response = await axios.post(
          `${BACKEND_URL}/auth/token`,
          new URLSearchParams({
            username: username,
            password: password,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const { access_token } = response.data;
        localStorage.setItem('token', access_token);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 
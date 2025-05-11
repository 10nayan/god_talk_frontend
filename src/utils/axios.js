import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_HOST_URL,
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
          // If no credentials stored, clear storage and redirect to login
          localStorage.clear();
          window.location.replace('/');
          return Promise.reject(error);
        }

        // Try to get a new token
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_HOST_URL}/auth/token`,
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
        // If refresh fails, clear storage and redirect to login
        localStorage.clear();
        window.location.replace('/');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 
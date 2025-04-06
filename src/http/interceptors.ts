import { getBaseUrl } from './globalUrl';
import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: getBaseUrl()
});

// Function to handle unauthorized responses
const handleUnauthorized = () => {
  // Clear auth token
  localStorage.setItem('authkey', '');
  localStorage.setItem('email', '');
  localStorage.setItem('clientId', '');
  localStorage.setItem('pinNumber', '');
  
  // Redirect to login page
  window.location.href = `/${process.env.PUBLIC_URL}`;
};

// Interceptor for fetch API
export const setupFetchInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    
    // Clone the response so we can read it multiple times
    const clonedResponse = response.clone();
    
    // Check for 403 status
    if (response.status === 403) {
      handleUnauthorized();
      throw new Error('Unauthorized access');
    }
    
    return response;
  };
};

// Interceptor for axios
export const setupAxiosInterceptor = () => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 403) {
        handleUnauthorized();
      }
      return Promise.reject(error);
    }
  );
};

export { axiosInstance }; 
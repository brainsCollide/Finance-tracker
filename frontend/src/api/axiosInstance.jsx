import axios from 'axios';

// Dynamically fetch the base URL from environment variables
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL , 
    withCredentials: true, // Include cookies in requests
});

console.log('Axios Base URL:', axiosInstance.defaults.baseURL);

export default axiosInstance;
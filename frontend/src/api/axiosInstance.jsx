import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: 'http://localhost:5001', 
    withCredentials: true, // Include cookies in requests
});



console.log('Axios Base URL:', axiosInstance.defaults.baseURL);

export default axiosInstance;
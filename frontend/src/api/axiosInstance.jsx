import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // ✅ Backend URL
    withCredentials: true, // ✅ Ensures cookies are always sent
});

export default axiosInstance;
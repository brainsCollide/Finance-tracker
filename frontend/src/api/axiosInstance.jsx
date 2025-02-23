import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5001", // ✅ Backend URL
    withCredentials: true, // ✅ Ensures cookies are always sent
});

export default axiosInstance;
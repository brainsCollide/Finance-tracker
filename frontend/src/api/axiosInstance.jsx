import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://dashboard-production-fd39.up.railway.app", // ✅ API base URL
    withCredentials: true, // ✅ Important: Allows cookies to be sent
});

export default axiosInstance;
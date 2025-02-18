import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import ProfilePage from "./ProfilePage";

const ProfileBoard = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSignUp, setIsSignUp] = useState(true);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState(null); // Stores user data

  // ✅ Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosInstance.get("/auth/current", { withCredentials: true });
        setUserData(response.data.user);
      } catch (error) {
        console.error("Not authenticated:", error.response?.data?.message || error.message);
      }
    };
    checkAuthStatus();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      if (isSignUp) {
        const signUpResponse = await axiosInstance.post("/auth/signup", form);
        setMessage({ text: "Account created successfully!", type: "success" });

        // ✅ Step 2: Automatically log in after successful sign-up
        const signInResponse = await axiosInstance.post(
          "/auth/signin",
          { email: form.email, password: form.password },
          { withCredentials: true }
        );

        // ✅ Step 3: Fetch user data
        const userResponse = await axiosInstance.get("/auth/current", { withCredentials: true });
        setUserData(userResponse.data.user);
      } else {
        const response = await axiosInstance.post("/auth/signin", 
          { email: form.email, password: form.password },
          { withCredentials: true } 
        );

        setMessage({ text: response.data.message, type: "success" });

        // Fetch user after sign-in
        const userResponse = await axiosInstance.get("/auth/current", { withCredentials: true });
        setUserData(userResponse.data.user);
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Authentication failed. Please try again.",
        type: "error",  
      });
    }
  };

  // ✅ If the user is authenticated, show ProfilePage
  if (userData) {
    return <ProfilePage user={userData} onLogout={() => setUserData(null)} />;
  }

  return (
    <div className="p-6 sm:p-10 min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isSignUp ? "Create an Account" : "Welcome Back!"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-600">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-8 right-3 text-sm font-medium text-blue-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg shadow-lg hover:bg-blue-600 transition"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-blue-500 hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-blue-500 hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
        </p>

        {message.text && (
          <p
            className={`mt-4 text-center text-sm ${
              message.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileBoard;
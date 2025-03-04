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
  const [userData, setUserData] = useState(null);
  
  // ✅ Modified password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    allLowercase: false,  // ✅ Changed from hasLowercase to allLowercase
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const [passwordTouched, setPasswordTouched] = useState(false);

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

  // ✅ Modified validation function to check for all lowercase
  const validatePassword = (password) => {
    return {
      minLength: password.length >= 6,
      allLowercase: /^[a-z]*$/.test(password), // ✅ Tests if password contains ONLY lowercase letters
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (name === 'password') {
      setPasswordValidation(validatePassword(value));
      if (!passwordTouched) setPasswordTouched(true);
    }
  };
  
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  
  const isFormValid = () => {
    if (isSignUp) {
      return form.username && form.email && form.password && isPasswordValid;
    }
    return form.email && form.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    
    if (isSignUp && !isPasswordValid) {
      setMessage({ 
        text: "Password does not meet all requirements.", 
        type: "error" 
      });
      return;
    }

    try {
      if (isSignUp) {
        const signUpResponse = await axiosInstance.post("/auth/signup", form);
        setMessage({ text: "Account created successfully!", type: "success" });

        const signInResponse = await axiosInstance.post(
          "/auth/signin",
          { email: form.email, password: form.password },
          { withCredentials: true }
        );

        const userResponse = await axiosInstance.get("/auth/current", { withCredentials: true });
        setUserData(userResponse.data.user);
      } else {
        const response = await axiosInstance.post("/auth/signin", 
          { email: form.email, password: form.password },
          { withCredentials: true } 
        );

        setMessage({ text: response.data.message, type: "success" });

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
              className={`w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-12 
                ${isSignUp && passwordTouched && !isPasswordValid ? 'border-red-300' : ''}`}
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
          
          {/* ✅ Modified password requirements display */}
          {isSignUp && passwordTouched && (
            <div className="text-sm space-y-1 mt-2 bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-700">Password Requirements:</h4>
              <ul className="space-y-1 pl-5">
                <li className={passwordValidation.minLength ? "text-green-600" : "text-red-500"}>
                  {passwordValidation.minLength ? "✓" : "✗"} At least 6 characters
                </li>
                <li className={passwordValidation.allLowercase ? "text-green-600" : "text-red-500"}>
                  {passwordValidation.allLowercase ? "✓" : "✗"} Must contain only lowercase letters
                </li>
              </ul>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 rounded-lg shadow-lg transition ${
              isSignUp && !isFormValid() 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isSignUp && !isFormValid()}
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setPasswordTouched(false);
                }}
                className="text-blue-500 hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
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

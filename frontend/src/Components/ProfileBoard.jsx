import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import FloatingBubbles from "../Components/FloatingBubbles";
import T from "../assets/letter-t.svg";

const validatePassword = (password) => ({
  minLength: password.length >= 8,
  hasLowercase: /[a-z]/.test(password),
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /\d/.test(password),
});

const ProfileBoard = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSignUp, setIsSignUp] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
  });
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Kalau sudah login, langsung ke dashboard
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await axiosInstance.get("/auth/current", { withCredentials: true });
        navigate("/app/dashboard", { replace: true });
      } catch {
        setChecking(false); // belum login, tampilkan form
      }
    };
    checkAuthStatus();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "password") {
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

  const switchMode = (signUp) => {
    setIsSignUp(signUp);
    setPasswordTouched(false);
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (isSignUp && !isPasswordValid) {
      setMessage({
        text: "Password does not meet all requirements.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await axiosInstance.post("/auth/signup", form);
      }

      await axiosInstance.post(
        "/auth/signin",
        { email: form.email, password: form.password },
        { withCredentials: true }
      );

      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      setMessage({
        text:
          error.response?.data?.message ||
          "Authentication failed. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#f8fbff] px-6 py-10 flex flex-col justify-center items-center">
      <FloatingBubbles />
      <div className="relative z-10 w-full sm:max-w-md">
        <div className="w-full flex justify-center mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <img src={T} alt="Logo" className="w-6 h-6 invert" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
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
              className={`w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-12 ${
                isSignUp && passwordTouched && !isPasswordValid ? "border-red-300" : ""
              }`}
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

          {!isSignUp && (
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {isSignUp && passwordTouched && (
            <div className="text-sm space-y-1 mt-2 bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-700">Password Requirements:</h4>

              <ul className="space-y-1 pl-5">
                <li className={passwordValidation.minLength ? "text-green-600" : "text-red-500"}>
                  {passwordValidation.minLength ? "✓" : "✗"} At least 8 characters
                </li>
                <li className={passwordValidation.hasLowercase ? "text-green-600" : "text-red-500"}>
                  {passwordValidation.hasLowercase ? "✓" : "✗"} At least 1 lowercase letter
                </li>
                <li className={passwordValidation.hasUppercase ? "text-green-600" : "text-red-500"}>
                  {passwordValidation.hasUppercase ? "✓" : "✗"} At least 1 uppercase letter
                </li>
                <li className={passwordValidation.hasNumber ? "text-green-600" : "text-red-500"}>
                  {passwordValidation.hasNumber ? "✓" : "✗"} At least 1 number
                </li>
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isSignUp && !isFormValid())}
            className={`w-full py-3 rounded-lg shadow-lg transition ${
              loading || (isSignUp && !isFormValid())
                ? "bg-blue-300 cursor-not-allowed text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode(false)}
                className="text-blue-500 hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode(true)}
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
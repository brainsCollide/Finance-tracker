import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import FloatingBubbles from "../Components/FloatingBubbles";
import T from "../assets/letter-t.svg";

const validatePassword = (password) => ({
  minLength: password.length >= 8,
  hasLowercase: /[a-z]/.test(password),
  hasUppercase: /[A-Z]/.test(password),
  hasNumber: /\d/.test(password),
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [success, setSuccess] = useState(false);

  const validation = validatePassword(password);
  const isPasswordValid = Object.values(validation).every(Boolean);
  const isMatch = password === confirm;
  const canSubmit = isPasswordValid && isMatch && confirm.length > 0 && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const Logo = (
    <div className="w-full flex justify-center mb-4">
      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
        <img src={T} alt="Logo" className="w-6 h-6 invert" />
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="p-6 sm:p-10 min-h-screen flex flex-col justify-center items-center">
        <div className="w-full sm:max-w-md text-center">
          {Logo}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Password reset successful</h2>
          <p className="text-sm text-gray-600">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 min-h-screen flex flex-col justify-center items-center">
      <FloatingBubbles />
      <div className="relative z-10 w-full sm:max-w-md">
        {Logo}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {password && (
            <div className="text-sm space-y-1 bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium text-gray-700">Password Requirements:</h4>
              <ul className="space-y-1 pl-5">
                <li className={validation.minLength ? "text-green-600" : "text-red-500"}>
                  {validation.minLength ? "✓" : "✗"} At least 8 characters
                </li>
                <li className={validation.hasLowercase ? "text-green-600" : "text-red-500"}>
                  {validation.hasLowercase ? "✓" : "✗"} At least 1 lowercase letter
                </li>
                <li className={validation.hasUppercase ? "text-green-600" : "text-red-500"}>
                  {validation.hasUppercase ? "✓" : "✗"} At least 1 uppercase letter
                </li>
                <li className={validation.hasNumber ? "text-green-600" : "text-red-500"}>
                  {validation.hasNumber ? "✓" : "✗"} At least 1 number
                </li>
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                confirm && !isMatch ? "border-red-300" : ""
              }`}
              required
            />
            {confirm && !isMatch && (
              <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 rounded-lg shadow-lg transition bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save New Password"}
          </button>
        </form>

        {message.text && (
          <p className="mt-4 text-center text-sm text-red-500">
            {message.text}{" "}
            {message.text.toLowerCase().includes("token") && (
              <Link to="/forgot-password" className="underline">Request a new link</Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import FloatingBubbles from "../Components/FloatingBubbles";
import T from "../assets/letter-t.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      setMessage({ text: res.data.message, type: "success" });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 min-h-screen flex flex-col justify-center items-center">
      <FloatingBubbles />
      <div className="relative z-10 w-full sm:max-w-md">
        <div className="w-full flex justify-center mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <img src={T} alt="Logo" className="w-6 h-6 invert" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter your email and we'll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg shadow-lg transition bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message.text && (
          <p className={`mt-4 text-center text-sm ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {message.text}
          </p>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link to="/app/account" className="text-blue-500 hover:underline">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
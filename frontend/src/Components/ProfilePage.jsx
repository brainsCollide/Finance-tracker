import axiosInstance from "../api/axiosInstance";

const ProfilePage = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      onLogout(); // Switch back to authentication form
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user.username}!</h2>
        <p className="text-gray-600 mb-6">Email: {user.email}</p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-lg shadow-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

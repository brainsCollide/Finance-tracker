import axiosInstance from "../api/axiosInstance";
import { FiLogOut, FiUser, FiMail, FiShield, FiSettings } from "react-icons/fi";

const ProfilePage = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      onLogout(); 
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        
        {/* Header/Cover Section */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-end justify-center">
            <div className="translate-y-12 relative">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center border-4 border-white">
                    <div className="w-full h-full bg-slate-100 rounded-[1.25rem] flex items-center justify-center text-blue-600">
                        <FiUser size={40} />
                    </div>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" title="Online"></div>
            </div>
        </div>

        {/* User Info Section */}
        <div className="pt-16 pb-8 px-8 text-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {user.username}
          </h2>
          <p className="text-slate-500 font-medium text-sm flex items-center justify-center gap-2 mt-1">
            <FiMail size={14} className="text-slate-400" />
            {user.email}
          </p>
        </div>

        {/* Action Menu List */}
        <div className="px-6 pb-6 space-y-2">
            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <FiShield size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Account Security</span>
                </div>
                <div className="text-slate-300 group-hover:text-slate-500 font-bold">→</div>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-slate-600 group-hover:text-white transition-all">
                        <FiSettings size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Preferences</span>
                </div>
                <div className="text-slate-300 group-hover:text-slate-500 font-bold">→</div>
            </button>

            <div className="pt-4 mt-4 border-t border-slate-50">
                <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all active:scale-95 group"
                >
                <FiLogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                Logout Account
                </button>
            </div>
        </div>

        {/* Footer info */}
        <p className="text-center pb-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Member since {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
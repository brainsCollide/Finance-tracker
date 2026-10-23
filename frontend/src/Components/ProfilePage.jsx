
import {
  FiLogOut,
  FiUser,
  FiMail,
  FiShield,
  FiSettings,
  FiChevronRight,
} from "react-icons/fi";
import axiosInstance from "../api/axiosInstance";

const ProfilePage = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      await axiosInstance.post(
        "/auth/logout",
        {},
        { withCredentials: true }
      );
      onLogout();
    } catch (error) {
      console.error(
        "Logout failed:",
        error.response?.data || error.message
      );
    }
  };

  const username = user?.username || "User";
  const email = user?.email || "No email available";
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account and preferences.
          </p>
        </div>

        {/* Profile Summary */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-1.5 bg-[#0156d6]" />

          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl font-bold text-[#0156d6] ring-1 ring-blue-100">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Account profile
              </p>

              <h2 className="mt-1 break-words text-xl font-bold text-slate-900">
                {username}
              </h2>

              <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-500">
                <FiMail
                  className="shrink-0 text-slate-400"
                  size={15}
                />
                {email}
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Account active
            </div>
          </div>
        </section>

        {/* Account Information */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="font-semibold text-slate-900">
              Account information
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Your current account details.
            </p>
          </div>

          <div className="divide-y divide-slate-100 px-6">
            {/* Username */}
            <div className="flex items-center gap-4 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0156d6]">
                <FiUser size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">
                  Username
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                  {username}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0156d6]">
                <FiMail size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">
                  Email address
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="font-semibold text-slate-900">
              Account settings
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Security and application preferences.
            </p>
          </div>

          <div className="divide-y divide-slate-100 px-4 sm:px-6">
            {/* Account Security */}
            <button
              type="button"
              disabled
              title="Account security is not available yet"
              className="flex w-full cursor-not-allowed items-center gap-4 rounded-xl px-2 py-4 text-left opacity-60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0156d6]">
                <FiShield size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Account Security
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Password and sign-in options
                </p>
              </div>

              <FiChevronRight
                className="shrink-0 text-slate-400"
                size={18}
              />
            </button>

            {/* Preferences */}
            <button
              type="button"
              disabled
              title="Preferences are not available yet"
              className="flex w-full cursor-not-allowed items-center gap-4 rounded-xl px-2 py-4 text-left opacity-60"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <FiSettings size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Preferences
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Customize your experience
                </p>
              </div>

              <FiChevronRight
                className="shrink-0 text-slate-400"
                size={18}
              />
            </button>
          </div>
        </section>

        {/* Logout */}
        <section className="flex flex-col gap-4 rounded-2xl border border-rose-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Sign out
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Sign out of your account on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100 active:scale-[0.98]"
          >
            <FiLogOut size={17} />
            Logout account
          </button>
        </section>

        {/* Footer */}
        <p className="pb-2 text-center text-xs text-slate-400">
          Personal Finance Dashboard
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;

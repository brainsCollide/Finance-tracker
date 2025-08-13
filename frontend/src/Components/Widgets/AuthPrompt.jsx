import React from "react";

const AuthPrompt = ({ message, onLogin, icon: Icon }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-5 bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      {Icon && <Icon size={40} className="text-blue-500" />}
      <p className="text-gray-700 text-center font-semibold text-lg">
        {message}
      </p>
      <button
        onClick={onLogin}
        className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200"
      >
        Log In
      </button>
    </div>
  );
};

export default AuthPrompt;

import { useState } from "react";
import axiosInstance from "../api/axiosInstance"; // Import your configured axios instance

const ProfileBoard = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [isSignUp, setIsSignUp] = useState(true); // Toggle between sign-up and sign-in
  const [message, setMessage] = useState(''); // For displaying success/error messages
  const [showPopup, setShowPopup] = useState(false); // State for showing the success pop-up
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        // Sign-up logic
        const response = await axiosInstance.post('/auth/signup', form);
        setMessage(response.data.message);
      } else {
        // Sign-in logic
        const response = await axiosInstance.post('/auth/signin', {
          email: form.email,
          password: form.password
        });
        setMessage(response.data.message);
        setShowPopup(true); // Show success pop-up on successful sign-in

        // Hide the pop-up after 3 seconds
        setTimeout(() => {
          setShowPopup(false);
        }, 3000);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message); // Display the specific error message
      } else {
        setMessage('Authentication failed. Please try again.'); // Generic error message
      }
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-xl font-bold mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleInputChange}
              className="border p-2 w-full"
              required
            />
          </div>
        )}
        
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="relative">
          <label className="block mb-1">Password</label>
          <input
            type={showPassword ? "text" : "password"} // Toggle password visibility
            name="password"
            value={form.password}
            onChange={handleInputChange}
            className="border p-2 w-full pr-16" // Add padding on the right for the button
            required
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
            className="absolute top-3 right-0 flex items-center h-full pr-3" // Adjust height for better vertical alignment
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <p className="mt-4 text-sm text-red-500">{message}</p>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-4 text-blue-500"
      >
        {isSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
      </button>

      {/* Success Pop-up Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded shadow-lg text-center">
            <h3 className="text-2xl font-bold mb-4">Sign In Success!</h3>
            <p className="text-gray-700">You have successfully signed in.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileBoard;

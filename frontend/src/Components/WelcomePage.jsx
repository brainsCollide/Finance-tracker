import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import illustration from '../assets/illustration.svg';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/app');
  };

  // Define motion variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: { yoyo: Infinity, duration: 0.3 }, // yoyo for repeated animation
    },
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-8 p-10 bg-white shadow-lg rounded-lg max-w-4xl border border-gray-200"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-gray-900">
            Welcome to Our Dashboard
          </h1>
          <p className="text-gray-700 mt-6 text-lg leading-relaxed">
            Manage your transactions effortlessly. Click below to log in and get started!
          </p>
          <motion.button
            onClick={handleLoginRedirect}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg"
            variants={buttonVariants}
            whileHover="hover"
          >
            Log In
          </motion.button>
        </div>
        <div className="flex justify-center">
          <motion.img
            src={illustration}
            alt="Illustration"
            className="w-80 h-80 object-contain"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 50, delay: 0.2 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;

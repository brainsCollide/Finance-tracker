import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import illustration from '../assets/illustration.svg';
import { FiArrowRight, FiShield, FiZap, FiPieChart } from 'react-icons/fi';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/app/account');
  };

  // Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.2 } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />

      <motion.div
        className="relative z-10 w-full max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Side: Content */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <FiZap className="animate-pulse" /> Smart Finance Manager
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight"
          >
            Take Control of Your <span className="text-blue-600">Wealth.</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-slate-500 mt-8 text-lg md:text-xl leading-relaxed max-w-xl font-medium"
          >
            Pelacak keuangan cerdas untuk membantu Anda mengelola transaksi, budget, dan impian masa depan dalam satu dashboard premium.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={handleLoginRedirect}
              className="group flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl shadow-2xl shadow-slate-900/20 transition-all active:scale-95 text-lg"
            >
              Get Started 
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center gap-4 px-6 py-4">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                  ))}
               </div>
               <p className="text-sm font-bold text-slate-400">Join 10k+ users</p>
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-slate-200 w-full"
          >
            <div className="flex flex-col items-center lg:items-start gap-2">
              <FiShield className="text-blue-600" size={24} />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secure Data</span>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-2">
              <FiPieChart className="text-emerald-500" size={24} />
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Real-time Analytics</span>
            </div>
            <div className="flex flex-col items-center lg:items-start gap-2">
               <FiZap className="text-amber-500" size={24} />
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Auto Sync</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Illustration & Cards Mockup */}
        <div className="hidden lg:flex justify-center relative">
          {/* Floating Card Mockup 1 */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute -top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-4 animate-bounce-slow"
          >
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <FiZap />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Savings</p>
              <p className="text-sm font-black text-slate-900">+Rp 2.500.000</p>
            </div>
          </motion.div>

          <motion.img
            src={illustration}
            alt="Dashboard Preview"
            className="w-full max-w-lg object-contain relative z-10"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 40, delay: 0.4 }}
          />

          {/* Decorative Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-slate-200 rounded-full -z-0 opacity-50" />
        </div>
      </motion.div>
    </div>
  );
};

// Add this to your Tailwind config or global CSS
// .animate-bounce-slow { animation: bounce-slow 4s infinite ease-in-out; }
// @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

export default WelcomePage;
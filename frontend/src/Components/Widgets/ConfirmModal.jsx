import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150]"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white rounded-[2rem] shadow-2xl z-[160] overflow-hidden border border-slate-100 p-8 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                <FiAlertTriangle size={32} />
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Menghapus..." : "Ya, Hapus Sekarang"}
              </button>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold rounded-2xl transition-all"
              >
                Batal
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
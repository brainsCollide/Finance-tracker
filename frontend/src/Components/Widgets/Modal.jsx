import { useState, useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, subtitle, children }) => {
  const [showModal, setShowModal] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      document.body.classList.add("overflow-hidden");

      setTimeout(() => {
        setVisible(true);
      }, 20);
    } else {
      setVisible(false);

      const timeout = setTimeout(() => {
        setShowModal(false);
        document.body.classList.remove("overflow-hidden");
      }, 250);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!showModal) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] flex items-center justify-center px-4 transition-all duration-300 ${
        visible ? "bg-black/40 backdrop-blur-md" : "bg-black/0 backdrop-blur-0"
      }`}
      onClick={onClose}
    >
      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl transition-all duration-300 ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-6 scale-95 opacity-0"
        }`}
      >
        {/* TOP GRADIENT */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />

        {/* HEADER */}
        <div className="relative flex items-start justify-between px-8 pt-8 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-sm text-slate-500 max-w-sm leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="group flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-900 transition-all duration-200"
          >
            <X
              size={18}
              className="text-slate-500 group-hover:text-white transition-colors"
            />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-6 max-h-[75vh] overflow-y-auto">
          {children}
        </div>

        {/* BOTTOM GLOW */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-blue-500/10 blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};

export default Modal;
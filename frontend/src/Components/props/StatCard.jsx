import React from "react";

/**
 * StatCard Component
 * @param {string} title - The label of the card (e.g., "Total Income")
 * @param {React.ElementType} icon - The Lucide or FontAwesome icon component
 * @param {string|number} value - The main statistic to display
 * @param {string} accentColor - One of: 'blue', 'emerald', 'rose', 'amber', 'slate'
 * @param {string} trend - Optional text for the top-right badge (e.g., "+12%")
 */
const StatCard = ({ title, icon: Icon, value, accentColor = "blue", trend }) => {
  
  // Define color configurations for a clean, modern look
  const colorStyles = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      badge: "bg-blue-100 text-blue-700",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      badge: "bg-rose-100 text-rose-700",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      badge: "bg-amber-100 text-amber-700",
    },
    slate: {
      bg: "bg-slate-50",
      text: "text-slate-600",
      badge: "bg-slate-100 text-slate-700",
    },
  };

  const style = colorStyles[accentColor] || colorStyles.blue;

  return (
    <div className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        {/* Soft-styled Icon Container */}
        <div className={`p-3 rounded-xl ${style.bg} ${style.text} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
          {Icon && <Icon size={24} strokeWidth={2.5} />}
        </div>

        {/* Optional Trend Badge */}
        {trend && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge}`}>
            {trend}
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <h4 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h4>
      </div>
    </div>
  );
};

export default StatCard;
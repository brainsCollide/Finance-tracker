import { CATEGORY_ICON_KEYS, getCategoryIcon } from "../../utils/categoryIcons";

const IconPicker = ({ value, onChange, color = "#3B82F6" }) => (
  <div className="grid grid-cols-8 gap-1.5">
    {CATEGORY_ICON_KEYS.map((key) => {
      const Icon = getCategoryIcon(key);
      const active = value === key;

      return (
        <button
          key={key}
          type="button"
          title={key}
          onClick={() => onChange(key)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
            active
              ? "border-transparent text-white"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          }`}
          style={active ? { backgroundColor: color } : undefined}
        >
          <Icon size={16} />
        </button>
      );
    })}
  </div>
);

export default IconPicker;
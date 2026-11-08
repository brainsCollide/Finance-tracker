import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useCategoryStore } from "../../stores/category.store";
import IconPicker from "./IconPicker";

const NEW_VALUE = "__new__";

const CategorySelect = ({
  value,
  onChange, // menerima key kategori (string), bukan event
  type = null, // "income" | "expense" | null (null = tampilkan semua)
  placeholder = "",
  leftIcon: LeftIcon = null,
  selectClassName = "",
  allowCreate = true,
}) => {
  const categories = useCategoryStore((s) => s.categories);
  const createCategory = useCategoryStore((s) => s.createCategory);

  const [isCreating, setIsCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("tag");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const options = useMemo(
    () =>
      categories.filter(
        (c) => !type || c.type === "both" || c.type === type
      ),
    [categories, type]
  );

  const cancelCreate = () => {
    setIsCreating(false);
    setLabel("");
    setIcon("tag");
    setError("");
  };

  const handleSelect = (e) => {
    if (e.target.value === NEW_VALUE) {
      setIsCreating(true);
      return;
    }
    onChange(e.target.value);
  };

  const handleCreate = async () => {
    const trimmed = label.trim();

    if (!trimmed) {
      setError("Nama kategori wajib diisi");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const created = await createCategory({
        label: trimmed,
        icon,
        type: type || "expense",
      });

      onChange(created.key);
      cancelCreate();
      toast.success(`Kategori "${created.label}" ditambahkan`);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menambah kategori");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative group">
        {LeftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
            <LeftIcon size={18} />
          </div>
        )}

        <select
          value={value}
          onChange={handleSelect}
          className={selectClassName}
        >
          {placeholder && <option value="">{placeholder}</option>}

          {options.map((c) => (
            <option key={c._id} value={c.key}>
              {c.label}
            </option>
          ))}

          {allowCreate && (
            <option value={NEW_VALUE}>+ Tambah kategori baru...</option>
          )}
        </select>
      </div>

      {isCreating && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
          <input
            autoFocus
            type="text"
            value={label}
            maxLength={24}
            placeholder="Nama kategori, mis. Skincare"
            onChange={(e) => {
              setLabel(e.target.value);
              setError("");
            }}
            // Enter tidak boleh men-submit form induk (mis. form budget).
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
              if (e.key === "Escape") cancelCreate();
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />

          <IconPicker value={icon} onChange={setIcon} />

          {error && (
            <p className="text-[11px] font-medium text-rose-500">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelCreate}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="rounded-xl bg-blue-500 px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelect;
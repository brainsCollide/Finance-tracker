import { useState } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEdit3, FiTrash2 } from "react-icons/fi";
import { useCategoryStore } from "../stores/category.store";
import { getCategoryIcon } from "../utils/categoryIcons";
import Modal from "./Widgets/Modal";
import ConfirmModal from "./Widgets/ConfirmModal";
import IconPicker from "./Widgets/IconPicker";

const TYPE_LABELS = { income: "Income", expense: "Expense", both: "Income & Expense" };
const EMPTY_FORM = { label: "", type: "expense", icon: "tag", color: "#3B82F6" };

const buildDeleteMessage = ({ category, usage }) => {
  const parts = [];

  if (usage.transactions > 0) {
    parts.push(`${usage.transactions} transaksi akan dipindahkan ke "Other"`);
  }
  if (usage.budgets > 0) {
    parts.push(`${usage.budgets} budget kategori ini akan ikut dihapus`);
  }

  return parts.length
    ? `Menghapus "${category.label}": ${parts.join(" dan ")}. Tindakan ini tidak bisa dibatalkan.`
    : `Hapus kategori "${category.label}"? Belum ada transaksi atau budget yang memakainya.`;
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60";

const CategoryManager = () => {
  const categories = useCategoryStore((s) => s.categories);
  const createCategory = useCategoryStore((s) => s.createCategory);
  const updateCategory = useCategoryStore((s) => s.updateCategory);
  const getCategoryUsage = useCategoryStore((s) => s.getCategoryUsage);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  // Form tambah/edit
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Konfirmasi hapus. pendingDelete dipertahankan saat modal menutup
  // supaya teksnya tidak hilang di tengah animasi keluar.
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      label: category.label,
      type: category.type,
      icon: category.icon,
      color: category.color,
    });
    setFormError("");
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const label = form.label.trim();

    if (!label) {
      setFormError("Nama kategori wajib diisi");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editing) {
        const payload = { label, icon: form.icon, color: form.color };

        // Kirim type hanya kalau berubah (kategori sistem tidak boleh diubah).
        if (!editing.isSystem && form.type !== editing.type) {
          payload.type = form.type;
        }

        await updateCategory(editing._id, payload);
        toast.success("Kategori diperbarui");
      } else {
        await createCategory({ ...form, label });
        toast.success("Kategori ditambahkan");
      }

      setFormOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Gagal menyimpan kategori");
    } finally {
      setSaving(false);
    }
  };

  const askDelete = async (category) => {
    try {
      const usage = await getCategoryUsage(category._id);
      setPendingDelete({ category, usage });
      setConfirmOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memuat data kategori");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);

    try {
      const result = await deleteCategory(pendingDelete.category._id);

      toast.success(
        result.movedTransactions > 0
          ? `Kategori dihapus, ${result.movedTransactions} transaksi dipindah ke Other`
          : "Kategori dihapus"
      );

      setConfirmOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus kategori");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="font-semibold text-slate-900">Categories</h3>
            <p className="mt-1 text-sm text-slate-500">
              Atur kategori untuk transaksi dan budget.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 active:scale-[0.98]"
          >
            <FiPlus size={16} />
            Tambah
          </button>
        </div>

        <ul className="divide-y divide-slate-100 px-4 sm:px-6">
          {categories.map((c) => {
            const Icon = getCategoryIcon(c.icon);

            return (
              <li key={c._id} className="flex items-center gap-3 py-3.5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${c.color}1A`, color: c.color }}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {c.label}
                  </p>
                  <p className="text-xs text-slate-500">{TYPE_LABELS[c.type]}</p>
                </div>

                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  title="Edit"
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <FiEdit3 size={16} />
                </button>

                {!c.isSystem && (
                  <button
                    type="button"
                    onClick={() => askDelete(c)}
                    title="Hapus"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* TAMBAH / EDIT */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Kategori" : "Kategori Baru"}
        subtitle="Nama bisa diubah kapan saja, transaksi lama tetap terhubung."
      >
        <form onSubmit={handleSave} className="space-y-5">
          {formError && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-600">
              {formError}
            </div>
          )}

          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Nama
            </label>
            <input
              type="text"
              value={form.label}
              maxLength={24}
              placeholder="Mis. Skincare"
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Tipe
            </label>
            <select
              value={form.type}
              disabled={editing?.isSystem}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className={inputClass}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="both">Income & Expense</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Ikon
            </label>
            <IconPicker
              value={form.icon}
              color={form.color}
              onChange={(icon) => setForm((p) => ({ ...p, icon }))}
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Warna
            </label>
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
              className="h-11 w-20 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={saving}
              className="rounded-2xl px-5 py-3 font-bold text-slate-600 transition-all hover:bg-slate-100 active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-w-[120px] rounded-2xl bg-blue-500 px-6 py-3 font-bold text-white shadow-lg shadow-blue-200/50 transition-all hover:bg-blue-600 active:scale-95 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* KONFIRMASI HAPUS */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Hapus kategori?"
        message={pendingDelete ? buildDeleteMessage(pendingDelete) : ""}
      />
    </>
  );
};

export default CategoryManager;
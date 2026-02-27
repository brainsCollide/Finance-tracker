
import { useState } from 'react';
import axiosInstance from "../../api/axiosInstance" // sesuaikan path kalau beda

const AddBudgetModal = ({ isOpen, onClose, onBudgetAdded }) => {
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.category || !formData.limit) {
      setFormError('Kategori dan limit wajib diisi');
      return;
    }

    if (Number(formData.limit) <= 0) {
      setFormError('Limit harus lebih dari 0');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axiosInstance.post('/budgets', formData);
      // Kirim data baru ke parent untuk update list
      onBudgetAdded(res.data);
      // Reset & tutup
      setFormData({ category: '', limit: '', period: 'monthly' });
      onClose();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menambah budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-6">Tambah Budget Baru</h3>

        {formError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              required
            >
              <option value="">Pilih kategori</option>
              <option value="work">Work</option>
              <option value="grocery">Grocery</option>
              <option value="entertainment">Entertainment</option>
              <option value="transport">Transport</option>
              <option value="health">Health</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
              {/* Tambah sesuai enum di schema Transaction */}
            </select>
          </div>

          {/* Limit */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limit (Rp) *
            </label>
            <input
              type="number"
              name="limit"
              value={formData.limit}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              min="1"
              required
              placeholder="Contoh: 1500000"
            />
          </div>

          {/* Period */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periode
            </label>
            <select
              name="period"
              value={formData.period}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetModal;
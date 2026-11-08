const mongoose = require('mongoose');

const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Identitas permanen. Disimpan di Transaction.category dan Budget.category.
    // Tidak pernah berubah, supaya rename cukup mengubah label.
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 40,
    },

    label: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 24,
    },

    type: {
      type: String,
      enum: ['income', 'expense', 'both'],
      default: 'expense',
    },

    // Nama ikon dari daftar tetap (lihat ICONS di utils/categories.js).
    icon: { type: String, default: 'tag', maxlength: 20 },

    color: { type: String, default: '#64748B', match: COLOR_REGEX },

    // Kategori sistem ("other") tidak bisa dihapus karena jadi tujuan
    // pemindahan transaksi saat kategori lain dihapus.
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
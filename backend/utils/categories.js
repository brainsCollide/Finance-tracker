const crypto = require('crypto');
const Category = require('../models/Category');
const User = require('../models/User');

const ICONS = [
  'wallet', 'cart', 'film', 'truck', 'heart', 'book', 'tag', 'coffee',
  'home', 'gift', 'phone', 'zap', 'briefcase', 'scissors', 'music', 'smile',
];

const PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F43F5E', '#64748B',
];

const MAX_CATEGORIES_PER_USER = 50;

// Key sama dengan nilai enum lama, jadi data transaksi dan budget
// yang sudah ada langsung cocok tanpa migrasi.
const DEFAULT_CATEGORIES = [
  { key: 'work', label: 'Work', type: 'income', icon: 'wallet', color: '#10B981' },
  { key: 'grocery', label: 'Grocery', type: 'expense', icon: 'cart', color: '#F59E0B' },
  { key: 'entertainment', label: 'Entertainment', type: 'expense', icon: 'film', color: '#8B5CF6' },
  { key: 'transport', label: 'Transport', type: 'expense', icon: 'truck', color: '#3B82F6' },
  { key: 'health', label: 'Health', type: 'expense', icon: 'heart', color: '#F43F5E' },
  { key: 'education', label: 'Education', type: 'expense', icon: 'book', color: '#14B8A6' },
  { key: 'other', label: 'Other', type: 'both', icon: 'tag', color: '#64748B', isSystem: true },
];

const FALLBACK_KEY = 'other';

// "Perawatan Diri & Skincare" -> "perawatan-diri-skincare"
const slugify = (label) => {
  const base = String(label)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30)
    .replace(/-+$/, '');

  // Label tanpa huruf/angka latin (emoji, aksara lain) tetap dapat key unik.
  return base || `cat-${crypto.randomBytes(3).toString('hex')}`;
};

const isDuplicateKeyError = (err) =>
  err?.code === 11000 ||
  (Array.isArray(err?.writeErrors) &&
    err.writeErrors.length > 0 &&
    err.writeErrors.every((e) => e.code === 11000));

// Seed default sekali per user. Flag categoriesSeeded mencegah default yang
// sudah sengaja dihapus user muncul lagi. Aman dipanggil berulang/paralel:
// unique index (userId, key) menolak duplikat.
const ensureDefaultCategories = async (userId) => {
  const user = await User.findById(userId).select('categoriesSeeded').lean();

  if (!user || user.categoriesSeeded) return;

  try {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
      { ordered: false }
    );
  } catch (err) {
    if (!isDuplicateKeyError(err)) throw err;
  }

  await User.updateOne({ _id: userId }, { categoriesSeeded: true });
};

const resolveCategory = async (userId, key) => {
  if (typeof key !== 'string') return null;

  await ensureDefaultCategories(userId);

  return Category.findOne({
    userId,
    key: key.trim().toLowerCase(),
  }).lean();
};

const isTypeCompatible = (category, type) =>
  category.type === 'both' || category.type === type;

module.exports = {
  ICONS,
  PALETTE,
  MAX_CATEGORIES_PER_USER,
  DEFAULT_CATEGORIES,
  FALLBACK_KEY,
  slugify,
  isDuplicateKeyError,
  ensureDefaultCategories,
  resolveCategory,
  isTypeCompatible,
};
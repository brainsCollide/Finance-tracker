const mongoose = require('mongoose');
const Joi = require('joi');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const {
  ICONS,
  PALETTE,
  MAX_CATEGORIES_PER_USER,
  FALLBACK_KEY,
  slugify,
  isDuplicateKeyError,
  ensureDefaultCategories,
} = require('../utils/categories');

const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const createSchema = Joi.object({
  label: Joi.string().trim().min(1).max(24).required(),
  type: Joi.string().valid('income', 'expense', 'both').default('expense'),
  icon: Joi.string().valid(...ICONS).default('tag'),
  color: Joi.string().pattern(COLOR_PATTERN),
}).unknown(false);

const updateSchema = Joi.object({
  label: Joi.string().trim().min(1).max(24),
  type: Joi.string().valid('income', 'expense', 'both'),
  icon: Joi.string().valid(...ICONS),
  color: Joi.string().pattern(COLOR_PATTERN),
})
  .min(1)
  .unknown(false);

const getUserId = (req) => {
  const id = req.user?.userId;
  return id && mongoose.Types.ObjectId.isValid(String(id)) ? String(id) : null;
};

const validationError = (res, error) =>
  res.status(400).json({ message: error.details[0].message });

const serverError = (res, context, error) => {
  console.error(`[${context}]`, error.name || 'Error', error.message);
  return res.status(500).json({ message: 'Internal server error' });
};

// Label dianggap kembar kalau slug-nya sama dengan key atau slug label
// kategori lain milik user (mis. "Cafe" vs "Café", "A&B" vs "A B").
const findNameConflict = (categories, label, excludeId) => {
  const slug = slugify(label);

  return categories.find(
    (c) =>
      (!excludeId || String(c._id) !== String(excludeId)) &&
      (c.key === slug || slugify(c.label) === slug)
  );
};

// GET /categories
const getCategories = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    await ensureDefaultCategories(userId);

    // "other" (isSystem) selalu di urutan terakhir.
    const categories = await Category.find({ userId })
      .sort({ isSystem: 1, _id: 1 })
      .lean();

    return res.json(categories);
  } catch (error) {
    return serverError(res, 'GET_CATEGORIES', error);
  }
};

// POST /categories
const createCategory = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { error, value } = createSchema.validate(req.body, { abortEarly: true });
  if (error) return validationError(res, error);

  try {
    await ensureDefaultCategories(userId);

    const existing = await Category.find({ userId }).lean();

    if (existing.length >= MAX_CATEGORIES_PER_USER) {
      return res.status(400).json({
        message: `Maksimal ${MAX_CATEGORIES_PER_USER} kategori`,
      });
    }

    if (findNameConflict(existing, value.label)) {
      return res.status(409).json({ message: 'Kategori dengan nama ini sudah ada' });
    }

    const category = await Category.create({
      userId,
      key: slugify(value.label),
      label: value.label,
      type: value.type,
      icon: value.icon,
      color: value.color || PALETTE[existing.length % PALETTE.length],
    });

    return res.status(201).json(category.toObject());
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return res.status(409).json({ message: 'Kategori dengan nama ini sudah ada' });
    }
    return serverError(res, 'CREATE_CATEGORY', error);
  }
};

// PUT /categories/:id
const updateCategory = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID kategori tidak valid' });
  }

  const { error, value } = updateSchema.validate(req.body, { abortEarly: true });
  if (error) return validationError(res, error);

  try {
    const category = await Category.findOne({ _id: req.params.id, userId });

    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    if (category.isSystem && value.type !== undefined && value.type !== category.type) {
      return res.status(400).json({
        message: 'Tipe kategori bawaan ini tidak bisa diubah',
      });
    }

    if (value.label !== undefined && value.label !== category.label) {
      const all = await Category.find({ userId }).lean();

      if (findNameConflict(all, value.label, category._id)) {
        return res.status(409).json({ message: 'Kategori dengan nama ini sudah ada' });
      }
    }

    // Menyempit dari "both"/lawan tipe tidak boleh meninggalkan transaksi
    // atau budget yang jadi tidak cocok.
    if (value.type !== undefined && value.type !== category.type && value.type !== 'both') {
      const conflictingType = value.type === 'income' ? 'expense' : 'income';

      const [badTransactions, badBudgets] = await Promise.all([
        Transaction.countDocuments({
          userId,
          category: category.key,
          type: conflictingType,
        }),
        value.type === 'income'
          ? Budget.countDocuments({ userId, category: category.key })
          : Promise.resolve(0),
      ]);

      if (badTransactions > 0 || badBudgets > 0) {
        return res.status(409).json({
          message:
            'Tipe tidak bisa diubah karena masih ada transaksi atau budget yang memakai kategori ini dengan tipe berbeda',
        });
      }
    }

    Object.assign(category, value);
    await category.save();

    return res.json(category.toObject());
  } catch (error) {
    return serverError(res, 'UPDATE_CATEGORY', error);
  }
};

// GET /categories/:id/usage  -> dipakai untuk isi modal konfirmasi hapus
const getCategoryUsage = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID kategori tidak valid' });
  }

  try {
    const category = await Category.findOne({ _id: req.params.id, userId }).lean();

    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    const [transactions, budgets] = await Promise.all([
      Transaction.countDocuments({ userId, category: category.key }),
      Budget.countDocuments({ userId, category: category.key }),
    ]);

    return res.json({ transactions, budgets });
  } catch (error) {
    return serverError(res, 'GET_CATEGORY_USAGE', error);
  }
};

// DELETE /categories/:id
// Opsi A: transaksi dipindah ke "other", budget kategori ini ikut dihapus.
const deleteCategory = async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'ID kategori tidak valid' });
  }

  try {
    const category = await Category.findOne({ _id: req.params.id, userId }).lean();

    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    if (category.isSystem) {
      return res.status(400).json({ message: 'Kategori bawaan ini tidak bisa dihapus' });
    }

    const fallback = await Category.findOne({ userId, key: FALLBACK_KEY }).lean();

    if (!fallback) {
      return res.status(500).json({ message: 'Kategori "other" tidak ditemukan' });
    }

    // Urutan ini aman kalau gagal di tengah: kategori masih ada dan
    // request bisa diulang tanpa duplikasi.
    const moved = await Transaction.updateMany(
      { userId, category: category.key },
      { $set: { category: FALLBACK_KEY } }
    );

    const removedBudgets = await Budget.deleteMany({
      userId,
      category: category.key,
    });

    await Category.deleteOne({ _id: category._id, userId });

    return res.json({
      message: 'Kategori dihapus',
      movedTransactions: moved.modifiedCount ?? 0,
      deletedBudgets: removedBudgets.deletedCount ?? 0,
    });
  } catch (error) {
    return serverError(res, 'DELETE_CATEGORY', error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  getCategoryUsage,
  deleteCategory,
};
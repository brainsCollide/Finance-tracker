const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

const VALID_PERIODS = ['weekly', 'monthly', 'yearly'];

const VALID_CATEGORIES = [
  'work',
  'grocery',
  'entertainment',
  'transport',
  'health',
  'education',
  'other',
];

// Rentang periode kalender berdasarkan waktu server.
// Minggu dimulai hari Minggu.
const getDateRange = (period = 'monthly') => {
  const now = new Date();
  let startDate;

  if (period === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay());
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'yearly') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return {
    startDate,
    endDate: now,
  };
};

const getAuthenticatedUserId = (req) => {
  const userId = req.user?.userId;

  if (
    !userId ||
    !mongoose.Types.ObjectId.isValid(String(userId))
  ) {
    return null;
  }

  return new mongoose.Types.ObjectId(String(userId));
};

const isValidCategory = (category) =>
  typeof category === 'string' &&
  VALID_CATEGORIES.includes(category.trim().toLowerCase());

const normalizeCategory = (category) =>
  category.trim().toLowerCase();

const parsePositiveLimit = (value) => {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const getSpentByCategory = async (userId, period) => {
  const { startDate, endDate } = getDateRange(period);

  const results = await Transaction.aggregate([
    {
      $match: {
        userId,
        type: 'expense',
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: '$category',
        totalSpent: { $sum: '$amount' },
      },
    },
  ]);

  return new Map(
    results.map((item) => [
      normalizeCategory(String(item._id)),
      Number(item.totalSpent) || 0,
    ])
  );
};

const enrichBudget = (budget, spent) => {
  const limit = Number(budget.limit) || 0;

  return {
    ...budget,
    spent,
    percentage: limit > 0 ? (spent / limit) * 100 : 0,
  };
};

// GET: semua budget milik user beserta pengeluaran periode berjalan
const getBudgets = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: 'Autentikasi diperlukan',
    });
  }

  try {
    const budgets = await Budget.find({ userId }).lean();

    const periods = [...new Set(
      budgets.map((budget) =>
        VALID_PERIODS.includes(budget.period)
          ? budget.period
          : 'monthly'
      )
    )];

    const spentByPeriod = await Promise.all(
      periods.map(async (period) => ({
        period,
        totals: await getSpentByCategory(userId, period),
      }))
    );

    const totalsByPeriod = new Map(
      spentByPeriod.map(({ period, totals }) => [
        period,
        totals,
      ])
    );

    const enrichedBudgets = budgets.map((budget) => {
      const period = VALID_PERIODS.includes(budget.period)
        ? budget.period
        : 'monthly';

      const category = normalizeCategory(budget.category);
      const spent =
        totalsByPeriod.get(period)?.get(category) || 0;

      return enrichBudget(budget, spent);
    });

    return res.status(200).json(enrichedBudgets);
  } catch (error) {
    console.error('Error getBudgets:', error.message);

    return res.status(500).json({
      message: 'Gagal mengambil data budget',
    });
  }
};

// GET: satu budget berdasarkan ID dan pemiliknya
const getBudgetById = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: 'Autentikasi diperlukan',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      message: 'ID budget tidak valid',
    });
  }

  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId,
    }).lean();

    if (!budget) {
      return res.status(404).json({
        message: 'Budget tidak ditemukan',
      });
    }

    const period = VALID_PERIODS.includes(budget.period)
      ? budget.period
      : 'monthly';

    const totals = await getSpentByCategory(userId, period);
    const spent =
      totals.get(normalizeCategory(budget.category)) || 0;

    return res.status(200).json(enrichBudget(budget, spent));
  } catch (error) {
    console.error('Error getBudgetById:', error.message);

    return res.status(500).json({
      message: 'Gagal mengambil budget',
    });
  }
};

// POST: membuat budget
const createBudget = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: 'Autentikasi diperlukan',
    });
  }

  try {
    const {
      category,
      limit,
      period = 'monthly',
    } = req.body;

    if (!isValidCategory(category)) {
      return res.status(400).json({
        message: `Kategori harus salah satu dari: ${VALID_CATEGORIES.join(', ')}`,
      });
    }

    const numericLimit = parsePositiveLimit(limit);

    if (numericLimit === null) {
      return res.status(400).json({
        message: 'Limit harus berupa angka positif',
      });
    }

    if (!VALID_PERIODS.includes(period)) {
      return res.status(400).json({
        message: 'Periode harus weekly, monthly, atau yearly',
      });
    }

    const normalizedCategory = normalizeCategory(category);

    const existing = await Budget.findOne({
      userId,
      category: normalizedCategory,
      period,
    });

    if (existing) {
      return res.status(409).json({
        message: 'Budget untuk kategori dan periode ini sudah ada',
      });
    }

    const budget = await Budget.create({
      userId,
      category: normalizedCategory,
      limit: numericLimit,
      period,
    });

    return res.status(201).json(
      enrichBudget(budget.toObject(), 0)
    );
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Budget untuk kategori dan periode ini sudah ada',
      });
    }

    console.error('Error createBudget:', error.message);

    return res.status(500).json({
      message: 'Gagal membuat budget',
    });
  }
};

// PUT: update field yang diperbolehkan
const updateBudget = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: 'Autentikasi diperlukan',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      message: 'ID budget tidak valid',
    });
  }

  try {
    const { category, limit, period } = req.body;
    const updates = {};

    if (category !== undefined) {
      if (!isValidCategory(category)) {
        return res.status(400).json({
          message: `Kategori harus salah satu dari: ${VALID_CATEGORIES.join(', ')}`,
        });
      }

      updates.category = normalizeCategory(category);
    }

    if (limit !== undefined) {
      const numericLimit = parsePositiveLimit(limit);

      if (numericLimit === null) {
        return res.status(400).json({
          message: 'Limit harus berupa angka positif',
        });
      }

      updates.limit = numericLimit;
    }

    if (period !== undefined) {
      if (!VALID_PERIODS.includes(period)) {
        return res.status(400).json({
          message: 'Periode harus weekly, monthly, atau yearly',
        });
      }

      updates.period = period;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'Tidak ada field budget untuk diperbarui',
      });
    }

    const currentBudget = await Budget.findOne({
      _id: req.params.id,
      userId,
    });

    if (!currentBudget) {
      return res.status(404).json({
        message: 'Budget tidak ditemukan',
      });
    }

    const nextCategory =
      updates.category ?? normalizeCategory(currentBudget.category);

    const nextPeriod =
      updates.period ?? currentBudget.period;

    const duplicate = await Budget.findOne({
      _id: { $ne: currentBudget._id },
      userId,
      category: nextCategory,
      period: nextPeriod,
    });

    if (duplicate) {
      return res.status(409).json({
        message: 'Budget untuk kategori dan periode ini sudah ada',
      });
    }

    Object.assign(currentBudget, updates);
    currentBudget.updatedAt = new Date();

    await currentBudget.save();

    const totals = await getSpentByCategory(
      userId,
      currentBudget.period
    );

    const spent =
      totals.get(normalizeCategory(currentBudget.category)) || 0;

    return res.status(200).json(
      enrichBudget(currentBudget.toObject(), spent)
    );
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Budget untuk kategori dan periode ini sudah ada',
      });
    }

    console.error('Error updateBudget:', error.message);

    return res.status(500).json({
      message: 'Gagal memperbarui budget',
    });
  }
};

// DELETE: hanya budget milik user yang dapat dihapus
const deleteBudget = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    return res.status(401).json({
      message: 'Autentikasi diperlukan',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      message: 'ID budget tidak valid',
    });
  }

  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!budget) {
      return res.status(404).json({
        message: 'Budget tidak ditemukan',
      });
    }

    return res.status(200).json({
      message: 'Budget berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleteBudget:', error.message);

    return res.status(500).json({
      message: 'Gagal menghapus budget',
    });
  }
};

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
};
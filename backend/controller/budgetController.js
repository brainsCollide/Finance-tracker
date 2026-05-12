const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Helper: dapatkan rentang tanggal berdasarkan period (monthly default)
const getDateRange = (period = 'monthly') => {
  const now = new Date();
  let startDate;

  if (period === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - now.getDay()); // awal minggu
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'yearly') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    // monthly
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate: now };
};

// 1. GET semua budget user + spent real
const getBudgets = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Autentikasi diperlukan (user tidak ditemukan)' });
  }

  try {
    const budgets = await Budget.find({ userId: req.user.userId });

    const enrichedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const { startDate } = getDateRange(budget.period);

        const spentResult = await Transaction.aggregate([
          {
            $match: {
              userId: req.user.userId, // ← konsisten dengan schema Transaction
              category: budget.category,
              type: 'expense',
              date: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: null,
              totalSpent: { $sum: '$amount' },
            },
          },
        ]);

        const spent = spentResult.length > 0 ? spentResult[0].totalSpent : 0;

        return {
          ...budget.toObject(),
          spent,
          percentage: budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0,
        };
      })
    );

    res.status(200).json(enrichedBudgets);
  } catch (error) {
    console.error('Error getBudgets:', error);
    res.status(500).json({ message: 'Gagal mengambil data budget', error: error.message });
  }
};

// 2. GET satu budget by ID
const getBudgetById = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Autentikasi diperlukan' });
  }

  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user.userId });

    if (!budget) {
      return res.status(404).json({ message: 'Budget tidak ditemukan atau bukan milik Anda' });
    }

    res.status(200).json(budget);
  } catch (error) {
    console.error('Error getBudgetById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. POST - Buat budget baru
const createBudget = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Autentikasi diperlukan (user tidak ditemukan)' });
  }

  try {
    const { category, limit, period } = req.body;

    if (!category || !limit) {
      return res.status(400).json({ message: 'Category dan limit wajib diisi' });
    }

    // Cek duplikat
    const existing = await Budget.findOne({
      userId: req.user.userId,
      category,
      period: period || 'monthly',
    });

    if (existing) {
      return res.status(400).json({ message: 'Budget untuk kategori ini sudah ada di periode yang sama' });
    }

    const budget = new Budget({
      userId: req.user.userId,
      category,
      limit,
      period: period || 'monthly',
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error createBudget:', error);
    res.status(400).json({ message: 'Gagal membuat budget', error: error.message });
  }
};

// 4. PUT - Update budget
const updateBudget = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Autentikasi diperlukan' });
  }

  try {
    const { category, limit, period } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { category, limit, period, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget tidak ditemukan atau bukan milik Anda' });
    }

    res.status(200).json(budget);
  } catch (error) {
    console.error('Error updateBudget:', error);
    res.status(400).json({ message: 'Gagal update budget', error: error.message });
  }
};

// 5. DELETE budget
const deleteBudget = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Autentikasi diperlukan' });
  }

  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget tidak ditemukan atau bukan milik Anda' });
    }

    res.status(200).json({ message: 'Budget berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteBudget:', error);
    res.status(500).json({ message: 'Gagal menghapus budget', error: error.message });
  }
};

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
};
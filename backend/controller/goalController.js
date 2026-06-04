const Goal = require("../models/Goal");


// GET ALL GOALS
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });

    const enrichedGoals = goals.map((goal) => {
      const percentage =
        goal.targetAmount > 0
          ? Math.min(
              (goal.currentAmount / goal.targetAmount) * 100,
              100
            )
          : 0;

      return {
        ...goal.toObject(),
        percentage,
      };
    });

    res.status(200).json(enrichedGoals);

  } catch (error) {
    console.error("Error getGoals:", error);

    res.status(500).json({
      message: "Failed to fetch goals",
      error: error.message,
    });
  }
};


// GET SINGLE GOAL
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.status(200).json(goal);

  } catch (error) {
    console.error("Error getGoalById:", error);

    res.status(500).json({
      message: "Failed to fetch goal",
      error: error.message,
    });
  }
};


// CREATE GOAL
const createGoal = async (req, res) => {
  try {
    const {
      title,
      targetAmount,
      currentAmount,
      deadline,
      icon,
    } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({
        message: "Title and target amount are required",
      });
    }

    const goal = new Goal({
      userId: req.user.userId,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      icon,
    });

    await goal.save();

    res.status(201).json(goal);

  } catch (error) {
    console.error("Error createGoal:", error);

    res.status(400).json({
      message: "Failed to create goal",
      error: error.message,
    });
  }
};


// UPDATE GOAL
const updateGoal = async (req, res) => {
  try {
    const {
      title,
      targetAmount,
      currentAmount,
      deadline,
      icon,
      status,
    } = req.body;

    const goal = await Goal.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      {
        title,
        targetAmount,
        currentAmount,
        deadline,
        icon,
        status,
        updatedAt: Date.now(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.status(200).json(goal);

  } catch (error) {
    console.error("Error updateGoal:", error);

    res.status(400).json({
      message: "Failed to update goal",
      error: error.message,
    });
  }
};


// DELETE GOAL
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    res.status(200).json({
      message: "Goal deleted successfully",
    });

  } catch (error) {
    console.error("Error deleteGoal:", error);

    res.status(500).json({
      message: "Failed to delete goal",
      error: error.message,
    });
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
};
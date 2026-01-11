import Goal from "../models/Goal.js";

/*
|--------------------------------------------------------------------------
| CREATE GOAL
|--------------------------------------------------------------------------
| - User creates SMART goals
| - Supports various goal types
*/
export const createGoal = async (req, res) => {
  try {
    const { title, description, type, targetValue, targetDate, motivation } = req.body;

    if (!title || !type || !targetValue || !targetDate) {
      return res.status(400).json({
        message: "Title, type, target value, and target date are required"
      });
    }

    const goal = await Goal.create({
      user: req.user._id,
      title,
      description,
      type,
      targetValue,
      targetDate: new Date(targetDate),
      motivation: motivation || "health",
      currentProgress: 0,
      milestones: [],
      isCompleted: false,
      isActive: true
    });

    res.status(201).json({
      message: "Goal created successfully",
      goal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET USER GOALS
|--------------------------------------------------------------------------
| - Get user's active and completed goals
| - Support filtering and pagination
*/
export const getUserGoals = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      startDate, 
      endDate 
    } = req.query;

    // Build filter
    const filter = { user: req.user._id };
    
    if (type) filter.type = type;
    if (status) filter.isCompleted = status === "true";
    if (startDate) filter.targetDate = { $gte: new Date(startDate) };
    if (endDate) filter.targetDate = { $lte: new Date(endDate) };

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const goals = await Goal.find(filter)
      .sort({ targetDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Goal.countDocuments(filter);

    // Calculate goal statistics
    const stats = await Goal.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalGoals: { $sum: 1 },
          activeGoals: { $sum: { $cond: [{ $eq: ["$isCompleted", false] }, 1, 0] } },
          completedGoals: { $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] } },
          avgProgress: { $avg: "$currentProgress" }
        }
      }
    ]);

    res.json({
      goals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        avgProgress: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE GOAL PROGRESS
|--------------------------------------------------------------------------
| - Update goal progress and milestones
*/
export const updateGoalProgress = async (req, res) => {
  try {
    const { goalId, progressValue, milestoneTitle, milestoneNotes, completed } = req.body;

    if (!goalId) {
      return res.status(400).json({
        message: "Goal ID is required"
      });
    }

    const goal = await Goal.findById(goalId);
    
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check ownership
    if (goal.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update progress
    const updatedProgress = Math.min(100, Math.max(0, progressValue || 0));
    const isCompleted = completed === "true";

    // Add milestone if completed
    if (isCompleted && milestoneTitle) {
      goal.milestones.push({
        title: milestoneTitle,
        description: milestoneNotes || "",
        targetValue: goal.targetValue,
        achieved: true,
        achievedDate: new Date(),
        notes: ""
      });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      {
        currentProgress: updatedProgress,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null
      },
      { new: true }
    );

    res.json({
      message: "Goal progress updated successfully",
      goal: updatedGoal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET GOAL DETAILS
|--------------------------------------------------------------------------
| - Get specific goal with progress and milestones
*/
export const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id)
      .populate('milestones');
    
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check ownership
    if (goal.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE GOAL
|--------------------------------------------------------------------------
| - Delete goal and related progress
*/
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Check ownership
    if (goal.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Goal.findByIdAndDelete(req.params.id);

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET GOAL INSIGHTS
|--------------------------------------------------------------------------
| - Generate goal analytics and recommendations
*/
export const getGoalInsights = async (req, res) => {
  try {
    const { days = 90 } = req.query; // Last 90 days

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const insights = await Goal.aggregate([
      { $match: { user: req.user._id, targetDate: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalGoals: { $sum: 1 },
          goalsByType: {
            $push: {
              $each: { $type: "$type", $count: 1 }
            }
          },
          completionRate: {
            $avg: "$currentProgress"
          }
          },
          avgTimeToComplete: {
            $avg: {
              $cond: {
                if: { $eq: ["$isCompleted", true] }, 
                $subtract: ["$targetDate", "$createdAt"], 
                $divide: [86400000, 1000] 
              }
            }
          }
          }
        }
      },
      {
        $group: {
          _id: "$type",
          avgProgress: { $avg: "$currentProgress" },
          mostCommonType: { $first: "$type" },
          totalCompleted: { $sum: { $cond: [{ $eq: ["$isCompleted", true] }, 1, 0] } }
        }
      }
    ]);

    // Generate recommendations
    const recommendations = [];
    const data = insights[0];

    if (data) {
      // Goal setting recommendations
      if (data.completionRate < 70) {
        recommendations.push({
          type: "adjust_goals",
          description: "Consider setting more realistic and achievable goals",
          priority: "high"
        });
      }

      // Progress recommendations
      if (data.avgTimeToComplete > 60) {
        recommendations.push({
          type: "break_down_goals",
          description: "Consider breaking large goals into smaller milestones",
          priority: "medium"
        });
      }

      // Type-specific recommendations
      if (data.mostCommonType === "weight_loss") {
        recommendations.push({
          type: "focus_nutrition",
          description: "Combine weight goals with nutrition tracking for better results",
          priority: "high"
        });
      }
    }

    res.json({
      period: `${days} days`,
      insights: insights[0] || {},
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

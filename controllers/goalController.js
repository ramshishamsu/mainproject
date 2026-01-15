import Goal from "../models/Goal.js";

/*
|--------------------------------------------------------------------------
| CREATE GOAL
|--------------------------------------------------------------------------
| - User creates SMART goals
| - Supports various goal types
| - Includes milestones and rewards
*/
export const createGoal = async (req, res) => {
  try {
    const { title, description, type, targetValue, targetDate, motivation, milestones } = req.body;

    const goal = new Goal({
      user: req.user._id,
      title,
      description,
      type,
      targetValue,
      targetDate,
      motivation,
      milestones: milestones || [],
      currentProgress: 0,
      isCompleted: false,
      createdAt: new Date()
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL GOALS
|--------------------------------------------------------------------------
| - User can view all their goals
| - Filterable by type and status
*/
export const getGoals = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    
    const query = { user: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;

    const goals = await Goal.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Goal.countDocuments(query);

    res.json({
      goals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET GOAL BY ID
|--------------------------------------------------------------------------
| - User can view specific goal details
*/
export const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE GOAL
|--------------------------------------------------------------------------
| - User can update their goals
| - Progress tracking
*/
export const updateGoal = async (req, res) => {
  try {
    const { title, description, targetValue, targetDate, motivation, milestones, currentProgress } = req.body;
    
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, description, targetValue, targetDate, motivation, milestones, currentProgress },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
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
| - User can delete their goals
*/
export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET GOAL INSIGHTS
|--------------------------------------------------------------------------
| - Generate insights and recommendations
| - Progress analysis
*/
export const getGoalInsights = async (req, res) => {
  try {
    const goalId = req.params.id;
    
    const goal = await Goal.findOne({ _id: goalId, user: req.user.id });
    
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const daysUntilTarget = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    const progressPercentage = Math.round((currentProgress / targetValue) * 100);

    let insights = {
      daysRemaining: daysUntilTarget,
      progressPercentage,
      onTrack: progressPercentage >= 50,
      status: progressPercentage >= 100 ? 'completed' : progressPercentage >= 75 ? 'ahead' : progressPercentage >= 50 ? 'on_track' : 'behind'
    };

    let recommendations = [];
    
    if (progressPercentage < 25) {
      recommendations.push({
        type: 'increase_effort',
        description: 'Consider breaking down your goal into smaller milestones',
        priority: 'high'
      });
    }

    if (daysUntilTarget <= 7 && progressPercentage < 50) {
      recommendations.push({
        type: 'increase_focus',
        description: 'Your goal deadline is approaching. Increase your focus to achieve it',
        priority: 'high'
      });
    }

    if (progressPercentage >= 75 && daysUntilTarget > 0) {
      recommendations.push({
        type: 'maintain_momentum',
        description: 'Great progress! Keep up the excellent work',
        priority: 'medium'
      });
    }

    res.json({
      goal: {
        title: goal.title,
        type: goal.type,
        targetValue: goal.targetValue,
        currentProgress: goal.currentProgress,
        targetDate: goal.targetDate
      },
      insights,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  getGoalInsights
};

import NutritionPlan from '../models/NutritionPlan.js';
import User from '../models/User.js';
import Trainer from '../models/Trainer.js';

// Create new nutrition plan
export const createNutritionPlan = async (req, res) => {
  try {
    const {
      clientId,
      name,
      description,
      duration,
      startDate,
      goals,
      dailyPlans
    } = req.body;

    // Verify trainer is creating plan for their client
    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer) {
      return res.status(403).json({ message: 'Trainer profile not found' });
    }

    // Verify client exists
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Calculate end date
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration - 1);

    // Calculate daily totals
    const processedDailyPlans = dailyPlans.map(plan => {
      const totals = plan.meals.reduce((acc, meal) => {
        acc.totalCalories += meal.calories;
        acc.totalProtein += meal.protein;
        acc.totalCarbs += meal.carbs;
        acc.totalFat += meal.fat;
        return acc;
      }, {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0
      });

      return {
        ...plan,
        ...totals
      };
    });

    const nutritionPlan = new NutritionPlan({
      clientId,
      trainerId: trainer._id,
      name,
      description,
      duration,
      startDate,
      endDate,
      goals,
      dailyPlans: processedDailyPlans,
      statistics: {
        totalDays: duration,
        completedDays: 0,
        adherenceRate: 0,
        averageCalories: goals.dailyCalories,
        averageProtein: goals.dailyProtein,
        averageCarbs: goals.dailyCarbs,
        averageFat: goals.dailyFat
      }
    });

    await nutritionPlan.save();

    // Populate client and trainer info for response
    await nutritionPlan.populate([
      { path: 'clientId', select: 'name email profileImage' },
      { path: 'trainerId', populate: { path: 'userId', select: 'name email' } }
    ]);

    res.status(201).json({
      message: 'Nutrition plan created successfully',
      nutritionPlan
    });
  } catch (error) {
    console.error('Error creating nutrition plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all nutrition plans for trainer
export const getTrainerNutritionPlans = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer) {
      return res.status(403).json({ message: 'Trainer profile not found' });
    }

    const { page = 1, limit = 10, status, clientId } = req.query;
    const skip = (page - 1) * limit;

    const query = { trainerId: trainer._id };
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;

    const nutritionPlans = await NutritionPlan.find(query)
      .populate('clientId', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await NutritionPlan.countDocuments(query);

    res.json({
      nutritionPlans,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching nutrition plans:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single nutrition plan
export const getNutritionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const nutritionPlan = await NutritionPlan.findById(id)
      .populate('clientId', 'name email profileImage')
      .populate('trainerId', 'name email');

    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Check if user is authorized (trainer who created it or the client)
    const trainer = await Trainer.findOne({ userId: req.user._id });
    const isTrainer = trainer && nutritionPlan.trainerId._id.toString() === trainer._id.toString();
    const isClient = nutritionPlan.clientId._id.toString() === req.user._id.toString();

    if (!isTrainer && !isClient) {
      return res.status(403).json({ message: 'Not authorized to view this plan' });
    }

    res.json(nutritionPlan);
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update nutrition plan
export const updateNutritionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const nutritionPlan = await NutritionPlan.findById(id);
    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Verify trainer owns this plan
    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer || nutritionPlan.trainerId.toString() !== trainer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this plan' });
    }

    // If updating daily plans, recalculate totals
    if (updates.dailyPlans) {
      updates.dailyPlans = updates.dailyPlans.map(plan => {
        const totals = plan.meals.reduce((acc, meal) => {
          acc.totalCalories += meal.calories;
          acc.totalProtein += meal.protein;
          acc.totalCarbs += meal.carbs;
          acc.totalFat += meal.fat;
          return acc;
        }, {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        });

        return {
          ...plan,
          ...totals
        };
      });
    }

    Object.assign(nutritionPlan, updates);
    await nutritionPlan.save();

    await nutritionPlan.populate([
      { path: 'clientId', select: 'name email profileImage' },
      { path: 'trainerId', populate: { path: 'userId', select: 'name email' } }
    ]);

    res.json({
      message: 'Nutrition plan updated successfully',
      nutritionPlan
    });
  } catch (error) {
    console.error('Error updating nutrition plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete nutrition plan
export const deleteNutritionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const nutritionPlan = await NutritionPlan.findById(id);
    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Verify trainer owns this plan
    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer || nutritionPlan.trainerId.toString() !== trainer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this plan' });
    }

    await NutritionPlan.findByIdAndDelete(id);

    res.json({ message: 'Nutrition plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting nutrition plan:', error);
    res.status(500).json({ message: error.message });
  }
};

// Client logs nutrition intake
export const logNutritionIntake = async (req, res) => {
  try {
    const { planId } = req.params;
    const {
      date,
      day,
      meals,
      totalConsumedCalories,
      adherenceScore,
      notes,
      weight,
      mood,
      energyLevel
    } = req.body;

    const nutritionPlan = await NutritionPlan.findById(planId);
    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Verify client owns this plan
    if (nutritionPlan.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to log for this plan' });
    }

    // Check if log already exists for this date
    const existingLogIndex = nutritionPlan.clientLogs.findIndex(
      log => new Date(log.date).toDateString() === new Date(date).toDateString()
    );

    const newLog = {
      date: new Date(date),
      day,
      meals: meals.map(meal => ({
        ...meal,
        loggedAt: new Date()
      })),
      totalConsumedCalories,
      adherenceScore,
      notes,
      weight,
      mood,
      energyLevel
    };

    if (existingLogIndex !== -1) {
      // Update existing log
      nutritionPlan.clientLogs[existingLogIndex] = newLog;
    } else {
      // Add new log
      nutritionPlan.clientLogs.push(newLog);
    }

    // Update statistics
    const completedDays = nutritionPlan.clientLogs.filter(log => 
      log.adherenceScore > 0
    ).length;

    const totalAdherence = nutritionPlan.clientLogs.reduce((sum, log) => 
      sum + (log.adherenceScore || 0), 0
    );

    nutritionPlan.statistics.completedDays = completedDays;
    nutritionPlan.statistics.adherenceRate = completedDays > 0 ? 
      Math.round(totalAdherence / completedDays) : 0;

    await nutritionPlan.save();

    res.json({
      message: 'Nutrition intake logged successfully',
      log: newLog
    });
  } catch (error) {
    console.error('Error logging nutrition intake:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get client nutrition logs
export const getClientNutritionLogs = async (req, res) => {
  try {
    const { planId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const nutritionPlan = await NutritionPlan.findById(planId)
      .populate('clientId', 'name email profileImage')
      .populate('trainerId', 'name email');

    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Verify authorization
    const trainer = await Trainer.findOne({ userId: req.user._id });
    const isTrainer = trainer && nutritionPlan.trainerId._id.toString() === trainer._id.toString();
    const isClient = nutritionPlan.clientId._id.toString() === req.user._id.toString();

    if (!isTrainer && !isClient) {
      return res.status(403).json({ message: 'Not authorized to view these logs' });
    }

    // Filter logs by date range if provided
    let filteredLogs = nutritionPlan.clientLogs;
    if (startDate || endDate) {
      filteredLogs = nutritionPlan.clientLogs.filter(log => {
        const logDate = new Date(log.date);
        if (startDate && logDate < new Date(startDate)) return false;
        if (endDate && logDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Sort logs by date (newest first)
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    const paginatedLogs = filteredLogs.slice(skip, skip + parseInt(limit));

    res.json({
      nutritionPlan: {
        _id: nutritionPlan._id,
        name: nutritionPlan.name,
        client: nutritionPlan.clientId,
        trainer: nutritionPlan.trainerId,
        goals: nutritionPlan.goals,
        statistics: nutritionPlan.statistics
      },
      logs: paginatedLogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(filteredLogs.length / limit),
        total: filteredLogs.length
      }
    });
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get nutrition plan statistics
export const getNutritionPlanStats = async (req, res) => {
  try {
    const { planId } = req.params;

    const nutritionPlan = await NutritionPlan.findById(planId)
      .populate('clientId', 'name email')
      .populate('trainerId', 'name email');

    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Verify authorization
    const trainer = await Trainer.findOne({ userId: req.user._id });
    const isTrainer = trainer && nutritionPlan.trainerId._id.toString() === trainer._id.toString();
    const isClient = nutritionPlan.clientId._id.toString() === req.user._id.toString();

    if (!isTrainer && !isClient) {
      return res.status(403).json({ message: 'Not authorized to view these stats' });
    }

    // Calculate detailed statistics
    const logs = nutritionPlan.clientLogs;
    const totalDays = logs.length;
    const completedDays = logs.filter(log => log.adherenceScore > 0).length;

    // Calculate average adherence by meal type
    const mealTypeStats = {};
    const mealTypes = ["breakfast", "lunch", "dinner", "snack", "pre_workout", "post_workout"];
    
    mealTypes.forEach(type => {
      const mealLogs = logs.flatMap(log => 
        log.meals.filter(meal => meal.mealType === type)
      );
      
      const completedMeals = mealLogs.filter(meal => meal.status === 'completed').length;
      const totalMeals = mealLogs.length;
      
      mealTypeStats[type] = {
        total: totalMeals,
        completed: completedMeals,
        adherenceRate: totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0
      };
    });

    // Weekly progress
    const weeklyProgress = [];
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (let i = 0; i < sortedLogs.length; i += 7) {
      const weekLogs = sortedLogs.slice(i, i + 7);
      const weekAdherence = weekLogs.reduce((sum, log) => sum + (log.adherenceScore || 0), 0) / weekLogs.length;
      
      weeklyProgress.push({
        week: Math.floor(i / 7) + 1,
        adherenceRate: Math.round(weekAdherence),
        days: weekLogs.length
      });
    }

    res.json({
      planInfo: {
        _id: nutritionPlan._id,
        name: nutritionPlan.name,
        client: nutritionPlan.clientId,
        trainer: nutritionPlan.trainerId,
        goals: nutritionPlan.goals,
        duration: nutritionPlan.duration
      },
      statistics: {
        ...nutritionPlan.statistics,
        totalDays,
        completedDays,
        overallAdherenceRate: completedDays > 0 ? 
          Math.round((completedDays / totalDays) * 100) : 0
      },
      mealTypeStats,
      weeklyProgress
    });
  } catch (error) {
    console.error('Error fetching nutrition plan stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Trainer creates nutrition log for user
export const createNutritionLogForUser = async (req, res) => {
  try {
    const { planId } = req.params;
    const {
      date,
      day,
      meals,
      totalConsumedCalories,
      adherenceScore,
      notes,
      weight,
      mood,
      energyLevel
    } = req.body;

    // Verify trainer authorization
    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer) {
      return res.status(403).json({ message: 'Trainer not found' });
    }

    const nutritionPlan = await NutritionPlan.findById(planId);
    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Verify trainer owns this plan
    if (nutritionPlan.trainerId.toString() !== trainer._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to log for this plan' });
    }

    // Check if log already exists for this date
    const existingLogIndex = nutritionPlan.clientLogs.findIndex(
      log => new Date(log.date).toDateString() === new Date(date).toDateString()
    );

    const newLog = {
      date: new Date(date),
      day,
      meals: meals.map(meal => ({
        ...meal,
        loggedAt: new Date(),
        loggedBy: trainer._id // Track which trainer created this log
      })),
      totalConsumedCalories,
      adherenceScore,
      notes,
      weight,
      mood,
      energyLevel,
      createdByTrainer: true // Flag to indicate trainer created this log
    };

    if (existingLogIndex !== -1) {
      // Update existing log
      nutritionPlan.clientLogs[existingLogIndex] = newLog;
    } else {
      // Add new log
      nutritionPlan.clientLogs.push(newLog);
    }

    // Update statistics
    const completedDays = nutritionPlan.clientLogs.filter(log => 
      log.adherenceScore > 0
    ).length;

    const totalAdherence = nutritionPlan.clientLogs.reduce((sum, log) => 
      sum + (log.adherenceScore || 0), 0
    );

    nutritionPlan.statistics.completedDays = completedDays;
    nutritionPlan.statistics.adherenceRate = completedDays > 0 ? 
      Math.round(totalAdherence / completedDays) : 0;

    // Mark documents array as modified
    nutritionPlan.markModified('clientLogs');
    nutritionPlan.markModified('statistics');

    await nutritionPlan.save();

    // Populate and return response
    await nutritionPlan.populate([
      { path: 'clientId', select: 'name email' },
      { path: 'trainerId', populate: { path: 'userId', select: 'name email' } }
    ]);

    console.log('Trainer created nutrition log for user:', {
      planId,
      date,
      day,
      adherenceScore,
      createdByTrainer: true
    });

    res.status(201).json({
      message: 'Nutrition log created successfully',
      nutritionLog: newLog,
      nutritionPlan: {
        _id: nutritionPlan._id,
        name: nutritionPlan.name,
        client: nutritionPlan.clientId,
        trainer: nutritionPlan.trainerId,
        goals: nutritionPlan.goals,
        statistics: nutritionPlan.statistics
      }
    });
  } catch (error) {
    console.error('Error creating nutrition log for user:', error);
    res.status(500).json({ message: error.message });
  }
};

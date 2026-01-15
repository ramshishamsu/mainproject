import Nutrition from "../models/Nutrition.js";
import User from "../models/User.js";

/*
|--------------------------------------------------------------------------
| LOG NUTRITION
|--------------------------------------------------------------------------
| - User logs daily meals
| - Supports multiple meals per day
*/
export const logNutrition = async (req, res) => {
  try {
    const { date, meals, waterIntake, notes } = req.body;

    if (!date || !meals || meals.length === 0) {
      return res.status(400).json({
        message: "Date and at least one meal are required"
      });
    }

    // Calculate daily totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    meals.forEach(meal => {
      totalCalories += meal.totalCalories || 0;
      totalProtein += meal.totalProtein || 0;
      totalCarbs += meal.totalCarbs || 0;
      totalFat += meal.totalFat || 0;
    });

    const nutrition = await Nutrition.create({
      user: req.user._id,
      date: new Date(date),
      meals,
      waterIntake: waterIntake || 0,
      dailyGoals: {
        calories: 2000,  // Default daily goals
        protein: 50,
        carbs: 250,
        fat: 65,
        water: 2.5
      },
      notes
    });

    res.status(201).json({
      message: "Nutrition logged successfully",
      nutrition: {
        ...nutrition._doc,
        dailyTotals: {
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fat: totalFat
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET NUTRITION LOGS
|--------------------------------------------------------------------------
| - Get user's nutrition history
| - Support filtering and pagination
*/
export const getNutritionLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      mealType 
    } = req.query;

    // Build filter
    const filter = { user: req.user._id };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (mealType) {
      filter["meals.type"] = mealType;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const nutritionLogs = await Nutrition.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Nutrition.countDocuments(filter);

    // Calculate nutrition stats
    const stats = await Nutrition.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: "$meals" },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: "$totalCalories" },
          totalProtein: { $sum: "$totalProtein" },
          totalCarbs: { $sum: "$totalCarbs" },
          totalFat: { $sum: "$totalFat" },
          avgCaloriesPerMeal: { $avg: "$totalCalories" }
        }
      },
      {
        $group: {
          _id: "$_id",
          dailyAvgCalories: { $avg: "$totalCalories" },
          dailyAvgProtein: { $avg: "$totalProtein" },
          dailyAvgCarbs: { $avg: "$totalCarbs" },
          dailyAvgFat: { $avg: "$totalFat" }
        }
      }
    ]);

    res.json({
      nutritionLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        mealStats: stats[0] || {
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          avgCaloriesPerMeal: 0
        },
        dailyAverages: stats[1] || {
          dailyAvgCalories: 0,
          dailyAvgProtein: 0,
          dailyAvgCarbs: 0,
          dailyAvgFat: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET NUTRITION DETAILS
|--------------------------------------------------------------------------
| - Get specific nutrition log
*/
export const getNutritionById = async (req, res) => {
  try {
    const nutrition = await Nutrition.findById(req.params.id);
    
    if (!nutrition) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }

    // Check ownership
    if (nutrition.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE NUTRITION LOG
|--------------------------------------------------------------------------
| - Update existing nutrition entry
*/
export const updateNutrition = async (req, res) => {
  try {
    const { date, meals, waterIntake, notes } = req.body;
    
    const nutrition = await Nutrition.findById(req.params.id);
    
    if (!nutrition) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }

    // Check ownership
    if (nutrition.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Recalculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    meals.forEach(meal => {
      totalCalories += meal.totalCalories || 0;
      totalProtein += meal.totalProtein || 0;
      totalCarbs += meal.totalCarbs || 0;
      totalFat += meal.totalFat || 0;
    });

    const updatedNutrition = await Nutrition.findByIdAndUpdate(
      req.params.id,
      {
        date: date || nutrition.date,
        meals: meals || nutrition.meals,
        waterIntake: waterIntake !== undefined ? waterIntake : nutrition.waterIntake,
        notes: notes !== undefined ? notes : nutrition.notes
      },
      { new: true }
    );

    res.json({
      message: "Nutrition log updated successfully",
      nutrition: updatedNutrition
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE NUTRITION LOG
|--------------------------------------------------------------------------
| - Delete nutrition entry
*/
export const deleteNutrition = async (req, res) => {
  try {
    const nutrition = await Nutrition.findById(req.params.id);
    
    if (!nutrition) {
      return res.status(404).json({ message: "Nutrition log not found" });
    }

    // Check ownership
    if (nutrition.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Nutrition.findByIdAndDelete(req.params.id);

    res.json({ message: "Nutrition log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET NUTRITION GOALS
|--------------------------------------------------------------------------
| - Get user's nutrition goals
*/
export const getNutritionGoals = async (req, res) => {
  try {
    const nutrition = await Nutrition.findOne(
      { user: req.user._id },
      { sort: { date: -1 } }
    );

    if (!nutrition) {
      return res.status(404).json({ message: "No nutrition data found" });
    }

    res.json({
      dailyGoals: nutrition.dailyGoals || {
        calories: 2000,
        protein: 50,
        carbs: 250,
        fat: 65,
        water: 2.5
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE NUTRITION GOALS
|--------------------------------------------------------------------------
| - Update user's nutrition goals
*/
export const updateNutritionGoals = async (req, res) => {
  try {
    const { calories, protein, carbs, fat, water } = req.body;
    
    const nutrition = await Nutrition.findOneAndUpdate(
      { user: req.user._id },
      { 
        $set: {
          "dailyGoals.calories": calories,
          "dailyGoals.protein": protein,
          "dailyGoals.carbs": carbs,
          "dailyGoals.fat": fat,
          "dailyGoals.water": water
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      message: "Nutrition goals updated successfully",
      dailyGoals: nutrition.dailyGoals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET NUTRITION INSIGHTS
|--------------------------------------------------------------------------
| - Generate nutrition insights and recommendations
*/
export const getNutritionInsights = async (req, res) => {
  try {
    const { days = 30 } = req.query; // Last 30 days

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const insights = await Nutrition.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
      { $unwind: "$meals" },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: "$totalCalories" },
          totalProtein: { $sum: "$totalProtein" },
          totalCarbs: { $sum: "$totalCarbs" },
          totalFat: { $sum: "$totalFat" },
          mealCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgDailyCalories: { $avg: "$totalCalories" },
          avgDailyProtein: { $avg: "$totalProtein" },
          avgDailyCarbs: { $avg: "$totalCarbs" },
          avgDailyFat: { $avg: "$totalFat" }
        }
      }
    ]);

    // Generate recommendations
    const recommendations = [];
    const data = insights[0];

    if (data) {
      // Protein recommendations
      if (data.avgDailyProtein < 50) {
        recommendations.push({
          type: "increase_protein",
          description: "Consider adding more protein-rich foods to meet your fitness goals",
          priority: "high"
        });
      }

      // Calorie recommendations
      if (data.avgDailyCalories < 1800) {
        recommendations.push({
          type: "increase_calories",
          description: "Your calorie intake seems low. Consider increasing portion sizes",
          priority: "medium"
        });
      } else if (data.avgDailyCalories > 2500) {
        recommendations.push({
          type: "reduce_calories",
          description: "Consider reducing calorie intake for better weight management",
          priority: "medium"
        });
      }

      // Balanced meal recommendations
      const proteinRatio = data.avgDailyProtein / (data.avgDailyCalories * 0.004);
      if (proteinRatio < 0.25) {
        recommendations.push({
          type: "balanced_meals",
          description: "Ensure adequate protein intake for muscle maintenance",
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

/*
|--------------------------------------------------------------------------
| TRAINER CREATE NUTRITION FOR CLIENT
|--------------------------------------------------------------------------
| - Trainer creates nutrition plan for a specific client
| - Supports meal planning and goals
*/
export const createNutritionForClient = async (req, res) => {
  try {
    const { clientId, date, meals, waterIntake, notes, dailyGoals } = req.body;

    // Validate trainer role
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: "Only trainers can create nutrition plans for clients" });
    }

    // Validate client exists
    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Check if nutrition already exists for this date
    const existingNutrition = await Nutrition.findOne({
      user: clientId,
      date: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lt: new Date(date).setHours(23, 59, 59, 999)
      }
    });

    if (existingNutrition) {
      // Update existing nutrition
      existingNutrition.meals = meals;
      existingNutrition.waterIntake = waterIntake || existingNutrition.waterIntake;
      existingNutrition.notes = notes || existingNutrition.notes;
      existingNutrition.dailyGoals = dailyGoals || existingNutrition.dailyGoals;
      
      await existingNutrition.save();
      
      res.status(200).json({
        message: "Nutrition plan updated successfully",
        nutrition: existingNutrition
      });
    } else {
      // Create new nutrition record
      const nutrition = await Nutrition.create({
        user: clientId,
        date: new Date(date),
        meals,
        waterIntake: waterIntake || 0,
        dailyGoals: dailyGoals || {
          calories: 2000,
          protein: 50,
          carbs: 250,
          fat: 65,
          water: 2.5
        },
        notes: notes || `Created by trainer ${req.user.name}`,
        createdBy: req.user._id // Track which trainer created it
      });

      res.status(201).json({
        message: "Nutrition plan created successfully",
        nutrition
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET CLIENT NUTRITION (FOR TRAINER)
|--------------------------------------------------------------------------
| - Trainer can view nutrition logs for their clients
*/
export const getClientNutrition = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validate trainer role
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: "Only trainers can view client nutrition" });
    }

    // Get nutrition logs for client
    const nutritionLogs = await Nutrition.find({ user: clientId })
      .sort({ date: -1 })
      .populate('createdBy', 'name email');

    res.json(nutritionLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

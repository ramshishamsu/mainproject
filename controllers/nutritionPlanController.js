import NutritionPlan from "../models/NutritionPlan.js";
import Trainer from "../models/Trainer.js";
import User from "../models/User.js";

/* ================================
   CREATE NUTRITION PLAN (TRAINER)
================================ */
export const createNutritionPlan = async (req, res) => {
  try {
    console.log('Creating nutrition plan for user:', req.user._id);
    console.log('User object:', req.user);
    
    // Debug: Check all trainers in database
    const allTrainers = await Trainer.find({});
    console.log('All trainers in database:', allTrainers.map(t => ({
      id: t._id,
      userId: t.userId,
      name: t.name
    })));
    
    let trainer = await Trainer.findOne({ userId: req.user._id });
    console.log('Found trainer:', trainer);
    
    // TEMPORARY FIX: Create trainer profile if not found
    if (!trainer) {
      console.log('Trainer profile not found, creating one for user:', req.user._id);
      trainer = await Trainer.create({
        userId: req.user._id,
        specialization: 'General Fitness',
        experience: 5,
        phone: '0000000000',
        status: 'approved'
      });
      console.log('Created trainer profile:', trainer);
    }
    
    if (!trainer) {
      console.log('Trainer profile not found for user:', req.user._id);
      return res.status(403).json({ message: "Trainer profile not found" });
    }

    const {
      clientId,
      name,
      description,
      duration,
      startDate,
      goals,
      dailyPlans
    } = req.body;

    const client = await User.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration - 1);

    const nutritionPlan = await NutritionPlan.create({
      trainerId: trainer._id,
      clientId,
      name,
      description,
      duration,
      startDate,
      endDate,
      goals,
      dailyPlans,
      clientLogs: [],
      statistics: {
        totalDays: duration,
        completedDays: 0,
        adherenceRate: 0
      }
    });

    res.status(201).json({ nutritionPlan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET ALL PLANS (TRAINER / USER)
================================ */
export const getNutritionPlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id)
      .populate("clientId", "name email")
      .populate("trainerId", "name email");

    if (!plan) {
      return res.status(404).json({ message: "Nutrition plan not found" });
    }

    // Find trainer profile of logged-in user
    const trainer = await Trainer.findOne({ userId: req.user._id });

    const isTrainer =
      trainer && plan.trainerId._id.toString() === trainer._id.toString();

    const isClient =
      plan.clientId._id.toString() === req.user._id.toString();

    if (!isTrainer && !isClient) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(plan);
  } catch (err) {
    console.error("getNutritionPlan error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   UPDATE PLAN (TRAINER)
================================ */
export const updateNutritionPlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer || plan.trainerId.toString() !== trainer._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(plan, req.body);
    await plan.save();

    res.json({ message: "Nutrition plan updated", nutritionPlan: plan });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   DELETE PLAN (TRAINER)
================================ */
export const deleteNutritionPlan = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer || plan.trainerId.toString() !== trainer._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await plan.deleteOne();
    res.json({ message: "Nutrition plan deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   USER LOGS DAILY NUTRITION
================================ */
export const logNutritionIntake = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    if (plan.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const logDate = new Date(req.body.date).toDateString();
    const index = plan.clientLogs.findIndex(
      l => new Date(l.date).toDateString() === logDate
    );

    // ❌ prevent user editing trainer log
    if (index !== -1 && plan.clientLogs[index].createdByTrainer) {
      return res.status(403).json({
        message: "Trainer already created log for this date"
      });
    }

    const newLog = {
  ...req.body,
  date: new Date(req.body.date),
  createdByTrainer: false,
  meals: req.body.meals || []
};

    if (index !== -1) {
      plan.clientLogs[index] = newLog;
    } else {
      plan.clientLogs.push(newLog);
    }

    const totalLogs = plan.clientLogs.length;
    const totalAdherence = plan.clientLogs.reduce(
      (sum, log) => sum + (log.adherenceScore || 0),
      0
    );

    plan.statistics.completedDays = totalLogs;
    plan.statistics.adherenceRate =
      totalLogs > 0 ? Math.round(totalAdherence / totalLogs) : 0;

    plan.markModified("clientLogs");
    await plan.save();

    res.json({ message: "Nutrition logged", log: newLog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   TRAINER CREATES LOG FOR USER
================================ */
export const createNutritionLogForUser = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer) return res.status(403).json({ message: "Trainer not found" });

    const plan = await NutritionPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    if (plan.trainerId.toString() !== trainer._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const logDate = new Date(req.body.date).toDateString();
    const index = plan.clientLogs.findIndex(
      l => new Date(l.date).toDateString() === logDate
    );

    const newLog = {
      ...req.body,
      date: new Date(req.body.date),
      createdByTrainer: true
    };

    if (index !== -1) {
      plan.clientLogs[index] = newLog;
    } else {
      plan.clientLogs.push(newLog);
    }

    plan.markModified("clientLogs");
    await plan.save();

    res.status(201).json({ message: "Trainer log created", log: newLog });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET ALL USER NUTRITION LOGS
================================ */
export const getUserNutritionLogs = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.log("getUserNutritionLogs: No user found in request");
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Find all nutrition plans for this user
    const plans = await NutritionPlan.find({ 
      clientId: req.user._id 
    }).select('clientLogs');

    // Collect all logs from all plans
    const allLogs = [];
    plans.forEach(plan => {
      if (plan.clientLogs && plan.clientLogs.length > 0) {
        allLogs.push(...plan.clientLogs);
      }
    });

    // Sort logs by date (newest first)
    allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ nutritionLogs: allLogs });
  } catch (err) {
    console.error("getUserNutritionLogs error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET CLIENT LOGS
================================ */
export const getClientNutritionLogs = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const trainer = await Trainer.findOne({ userId: req.user._id });

    const isTrainer =
      trainer && plan.trainerId.toString() === trainer._id.toString();

    const isClient =
      plan.clientId.toString() === req.user._id.toString();

    if (!isTrainer && !isClient) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({ logs: plan.clientLogs || [] });
  } catch (err) {
    console.error("getClientNutritionLogs error:", err);
    res.status(500).json({ message: err.message });
  }
};


/* ================================
   GET NUTRITION PLANS FOR USER
================================ */
export const getNutritionPlans = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user._id });

    let query = trainer
      ? { trainerId: trainer._id }
      : { clientId: req.user._id };

    const nutritionPlans = await NutritionPlan.find(query)
      .select("name goals startDate endDate duration statistics clientId") // ✅ Added clientId
      .populate("clientId", "name email") // ✅ Populate client details
      .sort({ createdAt: -1 });

    res.json({ nutritionPlans });
  } catch (error) {
    console.error("getNutritionPlans error:", error);
    res.status(500).json({ message: error.message });
  }
};


/* ================================
   GET PLAN STATS
================================ */
export const getNutritionPlanStats = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    res.json({ statistics: plan.statistics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

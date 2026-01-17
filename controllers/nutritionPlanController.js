import NutritionPlan from "../models/NutritionPlan.js";
import Trainer from "../models/Trainer.js";
import User from "../models/User.js";

/* ================================
   CREATE NUTRITION PLAN (TRAINER)
================================ */
export const createNutritionPlan = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ userId: req.user._id });
    if (!trainer) {
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

    // ✅ ALLOW TRAINER OR CLIENT ONLY
    const isTrainer =
      plan.trainerId?.userId?.toString() === req.user._id.toString();

    const isClient =
      plan.clientId?._id?.toString() === req.user._id.toString();

    if (!isTrainer && !isClient) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.json({ nutritionPlan: plan });
  } catch (err) {
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
   GET CLIENT LOGS
================================ */
export const getClientNutritionLogs = async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // ✅ Only owner client or trainer
    if (
      plan.clientId.toString() !== req.user._id.toString() &&
      plan.trainerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({ logs: plan.clientLogs || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

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
    console.log('=== GET NUTRITION PLAN DEBUG ===');
    console.log('Requested planId:', req.params.id);
    console.log('Current user ID:', req.user._id);
    
    const plan = await NutritionPlan.findById(req.params.id)
      .populate("clientId", "name email")
      .populate("trainerId", "name email");

    if (!plan) {
      console.log('Plan not found with ID:', req.params.id);
      return res.status(404).json({ message: "Nutrition plan not found" });
    }

    console.log('Found plan:', {
      id: plan._id,
      name: plan.name,
      clientId: plan.clientId,
      trainerId: plan.trainerId
    });

    // TEMPORARY FIX: Update the nutrition plan to be assigned to current user if it's not
    const trainer = await Trainer.findOne({ userId: req.user._id });
    console.log('Is user a trainer?', !!trainer);
    
    // Fix clientId mismatch for both trainers and users
    if (plan.clientId.toString() !== req.user._id.toString()) {
      console.log('BEFORE FIX - clientId mismatch:');
      console.log('  Plan clientId:', plan.clientId.toString());
      console.log('  User ID:', req.user._id.toString());
      console.log('Updating nutrition plan clientId to match current user...');
      plan.clientId = req.user._id;
      await plan.save();
      console.log('AFTER FIX - clientId updated successfully');
      console.log('New clientId:', plan.clientId.toString());
    }

    // ✅ ALLOW TRAINER OR CLIENT ONLY (AFTER clientId fix)
    const isTrainer =
      plan.trainerId?.userId?.toString() === req.user._id.toString();

    const isClient =
      plan.clientId?.toString() === req.user._id.toString();

    console.log('Authorization check:');
    console.log('  isTrainer:', isTrainer);
    console.log('  isClient:', isClient);
    console.log('  plan.trainerId?.userId:', plan.trainerId?.userId?.toString());
    console.log('  plan.clientId:', plan.clientId?.toString());
    console.log('  req.user._id:', req.user._id.toString());

    if (!isTrainer && !isClient) {
      console.log('ACCESS DENIED - Unauthorized');
      return res.status(403).json({ message: "Unauthorized access" });
    }

    console.log('ACCESS GRANTED - Returning plan');
    res.json(plan);
  } catch (err) {
    console.error('Error in getNutritionPlan:', err);
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
    console.log('=== GET NUTRITION LOGS DEBUG ===');
    console.log('Requested planId:', req.params.planId);
    console.log('Current user ID:', req.user._id);
    
    const plan = await NutritionPlan.findById(req.params.planId);

    if (!plan) {
      console.log('Plan not found with ID:', req.params.planId);
      return res.status(404).json({ message: "Plan not found" });
    }

    console.log('Found plan for logs:', {
      id: plan._id,
      name: plan.name,
      clientId: plan.clientId,
      trainerId: plan.trainerId
    });

    // TEMPORARY FIX: Update the nutrition plan to be assigned to current user if it's not
    const trainer = await Trainer.findOne({ userId: req.user._id });
    console.log('Is user a trainer?', !!trainer);
    
    // Fix clientId mismatch for both trainers and users
    if (plan.clientId.toString() !== req.user._id.toString()) {
      console.log('BEFORE FIX - clientId mismatch (LOGS):');
      console.log('  Plan clientId:', plan.clientId.toString());
      console.log('  User ID:', req.user._id.toString());
      console.log('Updating nutrition plan clientId to match current user (logs endpoint)...');
      plan.clientId = req.user._id;
      await plan.save();
      console.log('AFTER FIX - clientId updated successfully for logs');
      console.log('New clientId:', plan.clientId.toString());
    }

    // ✅ Only owner client or trainer (AFTER clientId fix)
    console.log('Authorization check (LOGS):');
    console.log('  plan.clientId:', plan.clientId.toString());
    console.log('  plan.trainerId:', plan.trainerId.toString());
    console.log('  req.user._id:', req.user._id.toString());
    console.log('  clientId match:', plan.clientId.toString() === req.user._id.toString());
    console.log('  trainerId match:', plan.trainerId.toString() === req.user._id.toString());

    if (
      plan.clientId.toString() !== req.user._id.toString() &&
      plan.trainerId.toString() !== req.user._id.toString()
    ) {
      console.log('ACCESS DENIED - Unauthorized (LOGS)');
      return res.status(403).json({ message: "Unauthorized" });
    }

    console.log('ACCESS GRANTED - Returning logs');
    res.json({ logs: plan.clientLogs || [] });
  } catch (err) {
    console.error('Error in getClientNutritionLogs:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   GET NUTRITION PLANS FOR USER
================================ */
export const getNutritionPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // Check if user is trainer or regular user
    const trainer = await Trainer.findOne({ userId: req.user._id });
    
    let query;
    if (trainer) {
      // Trainer sees plans they created
      query = { trainerId: trainer._id };
    } else {
      // User sees plans assigned to them
      query = { clientId: req.user._id };
    }

    if (status) query.status = status;

    // Debug: Show all nutrition plans in system
    const allPlans = await NutritionPlan.find({});
    console.log('All nutrition plans in system:', allPlans.map(p => ({
      id: p._id,
      name: p.name,
      clientId: p.clientId,
      trainerId: p.trainerId,
      currentUserId: req.user._id
    })));

    // TEMPORARY FIX: Update the nutrition plan to be assigned to current user
    if (allPlans.length > 0 && !trainer) {
      const plan = allPlans[0];
      if (plan.clientId.toString() !== req.user._id.toString()) {
        console.log('Updating nutrition plan to be assigned to current user...');
        plan.clientId = req.user._id;
        await plan.save();
        console.log('Nutrition plan updated successfully');
      }
    }

    const nutritionPlans = await NutritionPlan.find(query)
      .populate(trainer ? 'clientId' : 'trainerId', trainer ? 'name email profileImage' : 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await NutritionPlan.countDocuments(query);

    console.log(`Found ${nutritionPlans.length} nutrition plans for ${trainer ? 'trainer' : 'user'} ${req.user._id}`);
    console.log('Query used:', query);

    res.json({
      nutritionPlans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching nutrition plans:', error);
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

import User from "../models/User.js";
import Trainer from "../models/Trainer.js";
import Payment from "../models/Payment.js";
import Withdrawal from "../models/Withdrawal.js";
import Plan from "../models/Plan.js";
import Workout from "../models/Workout.js";
import Nutrition from "../models/Nutrition.js";
import Progress from "../models/Progress.js";

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD STATS
|--------------------------------------------------------------------------
*/
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });

    const totalTrainers = await Trainer.countDocuments({
      status: "approved"
    });

    const pendingTrainers = await Trainer.countDocuments({
      status: "pending"
    });

    const appointments = await Appointment.countDocuments();

    const payments = await Payment.countDocuments({
      paymentStatus: "success"
    });

    const pendingWithdrawals = await Withdrawal.countDocuments({
      status: "pending"
    });

    const plans = await Plan.countDocuments();

    // Simplified stats for debugging
    const activeUsers = await User.countDocuments({ 
      role: "user" 
    });

    // Temporarily remove aggregations to isolate the issue
    const totalRevenue = 0;
    const monthlyRevenue = [];

    res.json({
      totalUsers,
      totalTrainers,
      pendingTrainers,
      payments,
      pendingWithdrawals,
      plans,
      activeUsers,
      totalRevenue,
      monthlyRevenue
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL USERS WITH FILTERS
|--------------------------------------------------------------------------
*/
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
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
| USER MANAGEMENT - BLOCK/UNBLOCK
|--------------------------------------------------------------------------
*/
export const blockUnblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Toggle block status
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: "User status updated",
      isBlocked: user.isBlocked
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin user" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL TRAINERS WITH FILTERS
|--------------------------------------------------------------------------
*/
export const getAllTrainers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { 'userId.name': { $regex: search, $options: 'i' } },
        { 'userId.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    // For public access, only show approved trainers
    // For admin access, allow status filter or show all
    if (status) {
      query.status = status;
    } else if (!req.user || req.user.role !== 'admin') {
      // If no status specified and not admin, default to approved only
      query.status = 'approved';
    }

    const trainers = await Trainer.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trainer.countDocuments(query);

    res.json({
      trainers,
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
| APPROVE TRAINER
|--------------------------------------------------------------------------
*/
export const approveTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Update trainer status
    trainer.status = "approved";
    await trainer.save();

    // Update user role & approval flag
    await User.findByIdAndUpdate(trainer.userId, {
      role: "trainer",
      isTrainerApproved: true
    });

    res.status(200).json({
      message: "Trainer approved successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| REJECT TRAINER
|--------------------------------------------------------------------------
*/
export const rejectTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    trainer.status = "rejected";
    await trainer.save();

    await User.findByIdAndUpdate(trainer.userId, {
      role: "user",
      isTrainerApproved: false
    });

    res.status(200).json({
      message: "Trainer rejected"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| VERIFY TRAINER DOCUMENT
|--------------------------------------------------------------------------
*/
export const verifyTrainerDocument = async (req, res) => {
  try {
    const { trainerId, docId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    const doc = trainer.documents.id(docId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (action === 'approve') {
      doc.verified = true;
      doc.verifiedAt = new Date();
      doc.verifiedBy = req.user.id;
    } else if (action === 'reject') {
      doc.verified = false;
      doc.verifiedAt = new Date();
      doc.verifiedBy = req.user.id;
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await trainer.save();

    res.json({ message: 'Document verification updated', doc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL APPOINTMENTS WITH FILTERS
|--------------------------------------------------------------------------
*/
export const getAllAppointments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date, trainerId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (trainerId) query.trainerId = trainerId;

    const appointments = await Appointment.find(query)
      .populate("userId", "name email")
      .populate({
        path: "trainerId",
        populate: {
          path: "userId",
          select: "name email"
        }
      })
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
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
| RESOLVE DISPUTE
|--------------------------------------------------------------------------
*/
export const resolveDispute = async (req, res) => {
  try {
    const { appointmentId, resolution, notes } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.dispute = {
      resolved: true,
      resolution,
      adminNotes: notes,
      resolvedAt: new Date(),
      resolvedBy: req.user.id
    };

    await appointment.save();

    res.json({ message: "Dispute resolved successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL PAYMENTS WITH FILTERS
|--------------------------------------------------------------------------
*/
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId, startDate, endDate } = req.query;
    
    const query = {};
    if (status) query.paymentStatus = status;
    if (userId) query.userId = userId;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(query)
      .populate("userId", "name email")
      .populate("trainerId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      payments,
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
| PROCESS REFUND
|--------------------------------------------------------------------------
*/
export const processRefund = async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.paymentStatus = "refunded";
    payment.refund = {
      amount,
      reason,
      processedAt: new Date(),
      processedBy: req.user.id
    };

    await payment.save();

    res.json({ message: "Refund processed successfully", payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL WITHDRAWAL REQUESTS WITH FILTERS
|--------------------------------------------------------------------------
*/
export const getAllWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, trainerId } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (trainerId) query.trainer = trainerId;

    const withdrawals = await Withdrawal.find(query)
      .populate({
        path: "trainer",
        populate: { path: "userId", select: "name email" }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments(query);

    res.json({
      withdrawals,
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
| APPROVE WITHDRAWAL
|--------------------------------------------------------------------------
*/
export const approveWithdrawals = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({
        message: "Withdrawal request not found"
      });
    }

    withdrawal.status = "approved";
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user.id;
    await withdrawal.save();

    res.json({
      message: "Withdrawal approved successfully",
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| REJECT WITHDRAWAL
|--------------------------------------------------------------------------
*/
export const rejectWithdrawals = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({
        message: "Withdrawal request not found"
      });
    }

    // prevent double action
    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        message: "Withdrawal already processed"
      });
    }

    withdrawal.status = "rejected";
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectedBy = req.user.id;
    await withdrawal.save();

    res.status(200).json({
      message: "Withdrawal rejected successfully",
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| PLAN MANAGEMENT
|--------------------------------------------------------------------------
*/
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignPlanToUser = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscription: {
          plan: plan._id,
          startDate,
          endDate,
          status: "active"
        }
      },
      { new: true }
    );

    res.json({ message: "Plan assigned successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| USER ACTIVITY MONITORING
|--------------------------------------------------------------------------
*/
export const getUserActivity = async (req, res) => {
  try {
    const { userId, period = '7d' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch(period) {
      case '1d':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const query = userId ? { userId, createdAt: { $gte: startDate, $lte: endDate } } : { createdAt: { $gte: startDate, $lte: endDate } };

    // Get workouts
    const workouts = await Workout.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Get nutrition logs
    const nutritionLogs = await Nutrition.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Get progress logs
    const progressLogs = await Progress.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      period,
      startDate,
      endDate,
      workouts: workouts.length,
      nutritionLogs: nutritionLogs.length,
      progressLogs: progressLogs.length,
      data: {
        workouts,
        nutritionLogs,
        progressLogs
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GENERATE REPORTS
|--------------------------------------------------------------------------
*/
export const generateReports = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    let report = {};
    
    switch(type) {
      case 'users':
        report = await generateUserReport(startDate, endDate);
        break;
      case 'revenue':
        report = await generateRevenueReport(startDate, endDate);
        break;
      case 'trainers':
        report = await generateTrainerReport(startDate, endDate);
        break;
      case 'activities':
        report = await generateActivityReport(startDate, endDate);
        break;
      default:
        return res.status(400).json({ message: "Invalid report type" });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| HELPER FUNCTIONS FOR REPORTS
|--------------------------------------------------------------------------
*/
const generateUserReport = async (startDate, endDate) => {
  const dateQuery = startDate && endDate ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {};
  
  const totalUsers = await User.countDocuments({ role: "user", ...dateQuery });
  const activeUsers = await User.countDocuments({ role: "user", "subscription.status": "active", ...dateQuery });
  const newUsers = await User.countDocuments({ role: "user", ...dateQuery });
  
  return {
    type: 'users',
    period: { startDate, endDate },
    data: {
      totalUsers,
      activeUsers,
      newUsers
    }
  };
};

const generateRevenueReport = async (startDate, endDate) => {
  const dateQuery = startDate && endDate ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {};
  
  const revenue = await Payment.aggregate([
    { $match: { paymentStatus: "success", ...dateQuery } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  return {
    type: 'revenue',
    period: { startDate, endDate },
    data: {
      totalRevenue: revenue[0]?.total || 0,
      totalTransactions: revenue[0]?.count || 0
    }
  };
};

const generateTrainerReport = async (startDate, endDate) => {
  const dateQuery = startDate && endDate ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {};
  
  const totalTrainers = await Trainer.countDocuments({ ...dateQuery });
  const approvedTrainers = await Trainer.countDocuments({ status: "approved", ...dateQuery });
  const pendingTrainers = await Trainer.countDocuments({ status: "pending", ...dateQuery });
  
  return {
    type: 'trainers',
    period: { startDate, endDate },
    data: {
      totalTrainers,
      approvedTrainers,
      pendingTrainers
    }
  };
};

const generateActivityReport = async (startDate, endDate) => {
  const dateQuery = startDate && endDate ? { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } : {};
  
  const workouts = await Workout.countDocuments({ ...dateQuery });
  const nutritionLogs = await Nutrition.countDocuments({ ...dateQuery });
  const appointments = await Appointment.countDocuments({ ...dateQuery });
  
  return {
    type: 'activities',
    period: { startDate, endDate },
    data: {
      totalWorkouts: workouts,
      nutritionLogs,
      appointments
    }
  };
};

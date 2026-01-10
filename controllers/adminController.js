import User from "../models/User.js";
import Trainer from "../models/Trainer.js";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";
import Withdrawal from "../models/Withdrawal.js";
import Plan from "../models/Plan.js";


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

    res.json({
      totalUsers,
      totalTrainers,
      pendingTrainers,
      appointments,
      payments,
      pendingWithdrawals,
      plans
    
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
| Admin can view all registered users
*/
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
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
| GET ALL TRAINERS (APPROVED + PENDING)
|--------------------------------------------------------------------------
| Admin can view all trainers
*/
export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .populate("userId", "name email"); // 🔥 THIS IS KEY

    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const approveTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // 1️⃣ Update trainer status
    trainer.status = "approved";
    await trainer.save();

    // 2️⃣ Update user role & approval flag
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
| GET ALL APPOINTMENTS
|--------------------------------------------------------------------------
| Admin monitors all appointments
*/
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("userId", "name email")
      .populate({
        path: "trainerId",
        populate: {
          path: "userId",
          select: "name email"
        }
      });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL PAYMENTS
|--------------------------------------------------------------------------
| Admin monitors all payments
*/
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name email")
       .populate("trainerId", "name email")
      .sort({ createdAt: -1});

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL WITHDRAWAL REQUESTS
|--------------------------------------------------------------------------
| Admin reviews trainer withdrawal requests
*/
export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("trainer", "name email");

    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| APPROVE WITHDRAWAL (ADMIN ONLY)
|--------------------------------------------------------------------------
| Releases trainer withdrawal
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
| ADMIN – REJECT WITHDRAWAL
|--------------------------------------------------------------------------
*/
export const rejectWithdrawal = async (req, res) => {
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
    await withdrawal.save();

    res.status(200).json({
      message: "Withdrawal rejected successfully",
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PLANS
export const getPlans = async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
};

// CREATE PLAN
export const createPlan = async (req, res) => {
  const plan = await Plan.create(req.body);
  res.status(201).json(plan);
};

// UPDATE PLAN
export const updatePlan = async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(plan);
};

// DELETE PLAN
export const deletePlan = async (req, res) => {
  await Plan.findByIdAndDelete(req.params.id);
  res.json({ message: "Plan deleted" });
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
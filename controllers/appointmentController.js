import Appointment from "../models/Appointment.js";
import { createNotification } from "./notificationController.js";
import Payment from "../models/Payment.js";
/*
|--------------------------------------------------------------------------
| CREATE APPOINTMENT (USER)
|--------------------------------------------------------------------------
| User books an appointment with a trainer
| Status is set to "pending"
*/
export const createAppointment = async (req, res) => {
  try {
    // ✅ FIXED FIELD NAMES
    const { trainerId, date, time } = req.body;

    if (!trainerId || !date || !time) {
      return res.status(400).json({
        message: "Trainer, date and time are required"
      });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,   // ✅ FIXED
      trainerId,              // ✅ FIXED
      date,
      time,
      status: "pending"
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
|--------------------------------------------------------------------------
| GET USER APPOINTMENTS
|--------------------------------------------------------------------------
| Logged-in user can see their appointments
*/
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userId: req.user._id
    })
      .populate({
        path: "trainerId",
        populate: {
          path: "userId",
          select: "name email"
        }
      })
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| APPROVE APPOINTMENT (ADMIN / TRAINER)
|--------------------------------------------------------------------------
| Updates status to approved
| Creates notification for user
*/
export const approveAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    appointment.status = "approved";
    await appointment.save();

    // 🔔 Create notification for user
    await createNotification(
      appointment.userId,
      "Your appointment has been approved"
    );

    res.json({
      message: "Appointment approved successfully",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| REJECT APPOINTMENT (ADMIN / TRAINER)
|--------------------------------------------------------------------------
| Updates status to rejected
| Creates notification for user
*/
export const rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    appointment.status = "rejected";
    await appointment.save();

    // 🔔 Create notification
    await createNotification(
      appointment.user,
      "Your appointment has been rejected"
    );

    res.json({
      message: "Appointment rejected",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| COMPLETE APPOINTMENT (TRAINER / ADMIN)
|--------------------------------------------------------------------------
| Marks appointment as completed
| Releases payment
| Creates notification
*/
export const completeAppointment = async (req, res) => {
  try {
    // 1️⃣ Find appointment
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    // 2️⃣ Mark completed
    appointment.status = "completed";
    await appointment.save();

    // 3️⃣ Release payment
    await Payment.findOneAndUpdate(
      { appointment: appointment._id },
      { released: true }
    );

    // 4️⃣ Notify user
    await createNotification(
      appointment.user,
      "Your training session has been completed"
    );

    res.json({
      message: "Appointment completed and payment released",
      appointment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
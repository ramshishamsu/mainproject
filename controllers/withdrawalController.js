import Withdrawal from "../models/Withdrawal.js";
import Trainer from "../models/Trainer.js";

/*
|--------------------------------------------------------------------------
| REQUEST WITHDRAWAL (TRAINER)
|--------------------------------------------------------------------------
*/
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Withdrawal amount is required"
      });
    }

    // find trainer profile
    const trainer = await Trainer.findOne({ email: req.user.email });

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer profile not found"
      });
    }

    const withdrawal = await Withdrawal.create({
      trainer: trainer._id,
      amount
    });

    res.status(201).json({
      message: "Withdrawal request submitted",
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

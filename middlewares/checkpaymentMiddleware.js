import Payment from "../models/Payment.js";

export const checkPayment = async (req, res, next) => {
  const payment = await Payment.findOne({
    user: req.user._id,
    status: "success"
  });

  if (!payment) {
    return res.status(403).json({
      message: "Payment required to access this feature"
    });
  }

  next();
};

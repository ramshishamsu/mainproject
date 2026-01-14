import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";

/*
|--------------------------------------------------------------------------
| GET MY SUBSCRIPTION (USER)
|--------------------------------------------------------------------------
*/
export const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: "active"
    }).populate("planId");

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Progress from "../models/Progress.js";

/*
|--------------------------------------------------------------------------
| LOG PROGRESS
|--------------------------------------------------------------------------
| - User logs body measurements and performance
| - Supports multiple measurement types
*/
export const logProgress = async (req, res) => {
  try {
    const { 
      date, 
      measurements, 
      performance, 
      notes, 
      photos 
    } = req.body;

    if (!date) {
      return res.status(400).json({
        message: "Date is required"
      });
    }

    const progress = await Progress.create({
      user: req.user._id,
      date: new Date(date),
      measurements: measurements || {},
      performance: performance || {},
      notes: notes || ""
    });

    res.status(201).json({
      message: "Progress logged successfully",
      progress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET PROGRESS LOGS
|--------------------------------------------------------------------------
| - Get user's progress history
| - Support filtering and pagination
*/
export const getProgressLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      startDate, 
      endDate, 
      measurementType,
      userId
    } = req.query;

    // Determine which user's progress to fetch
    // Trainers and admins may request progress for a specific user via ?userId
    let targetUser;
    if (userId && (req.user.role === 'trainer' || req.user.role === 'admin')) {
      targetUser = userId;
    } else {
      targetUser = req.user._id;
    }

    // Build filter
    const filter = { user: targetUser };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (measurementType) {
      filter["measurements.weight"] = measurementType === "weight";
      filter["measurements.bodyFat"] = measurementType === "body_fat";
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const progressLogs = await Progress.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Progress.countDocuments(filter);

    res.json({
      progressLogs,
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
| GET PROGRESS DETAILS
|--------------------------------------------------------------------------
| - Get specific progress entry
*/
export const getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    
    if (!progress) {
      return res.status(404).json({ message: "Progress log not found" });
    }

    // Check ownership
    if (progress.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PROGRESS LOG
|--------------------------------------------------------------------------
| - Update existing progress entry
*/
export const updateProgress = async (req, res) => {
  try {
    const { date, measurements, performance, notes, photos } = req.body;
    
    const progress = await Progress.findById(req.params.id);
    
    if (!progress) {
      return res.status(404).json({ message: "Progress log not found" });
    }

    // Check ownership
    if (progress.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedProgress = await Progress.findByIdAndUpdate(
      req.params.id,
      {
        date: date || progress.date,
        measurements: measurements || progress.measurements,
        performance: performance || progress.performance,
        notes: notes !== undefined ? notes : progress.notes,
        photos: photos !== undefined ? photos : progress.photos
      },
      { new: true }
    );

    res.json({
      message: "Progress log updated successfully",
      progress: updatedProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| ADD PROGRESS PHOTOS
|--------------------------------------------------------------------------
| - Add progress photos
*/
export const addProgressPhoto = async (req, res) => {
  try {
    const { progressId, photoUrl, category, notes } = req.body;

    if (!progressId || !photoUrl) {
      return res.status(400).json({
        message: "Progress ID and photo URL are required"
      });
    }

    // Add photo to existing progress
    const progress = await Progress.findById(progressId);
    
    if (!progress) {
      return res.status(404).json({ message: "Progress log not found" });
    }

    // Check ownership
    if (progress.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const newPhoto = {
      type: String,
      required: true
    };
    
    const date = new Date();
    
    const updatedProgress = await Progress.findByIdAndUpdate(
      progressId,
      {
        $push: {
          photos: {
            type: newPhoto,
            required: true,
            date: date,
            category: category || "progress",
            notes: notes || ""
          }
        }
      },
      { new: true }
    );

    res.json({
      message: "Progress photo added successfully",
      progress: updatedProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PROGRESS LOG
|--------------------------------------------------------------------------
| - Delete progress entry
*/
export const deleteProgress = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    
    if (!progress) {
      return res.status(404).json({ message: "Progress log not found" });
    }

    // Check ownership
    if (progress.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Progress.findByIdAndDelete(req.params.id);

    res.json({ message: "Progress log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET PROGRESS ANALYTICS
|--------------------------------------------------------------------------
| - Generate progress analytics and insights
*/
export const getProgressAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query; // Last 30 days

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const analytics = await Progress.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          avgWeight: { $avg: "$measurements.weight" },
          avgBodyFat: { $avg: "$measurements.bodyFat" },
          avgMuscleMass: { $avg: "$measurements.muscleMass" },
          totalWorkouts: { $sum: { $ifNull: ["$performance.totalWorkouts", 0] } },
          totalCaloriesBurned: { $sum: { $ifNull: ["$performance.totalCaloriesBurned", 0] } },
          avgEndurance: { $avg: { $ifNull: ["$performance.endurance", 0] } },
          avgStrength: { $avg: { $ifNull: ["$performance.strength", 0] } },
          avgFlexibility: { $avg: { $ifNull: ["$performance.flexibility", 0] } }
        }
      }
    ]);

    // Generate recommendations
    const recommendations = [];
    const data = analytics[0];

    if (data) {
      if (data.avgEndurance !== undefined && data.avgEndurance < 5) {
        recommendations.push({
          type: "increase_intensity",
          description: "Endurance score is low; consider adding more cardio",
          priority: "high"
        });
      }

      if (data.avgStrength !== undefined && data.avgStrength < 5) {
        recommendations.push({
          type: "focus_strength",
          description: "Consider progressive overload and strength training",
          priority: "high"
        });
      }

      // Simple weight guidance based on avgWeight
      if (data.avgWeight !== undefined) {
        if (data.avgWeight > 100) {
          recommendations.push({ type: "weight_management", description: "Review calorie intake and adjust goals", priority: "medium" });
        }
      }
    }

    res.json({
      period: `${days} days`,
      analytics: analytics[0] || {},
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  // Route-compatible aliases for existing exports
  export { logProgress as addProgress, getProgressLogs as getProgress };

import Workout from "../models/Workout.js";
import Exercise from "../models/Exercise.js";
import Trainer from "../models/Trainer.js";


/*
|--------------------------------------------------------------------------
| CREATE WORKOUT LOG (USER)
|--------------------------------------------------------------------------
| - User logs their own workout
| - Supports multiple exercises
*/
export const createWorkout = async (req, res) => {
  try {
    const { title, description, category, difficulty, exercises, date } = req.body;

    if (!title || !exercises || exercises.length === 0) {
      return res.status(400).json({
        message: "Title and at least one exercise are required"
      });
    }

    // Calculate totals
    let totalDuration = 0;
    let totalCalories = 0;

    exercises.forEach(exercise => {
      totalDuration += exercise.duration || 0;
      totalCalories += exercise.calories || 0;
    });

    const workout = await Workout.create({
      user: req.user._id,
      title,
      description,
      category,
      difficulty,
      exercises,
      totalDuration,
      totalCalories,
      date: date || new Date(),
      completed: true
    });

    res.status(201).json({
      message: "Workout logged successfully",
      workout
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET EXERCISE LIBRARY
|--------------------------------------------------------------------------
| - Search and filter exercises
| - Categorized by muscle groups and equipment
*/
export const getExercises = async (req, res) => {
  try {
    const { 
      category, 
      muscleGroups, 
      equipment, 
      difficulty, 
      search,
      page = 1,
      limit = 20 
    } = req.query;

    // Build filter
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (equipment) filter.equipment = { $in: equipment.split(',') };
    if (muscleGroups) filter.muscleGroups = { $in: muscleGroups.split(',') };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const exercises = await Exercise.find(filter)
      .select('name description category subcategory muscleGroups difficulty equipment averageRating')
      .sort({ usageCount: -1, averageRating: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Exercise.countDocuments(filter);

    res.json({
      exercises,
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
| GET WORKOUT DETAILS
|--------------------------------------------------------------------------
| - Get specific workout with exercise details
*/
export const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('trainer', 'name specialization')
      .populate('user', 'name email');

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Check ownership
    if (workout.user._id.toString() !== req.user._id.toString() && 
        workout.trainer?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE WORKOUT
|--------------------------------------------------------------------------
| - Update existing workout
*/
export const updateWorkout = async (req, res) => {
  try {
    const { title, description, category, difficulty, exercises, completed } = req.body;
    
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Check ownership
    if (workout.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Recalculate totals if exercises updated
    let totalDuration = workout.totalDuration;
    let totalCalories = workout.totalCalories;

    if (exercises) {
      totalDuration = 0;
      totalCalories = 0;
      exercises.forEach(exercise => {
        totalDuration += exercise.duration || 0;
        totalCalories += exercise.calories || 0;
      });
    }

    // Update workout
    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      {
        title: title || workout.title,
        description: description || workout.description,
        category: category || workout.category,
        difficulty: difficulty || workout.difficulty,
        exercises: exercises || workout.exercises,
        totalDuration,
        totalCalories,
        completed: completed !== undefined ? completed : workout.completed
      },
      { new: true }
    );

    res.json({
      message: "Workout updated successfully",
      workout: updatedWorkout
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE WORKOUT
|--------------------------------------------------------------------------
| - Delete workout and associated data
*/
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // Check ownership
    if (workout.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Workout.findByIdAndDelete(req.params.id);

    res.json({ message: "Workout deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
|--------------------------------------------------------------------------
| GET USER WORKOUTS (ENHANCED)
|--------------------------------------------------------------------------
| - Get paginated workouts with filtering
*/
export const getMyWorkouts = async (req, res) => {
  try {
    const { completed } = req.query;

    const filter = { user: req.user._id };
    if (completed !== undefined) {
      filter.completed = completed === "true";
    }

    const workouts = await Workout.find(filter)
      .populate({
        path: "trainer",
        populate: {
          path: "userId",
          select: "name"
        }
      })
      .sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markWorkoutCompleted = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    workout.completed = true;
    await workout.save();

    res.json({ message: "Workout marked as completed", workout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
|--------------------------------------------------------------------------
| ASSIGN WORKOUT (TRAINER)
|--------------------------------------------------------------------------
| - Trainer assigns workout to a user
| - Payment is NOT checked here
| - Trainers prepare workouts as part of service
*/
export const assignWorkout = async (req, res) => {
  try {
    const { user, exercise, sets, reps, calories } = req.body;

    if (!user || !exercise) {
      return res.status(400).json({
        message: "User and exercise are required",
      });
    }

    // Find trainer profile using logged-in user's id
    const trainer = await Trainer.findOne({ userId: req.user._id });

    if (!trainer) {
      return res.status(404).json({
        message: "Trainer profile not found",
      });
    }

    const exercisesArr = [
      {
        name: exercise,
        sets: Number(sets) || 0,
        reps: Number(reps) || 0,
        calories: Number(calories) || 0,
      },
    ];

    const workout = await Workout.create({
      user,
      trainer: trainer._id,     // ✅ relation
      title: exercise,          // ✅ clean title
      exercises: exercisesArr,
      totalCalories: exercisesArr.reduce(
        (sum, e) => sum + (e.calories || 0),
        0
      ),
      totalDuration: 0,
      completed: false,
    });

    res.status(201).json({
      message: "Workout assigned successfully",
      workout,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/*
|--------------------------------------------------------------------------
| GET WORKOUTS FOR A USER (TRAINER / ADMIN)
|--------------------------------------------------------------------------
| - Trainers can view workouts they assigned to a user
| - Admins can view any user's workouts
*/
export const getWorkoutsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) return res.status(400).json({ message: 'User ID required' });

    if (req.user.role === 'trainer') {
      const trainer = await Trainer.findOne({ userId: req.user._id });
      if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' });

      const workouts = await Workout.find({ user: userId, trainer: trainer._id })
        .populate('trainer', 'userId')
        .populate('user', 'name email')
        .sort({ date: -1 });

      return res.json({ workouts });
    }

    if (req.user.role === 'admin') {
      const workouts = await Workout.find({ user: userId })
        .populate('trainer', 'userId')
        .populate('user', 'name email')
        .sort({ date: -1 });

      return res.json({ workouts });
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

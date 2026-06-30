import { db } from '../config/db.js';
import { generateWorkout, getAlternatives } from '../utils/workoutData.js';

export const getWorkoutForToday = async (req, res) => {
  const userId = req.user.id;
  const { environment, focus } = req.query; // 'home' | 'gym', focus: 'full_body' | 'push' | 'pull' | 'legs' | 'hiit' | 'mobility' | 'walking'
  
  const now = new Date();
  const currentHour = now.getHours();
  let logDate = new Date();
  if (currentHour < 3) {
    logDate.setDate(logDate.getDate() - 1);
  }
  const dateStr = logDate.toISOString().split('T')[0];

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if workout exists in cache for today
    let cached = await db.get('SELECT * FROM workouts WHERE user_id = ? AND date = ?', [userId, dateStr]);
    
    if (cached) {
      return res.status(200).json({
        date: dateStr,
        exercises: JSON.parse(cached.exercises)
      });
    }

    // Determine workout settings
    const targetEnv = environment || 'home';
    const targetFocus = focus || 'full_body';

    const exercises = generateWorkout(
      user.difficulty,
      user.goal,
      targetEnv,
      targetFocus
    );

    // Save to cache
    await db.run(
      'INSERT OR REPLACE INTO workouts (user_id, date, exercises) VALUES (?, ?, ?)',
      [userId, dateStr, JSON.stringify(exercises)]
    );

    res.status(200).json({
      date: dateStr,
      exercises
    });
  } catch (error) {
    console.error('Workout retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve workout plan' });
  }
};

export const swapExercise = async (req, res) => {
  const userId = req.user.id;
  const { exerciseName, environment } = req.body;

  const now = new Date();
  const currentHour = now.getHours();
  let logDate = new Date();
  if (currentHour < 3) {
    logDate.setDate(logDate.getDate() - 1);
  }
  const dateStr = logDate.toISOString().split('T')[0];

  if (!exerciseName) {
    return res.status(400).json({ error: 'Exercise name to swap is required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    const cached = await db.get('SELECT * FROM workouts WHERE user_id = ? AND date = ?', [userId, dateStr]);
    
    if (!cached) {
      return res.status(404).json({ error: 'No workout generated for today yet' });
    }

    const exercises = JSON.parse(cached.exercises);
    const targetIdx = exercises.findIndex(ex => ex.name === exerciseName);

    if (targetIdx === -1) {
      return res.status(404).json({ error: 'Exercise not found in current workout' });
    }

    const currentEx = exercises[targetIdx];
    const targetEnv = environment || 'home';

    const alternatives = getAlternatives(
      exerciseName,
      currentEx.category || 'push',
      targetEnv,
      user.difficulty
    );

    if (alternatives.length === 0) {
      return res.status(200).json({
        message: 'No suitable alternatives found. Kept original exercise.',
        exercises
      });
    }

    // Select the first alternative and preserve sets/reps if appropriate
    const replacement = alternatives[0];
    const updatedExercise = {
      ...replacement,
      sets: currentEx.sets || replacement.sets,
      reps: currentEx.reps || replacement.reps,
      category: currentEx.category,
      replacedFrom: exerciseName
    };

    exercises[targetIdx] = updatedExercise;

    // Update database cache
    await db.run(
      'UPDATE workouts SET exercises = ? WHERE user_id = ? AND date = ?',
      [JSON.stringify(exercises), userId, dateStr]
    );

    res.status(200).json({
      message: `Swapped '${exerciseName}' with '${updatedExercise.name}'`,
      exercises
    });
  } catch (error) {
    console.error('Swap exercise error:', error);
    res.status(500).json({ error: 'Failed to replace exercise' });
  }
};

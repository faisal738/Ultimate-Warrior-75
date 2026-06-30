import { db } from '../config/db.js';

// Calculate the current challenge status and auto-fail if rules are broken
export const checkChallengeStatus = async (userId) => {
  const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user || user.challenge_status !== 'active') return user;

  const start = new Date(user.challenge_start_date);
  const today = new Date();
  
  // Normalize dates to midnight for clean day calculation
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = todayMidnight - startMidnight;
  const currentDayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // If they reached past day 75, check completion
  if (currentDayNumber > 75) {
    const completedCount = await db.get(
      'SELECT COUNT(*) as count FROM logs WHERE user_id = ? AND is_completed = 1 AND day_number >= 1 AND day_number <= 75',
      [userId]
    );

    if (completedCount.count >= 75) {
      await db.run("UPDATE users SET challenge_status = 'completed' WHERE id = ?", [userId]);
      user.challenge_status = 'completed';
    } else {
      await db.run("UPDATE users SET challenge_status = 'failed', streak_current = 0 WHERE id = ?", [userId]);
      user.challenge_status = 'failed';
      user.streak_current = 0;
    }
    return user;
  }

  // Auto-fail audit check
  // Grace period window: we allow completing yesterday's checklist until 3:00 AM today
  const now = new Date();
  const currentHour = now.getHours();
  
  const yesterday = new Date(todayMidnight);
  yesterday.setDate(yesterday.getDate() - 1);

  let hasFailed = false;

  // We check all days from start date up to:
  // - Yesterday (if we are after 3:00 AM)
  // - Two days ago (if we are before 3:00 AM, in the safety window)
  const checkLimit = new Date(yesterday);
  if (currentHour < 3) {
    checkLimit.setDate(checkLimit.getDate() - 1);
  }

  const allLogs = await db.all('SELECT * FROM logs WHERE user_id = ? ORDER BY date ASC', [userId]);

  let currentDateCheck = new Date(startMidnight);
  while (currentDateCheck <= checkLimit) {
    const dateStr = currentDateCheck.toISOString().split('T')[0];
    const dayLog = allLogs.find(l => l.date === dateStr);
    
    // If they missed logging, or logged but didn't complete all rules -> FAIL
    if (!dayLog || dayLog.is_completed === 0) {
      hasFailed = true;
      break;
    }
    currentDateCheck.setDate(currentDateCheck.getDate() + 1);
  }

  if (hasFailed) {
    await db.run("UPDATE users SET challenge_status = 'failed', streak_current = 0 WHERE id = ?", [userId]);
    user.challenge_status = 'failed';
    user.streak_current = 0;
  }

  return user;
};

export const startChallenge = async (req, res) => {
  const userId = req.user.id;
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.challenge_status === 'active') {
      return res.status(400).json({ error: 'Challenge is already active' });
    }

    // Initialize challenge fields
    await db.run(
      "UPDATE users SET challenge_status = 'active', challenge_start_date = ?, streak_current = 1, streak_longest = CASE WHEN streak_longest < 1 THEN 1 ELSE streak_longest END WHERE id = ?",
      [todayStr, userId]
    );

    // Seed the first day's log entry
    await db.run(
      `INSERT OR REPLACE INTO logs (user_id, date, day_number, created_at)
       VALUES (?, ?, 1, ?)`,
      [userId, todayStr, new Date().toISOString()]
    );

    res.status(200).json({
      message: 'Ultimate Warrior 75 Challenge started successfully!',
      challenge_start_date: todayStr,
      day_number: 1
    });
  } catch (error) {
    console.error('Start challenge error:', error);
    res.status(500).json({ error: 'Failed to start challenge' });
  }
};

export const getTodayLog = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const currentHour = now.getHours();
  
  // Decide which date the user is logging for.
  // If it's before 3:00 AM, they might be finishing up "yesterday"
  let logDate = new Date();
  if (currentHour < 3) {
    logDate.setDate(logDate.getDate() - 1);
  }
  const dateStr = logDate.toISOString().split('T')[0];

  try {
    const user = await checkChallengeStatus(userId);
    if (user.challenge_status !== 'active') {
      return res.status(200).json({
        challenge_status: user.challenge_status,
        message: 'No active challenge. Please start the challenge.',
        log: null
      });
    }

    // Calculate current day number
    const start = new Date(user.challenge_start_date);
    const logDateObj = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const dayNumber = Math.floor((logDateObj - startMidnight) / (1000 * 60 * 60 * 24)) + 1;

    let log = await db.get('SELECT * FROM logs WHERE user_id = ? AND date = ?', [userId, dateStr]);
    
    if (!log) {
      // Create new empty daily log
      await db.run(
        `INSERT INTO logs (user_id, date, day_number, created_at)
         VALUES (?, ?, ?, ?)`,
        [userId, dateStr, dayNumber, new Date().toISOString()]
      );
      log = await db.get('SELECT * FROM logs WHERE user_id = ? AND date = ?', [userId, dateStr]);
    }

    res.status(200).json({
      challenge_status: 'active',
      day_number: dayNumber,
      log
    });
  } catch (error) {
    console.error('Fetch today log error:', error);
    res.status(500).json({ error: 'Failed to retrieve today\'s logs' });
  }
};

export const updateLog = async (req, res) => {
  const userId = req.user.id;
  const {
    outdoor_workout,
    indoor_workout,
    water_drank,
    diet_followed,
    reading_completed,
    salah_fajr,
    salah_dhuhr,
    salah_asr,
    salah_maghrib,
    salah_isha,
    sleep_hours,
    calories,
    mood,
    reflection
  } = req.body;

  const now = new Date();
  const currentHour = now.getHours();
  let logDate = new Date();
  if (currentHour < 3) {
    logDate.setDate(logDate.getDate() - 1);
  }
  const dateStr = logDate.toISOString().split('T')[0];

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.challenge_status !== 'active') {
      return res.status(400).json({ error: 'No active challenge found.' });
    }

    const currentLog = await db.get('SELECT * FROM logs WHERE user_id = ? AND date = ?', [userId, dateStr]);
    if (!currentLog) {
      return res.status(404).json({ error: 'Log sheet not initialized for today.' });
    }

    // Evaluate 75 Hard checklist completion
    // Core Rules: outdoor_workout(1), indoor_workout(1), water_drank(>=3.8), diet_followed(1), reading_completed(1), photo_path(not null), salah(all 5 complete)
    const outWork = outdoor_workout !== undefined ? outdoor_workout : currentLog.outdoor_workout;
    const inWork = indoor_workout !== undefined ? indoor_workout : currentLog.indoor_workout;
    const water = water_drank !== undefined ? water_drank : currentLog.water_drank;
    const diet = diet_followed !== undefined ? diet_followed : currentLog.diet_followed;
    const read = reading_completed !== undefined ? reading_completed : currentLog.reading_completed;
    
    const f = salah_fajr !== undefined ? salah_fajr : currentLog.salah_fajr;
    const d = salah_dhuhr !== undefined ? salah_dhuhr : currentLog.salah_dhuhr;
    const a = salah_asr !== undefined ? salah_asr : currentLog.salah_asr;
    const m = salah_maghrib !== undefined ? salah_maghrib : currentLog.salah_maghrib;
    const i = salah_isha !== undefined ? salah_isha : currentLog.salah_isha;

    // Check if photo is set
    const photo = currentLog.photo_path;

    const allCoreDone = (
      outWork === 1 &&
      inWork === 1 &&
      water >= user.water_target_liters &&
      diet === 1 &&
      read === 1 &&
      photo !== null && photo !== '' &&
      f === 1 && d === 1 && a === 1 && m === 1 && i === 1
    );

    const isCompletedVal = allCoreDone ? 1 : 0;

    await db.run(
      `UPDATE logs 
       SET outdoor_workout = ?, indoor_workout = ?, water_drank = ?, diet_followed = ?, reading_completed = ?, 
           salah_fajr = ?, salah_dhuhr = ?, salah_asr = ?, salah_maghrib = ?, salah_isha = ?, 
           sleep_hours = ?, calories = ?, mood = ?, reflection = ?, is_completed = ?
       WHERE user_id = ? AND date = ?`,
      [
        outWork,
        inWork,
        water,
        diet,
        read,
        f, d, a, m, i,
        sleep_hours !== undefined ? sleep_hours : currentLog.sleep_hours,
        calories !== undefined ? calories : currentLog.calories,
        mood || currentLog.mood,
        reflection || currentLog.reflection,
        isCompletedVal,
        userId,
        dateStr
      ]
    );

    // Update streak if completed
    if (isCompletedVal === 1 && currentLog.is_completed === 0) {
      // Mark as completed, increment streak
      const newStreak = user.streak_current + 1;
      const newLongest = newStreak > user.streak_longest ? newStreak : user.streak_longest;
      await db.run(
        'UPDATE users SET streak_current = ?, streak_longest = ? WHERE id = ?',
        [newStreak, newLongest, userId]
      );
    } else if (isCompletedVal === 0 && currentLog.is_completed === 1) {
      // Reverted from complete to incomplete
      const newStreak = Math.max(0, user.streak_current - 1);
      await db.run(
        'UPDATE users SET streak_current = ? WHERE id = ?',
        [newStreak, userId]
      );
    }

    const updatedLog = await db.get('SELECT * FROM logs WHERE user_id = ? AND date = ?', [userId, dateStr]);
    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

    res.status(200).json({
      message: 'Logs updated successfully',
      log: updatedLog,
      userStreak: updatedUser.streak_current,
      userLongestStreak: updatedUser.streak_longest
    });
  } catch (error) {
    console.error('Update log error:', error);
    res.status(500).json({ error: 'Failed to save changes' });
  }
};

export const getHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const logs = await db.all('SELECT * FROM logs WHERE user_id = ? ORDER BY date DESC', [userId]);
    res.status(200).json({ logs });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve history logs' });
  }
};

export const uploadPhoto = async (req, res) => {
  const userId = req.user.id;
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const now = new Date();
  const currentHour = now.getHours();
  let logDate = new Date();
  if (currentHour < 3) {
    logDate.setDate(logDate.getDate() - 1);
  }
  const dateStr = logDate.toISOString().split('T')[0];

  const photoPath = `/uploads/${req.file.filename}`;

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.challenge_status !== 'active') {
      return res.status(400).json({ error: 'No active challenge' });
    }

    // Check if log is initialized
    let log = await db.get('SELECT * FROM logs WHERE user_id = ? AND date = ?', [userId, dateStr]);
    if (!log) {
      // Calculate current day number
      const start = new Date(user.challenge_start_date);
      const logDateObj = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
      const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const dayNumber = Math.floor((logDateObj - startMidnight) / (1000 * 60 * 60 * 24)) + 1;

      await db.run(
        `INSERT INTO logs (user_id, date, day_number, photo_path, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, dateStr, dayNumber, photoPath, new Date().toISOString()]
      );
    } else {
      await db.run(
        'UPDATE logs SET photo_path = ? WHERE user_id = ? AND date = ?',
        [photoPath, userId, dateStr]
      );
    }

    // Re-evaluate complete log status since photo is now present
    log = await db.get('SELECT * FROM logs WHERE user_id = ? AND date = ?', [userId, dateStr]);
    const outWork = log.outdoor_workout;
    const inWork = log.indoor_workout;
    const water = log.water_drank;
    const diet = log.diet_followed;
    const read = log.reading_completed;
    const f = log.salah_fajr;
    const d = log.salah_dhuhr;
    const a = log.salah_asr;
    const m = log.salah_maghrib;
    const i = log.salah_isha;

    const allCoreDone = (
      outWork === 1 &&
      inWork === 1 &&
      water >= user.water_target_liters &&
      diet === 1 &&
      read === 1 &&
      f === 1 && d === 1 && a === 1 && m === 1 && i === 1
    );

    if (allCoreDone && log.is_completed === 0) {
      await db.run('UPDATE logs SET is_completed = 1 WHERE id = ?', [log.id]);
      const newStreak = user.streak_current + 1;
      const newLongest = newStreak > user.streak_longest ? newStreak : user.streak_longest;
      await db.run(
        'UPDATE users SET streak_current = ?, streak_longest = ? WHERE id = ?',
        [newStreak, newLongest, userId]
      );
    }

    const updatedLog = await db.get('SELECT * FROM logs WHERE id = ?', [log.id]);
    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

    res.status(200).json({
      message: 'Photo uploaded successfully',
      photoPath,
      log: updatedLog,
      userStreak: updatedUser.streak_current
    });
  } catch (error) {
    console.error('Photo upload logging error:', error);
    res.status(500).json({ error: 'Failed to log photo' });
  }
};

export const resetChallenge = async (req, res) => {
  const userId = req.user.id;

  try {
    await db.run(
      "UPDATE users SET challenge_status = 'failed', streak_current = 0, challenge_start_date = NULL WHERE id = ?",
      [userId]
    );
    
    res.status(200).json({
      message: 'Challenge manually reset. Better luck next time!',
      challenge_status: 'failed',
      streak_current: 0
    });
  } catch (error) {
    console.error('Challenge reset error:', error);
    res.status(500).json({ error: 'Failed to reset challenge' });
  }
};

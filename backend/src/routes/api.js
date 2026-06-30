import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { auth } from '../middleware/auth.js';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import {
  startChallenge,
  getTodayLog,
  updateLog,
  getHistory,
  uploadPhoto,
  resetChallenge,
  checkChallengeStatus
} from '../controllers/challengeController.js';
import { getWorkoutForToday, swapExercise } from '../controllers/workoutController.js';
import { getDailyReminder } from '../utils/reminders.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer photo storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `user-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error('Only JPEG, PNG, and WebP image files are allowed.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter
});

// Authentication Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

// Challenge Routes
router.post('/challenge/start', auth, startChallenge);
router.get('/challenge/today', auth, getTodayLog);
router.put('/challenge/log', auth, updateLog);
router.get('/challenge/history', auth, getHistory);
router.post('/challenge/photo', auth, upload.single('photo'), uploadPhoto);
router.post('/challenge/reset', auth, resetChallenge);

// Workouts Routes
router.get('/workout/today', auth, getWorkoutForToday);
router.post('/workout/swap', auth, swapExercise);

// Islamic & Reminders Routes
router.get('/islamic/reminder', auth, async (req, res) => {
  try {
    const user = await checkChallengeStatus(req.user.id);
    
    let day = 1;
    if (user.challenge_status === 'active' && user.challenge_start_date) {
      // Find today's log to see current day number
      const start = new Date(user.challenge_start_date);
      const today = new Date();
      start.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffTime = today - start;
      day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Day bounds protection
    day = Math.max(1, Math.min(75, day));
    const reminder = getDailyReminder(day);
    
    res.status(200).json({
      day,
      reminder
    });
  } catch (error) {
    console.error('Reminder route error:', error);
    res.status(500).json({ error: 'Failed to retrieve daily reminders' });
  }
});

export default router;

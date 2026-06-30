import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_75_hard_muslim_key_2026';

export const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const existing = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();

    const result = await db.run(
      'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)',
      [username, hashedPassword, createdAt]
    );

    const token = jwt.sign({ id: result.id, username }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.id,
        username,
        difficulty: 'intermediate',
        goal: 'maintenance',
        gender: 'men',
        weight: 70.0,
        height: 170.0,
        water_target_liters: 3.8,
        calculation_method: 'ISNA',
        latitude: 21.4225,
        longitude: 39.8262,
        timezone_offset: 3.0,
        timezone: 'Asia/Riyadh',
        streak_current: 0,
        streak_longest: 0,
        challenge_start_date: null,
        challenge_status: 'inactive'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

    const safeUser = { ...user };
    delete safeUser.password;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const safeUser = { ...user };
    delete safeUser.password;

    res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
};

export const updateProfile = async (req, res) => {
  const {
    difficulty,
    goal,
    gender,
    weight,
    height,
    water_target_liters,
    calculation_method,
    latitude,
    longitude,
    timezone_offset,
    timezone
  } = req.body;

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.run(
      `UPDATE users 
       SET difficulty = ?, goal = ?, gender = ?, weight = ?, height = ?, water_target_liters = ?, calculation_method = ?, latitude = ?, longitude = ?, timezone_offset = ?, timezone = ? 
       WHERE id = ?`,
      [
        difficulty || user.difficulty,
        goal || user.goal,
        gender || user.gender,
        weight !== undefined ? weight : user.weight,
        height !== undefined ? height : user.height,
        water_target_liters !== undefined ? water_target_liters : user.water_target_liters,
        calculation_method || user.calculation_method,
        latitude !== undefined ? latitude : user.latitude,
        longitude !== undefined ? longitude : user.longitude,
        timezone_offset !== undefined ? timezone_offset : user.timezone_offset,
        timezone || user.timezone,
        req.user.id
      ]
    );

    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    delete updatedUser.password;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

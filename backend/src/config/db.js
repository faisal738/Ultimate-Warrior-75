import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || 'database.sqlite';
const absoluteDbPath = path.resolve(__dirname, '../../', dbPath);
const dataDir = path.resolve(__dirname, '../../data');

let sqliteDb = null;
let useJsonFallback = false;

// Unified database interface
export const db = {
  run: null,
  get: null,
  all: null,
  init: null,
  isFallback: false
};

// JSON database state if we fallback
const jsonDb = {
  users: [],
  logs: [],
  workouts: []
};

const jsonFilePaths = {
  users: path.join(dataDir, 'users.json'),
  logs: path.join(dataDir, 'logs.json'),
  workouts: path.join(dataDir, 'workouts.json')
};

// Helper to save JSON tables
const saveJsonTable = (table) => {
  try {
    fs.writeFileSync(jsonFilePaths[table], JSON.stringify(jsonDb[table], null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error saving JSON table ${table}:`, error);
  }
};

// Helper to load JSON tables
const loadJsonTables = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  Object.keys(jsonFilePaths).forEach((table) => {
    const filePath = jsonFilePaths[table];
    if (fs.existsSync(filePath)) {
      try {
        jsonDb[table] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (error) {
        console.error(`Error parsing JSON table ${table}, resetting:`, error);
        jsonDb[table] = [];
      }
    } else {
      jsonDb[table] = [];
      saveJsonTable(table);
    }
  });
};

const addColumnIfMissing = () => {
  return new Promise((resolve) => {
    sqliteDb.run("ALTER TABLE users ADD COLUMN timezone_offset REAL DEFAULT 3.0", () => {
      sqliteDb.run("ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'Asia/Riyadh'", () => {
        resolve();
      });
    });
  });
};

// Initialize DB
export const initDb = async () => {
  try {
    console.log('Attempting to initialize SQLite database...');
    const sqlite3Module = await import('sqlite3');
    const sqlite3 = sqlite3Module.default.verbose();

    return new Promise((resolve, reject) => {
      sqliteDb = new sqlite3.Database(absoluteDbPath, async (err) => {
        if (err) {
          console.warn('Failed to connect to SQLite file, falling back to JSON storage:', err.message);
          setupJsonFallback();
          resolve();
        } else {
          console.log('Successfully connected to SQLite database at:', absoluteDbPath);
          try {
            await createTables();
            await addColumnIfMissing();
            setupSqliteApi();
            resolve();
          } catch (tableErr) {
            console.error('Error creating SQLite tables, falling back to JSON:', tableErr);
            setupJsonFallback();
            resolve();
          }
        }
      });
    });
  } catch (err) {
    console.warn('SQLite3 module not available or compilation failed. Using JSON-file fallback:', err.message);
    setupJsonFallback();
  }
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    sqliteDb.serialize(() => {
      // Users table
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          difficulty TEXT DEFAULT 'intermediate',
          goal TEXT DEFAULT 'maintenance',
          gender TEXT DEFAULT 'men',
          weight REAL DEFAULT 70.0,
          height REAL DEFAULT 170.0,
          water_target_liters REAL DEFAULT 3.8,
          calculation_method TEXT DEFAULT 'ISNA',
          latitude REAL DEFAULT 21.4225,
          longitude REAL DEFAULT 39.8262,
          timezone_offset REAL DEFAULT 3.0,
          timezone TEXT DEFAULT 'Asia/Riyadh',
          streak_current INTEGER DEFAULT 0,
          streak_longest INTEGER DEFAULT 0,
          challenge_start_date TEXT,
          challenge_status TEXT DEFAULT 'inactive',
          created_at TEXT NOT NULL
        )
      `, (err) => { if (err) return reject(err); });

      // Daily Logs table
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          day_number INTEGER NOT NULL,
          outdoor_workout INTEGER DEFAULT 0,
          indoor_workout INTEGER DEFAULT 0,
          water_drank REAL DEFAULT 0.0,
          diet_followed INTEGER DEFAULT 0,
          reading_completed INTEGER DEFAULT 0,
          photo_path TEXT,
          salah_fajr INTEGER DEFAULT 0,
          salah_dhuhr INTEGER DEFAULT 0,
          salah_asr INTEGER DEFAULT 0,
          salah_maghrib INTEGER DEFAULT 0,
          salah_isha INTEGER DEFAULT 0,
          sleep_hours REAL DEFAULT 0.0,
          calories INTEGER DEFAULT 0,
          mood TEXT,
          reflection TEXT,
          is_completed INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id),
          UNIQUE(user_id, date)
        )
      `, (err) => { if (err) return reject(err); });

      // Workouts Cache table
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          exercises TEXT NOT NULL,
          FOREIGN KEY(user_id) REFERENCES users(id),
          UNIQUE(user_id, date)
        )
      `, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

const setupSqliteApi = () => {
  db.isFallback = false;
  
  db.run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  };

  db.get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  };

  db.all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  };
};

const setupJsonFallback = () => {
  console.log('Initializing JSON File Fallback DB...');
  useJsonFallback = true;
  db.isFallback = true;
  loadJsonTables();

  // Implement SQLite equivalent operations using pure JS arrays
  db.run = async (sql, params = []) => {
    // Basic SQL parser mocks for queries we'll run
    const lowerSql = sql.toLowerCase().trim();

    if (lowerSql.startsWith('insert into users')) {
      const newUser = {
        id: jsonDb.users.length + 1,
        username: params[0],
        password: params[1],
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
        challenge_status: 'inactive',
        created_at: params[2] || new Date().toISOString()
      };
      
      // Check unique username
      if (jsonDb.users.some(u => u.username === newUser.username)) {
        throw new Error('UNIQUE constraint failed: users.username');
      }
      
      jsonDb.users.push(newUser);
      saveJsonTable('users');
      return { id: newUser.id, changes: 1 };
    }

    if (lowerSql.startsWith('update users')) {
      // Mocks updates based on ID or username
      // Standard query: UPDATE users SET difficulty = ?, goal = ?, gender = ?, weight = ?, height = ?, water_target_liters = ?, calculation_method = ?, latitude = ?, longitude = ? WHERE id = ?
      // Another query: UPDATE users SET streak_current = ?, streak_longest = ?, challenge_start_date = ?, challenge_status = ? WHERE id = ?
      const isSettings = lowerSql.includes('difficulty');
      const isStreak = lowerSql.includes('streak_current');
      const userId = params[params.length - 1]; // user_id is the last param in WHERE clause

      const userIndex = jsonDb.users.findIndex(u => u.id === userId);
      if (userIndex === -1) return { changes: 0 };

      if (isSettings) {
        jsonDb.users[userIndex].difficulty = params[0];
        jsonDb.users[userIndex].goal = params[1];
        jsonDb.users[userIndex].gender = params[2];
        jsonDb.users[userIndex].weight = params[3];
        jsonDb.users[userIndex].height = params[4];
        jsonDb.users[userIndex].water_target_liters = params[5];
        jsonDb.users[userIndex].calculation_method = params[6];
        jsonDb.users[userIndex].latitude = params[7];
        jsonDb.users[userIndex].longitude = params[8];
        jsonDb.users[userIndex].timezone_offset = params[9];
        jsonDb.users[userIndex].timezone = params[10];
      } else if (isStreak) {
        jsonDb.users[userIndex].streak_current = params[0];
        jsonDb.users[userIndex].streak_longest = params[1];
        jsonDb.users[userIndex].challenge_start_date = params[2];
        jsonDb.users[userIndex].challenge_status = params[3];
      } else {
        // generic mapper helper or specific fallback
        console.log('Unrecognized user UPDATE, param count:', params.length);
      }

      saveJsonTable('users');
      return { id: userId, changes: 1 };
    }

    if (lowerSql.startsWith('insert into logs') || lowerSql.startsWith('insert or replace into logs')) {
      // INSERT OR REPLACE INTO logs (user_id, date, day_number, outdoor_workout, ...)
      // Params format: [user_id, date, day_number, outdoor, indoor, water, diet, reading, photo, fajr, dhuhr, asr, maghrib, isha, sleep, calories, mood, reflection, is_completed, created_at]
      const log = {
        id: jsonDb.logs.length + 1,
        user_id: params[0],
        date: params[1],
        day_number: params[2],
        outdoor_workout: params[3],
        indoor_workout: params[4],
        water_drank: params[5],
        diet_followed: params[6],
        reading_completed: params[7],
        photo_path: params[8],
        salah_fajr: params[9],
        salah_dhuhr: params[10],
        salah_asr: params[11],
        salah_maghrib: params[12],
        salah_isha: params[13],
        sleep_hours: params[14],
        calories: params[15],
        mood: params[16],
        reflection: params[17],
        is_completed: params[18],
        created_at: params[19] || new Date().toISOString()
      };

      const existingIndex = jsonDb.logs.findIndex(l => l.user_id === log.user_id && l.date === log.date);
      if (existingIndex !== -1) {
        log.id = jsonDb.logs[existingIndex].id;
        jsonDb.logs[existingIndex] = log;
      } else {
        jsonDb.logs.push(log);
      }
      
      saveJsonTable('logs');
      return { id: log.id, changes: 1 };
    }

    if (lowerSql.startsWith('insert or replace into workouts') || lowerSql.startsWith('insert into workouts')) {
      // INSERT OR REPLACE INTO workouts (user_id, date, exercises) VALUES (?, ?, ?)
      const workout = {
        id: jsonDb.workouts.length + 1,
        user_id: params[0],
        date: params[1],
        exercises: params[2]
      };

      const existingIndex = jsonDb.workouts.findIndex(w => w.user_id === workout.user_id && w.date === workout.date);
      if (existingIndex !== -1) {
        workout.id = jsonDb.workouts[existingIndex].id;
        jsonDb.workouts[existingIndex] = workout;
      } else {
        jsonDb.workouts.push(workout);
      }

      saveJsonTable('workouts');
      return { id: workout.id, changes: 1 };
    }

    console.log('Unhandled raw SQL write run:', sql);
    return { id: 0, changes: 0 };
  };

  db.get = async (sql, params = []) => {
    const lowerSql = sql.toLowerCase().trim();

    if (lowerSql.includes('select * from users where id =')) {
      const id = params[0];
      return jsonDb.users.find(u => u.id === id) || null;
    }

    if (lowerSql.includes('select * from users where username =')) {
      const username = params[0];
      return jsonDb.users.find(u => u.username === username) || null;
    }

    if (lowerSql.includes('select * from logs where user_id =') && lowerSql.includes('date =')) {
      const userId = params[0];
      const date = params[1];
      return jsonDb.logs.find(l => l.user_id === userId && l.date === date) || null;
    }

    if (lowerSql.includes('select * from workouts where user_id =') && lowerSql.includes('date =')) {
      const userId = params[0];
      const date = params[1];
      return jsonDb.workouts.find(w => w.user_id === userId && w.date === date) || null;
    }

    console.log('Unhandled SQL GET query:', sql, params);
    return null;
  };

  db.all = async (sql, params = []) => {
    const lowerSql = sql.toLowerCase().trim();

    if (lowerSql.includes('select * from logs where user_id =') && lowerSql.includes('order by date')) {
      const userId = params[0];
      return jsonDb.logs
        .filter(l => l.user_id === userId)
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    console.log('Unhandled SQL ALL query:', sql, params);
    return [];
  };
};

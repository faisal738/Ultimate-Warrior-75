import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initDb, db } from './config/db.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory serving
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    database: db.isFallback ? 'JSON-Fallback' : 'SQLite3',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Database & Server
const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`=============================================`);
      console.log(` Ultimate Warrior 75 Backend Server Running       `);
      console.log(` Port: ${PORT}                               `);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Database: ${db.isFallback ? 'JSON Fallback' : 'SQLite3 File'}`);
      console.log(` Healthcheck: http://localhost:${PORT}/health`);
      console.log(`=============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

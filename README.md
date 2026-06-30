# ⚜️ Ultimate Warrior 75

Ultimate Warrior 75 is a production-ready Progressive Web App (PWA) designed to help you complete the 75 Hard Challenge while seamlessly keeping your daily routine aligned with Islamic spiritual devotion.

The application features a premium **Obsidian & Burnished Gold-Leaf Chronometer** design language resembling a luxury mechanical watch face.

---

## 🚀 Core Challenge Tasks

Every day, the user must log and complete:
1. 🏃‍♂️ **Outdoor Workout (45 mins)**: Exposed to elements, no shelter.
2. 🏋️‍♂️ **Indoor Workout (45 mins)**: Gym weights, bodyweight, or stretching.
3. 💧 **Drink 1 Gallon (~3.8L) Water**: Tracked via 16 chiseled polygon cups.
4. 🥗 **Follow Diet**: Halal nutrition only. No cheat meals, no alcohol.
5. 📚 **Read 10 Pages**: Scripture, non-fiction, or personal development.
6. 📸 **Daily Progress Photo**: Logged in a gallery calendar view.
7. 🕌 **5 Daily Prayers (Salah)**: Live local timezone countdowns (Fajr, Dhuhr, Asr, Maghrib, Isha).

---

## 🏗️ Folder Structure

```
Ultimate-Warrior-75/
├── backend/
│   ├── src/
│   │   ├── config/db.js     # SQLite3 database + automatic JSON file fallback
│   │   ├── controllers/     # Authentication & Challenge state controllers
│   │   ├── routes/api.js    # Express routing mounts & photo uploads
│   │   └── server.js        # Main API entrypoint (Port 5000)
│   └── database.sqlite      # SQLite database file
│
└── frontend/
    ├── public/
    │   ├── manifest.json    # PWA install specifications
    │   └── sw.js            # Offline service worker cache registry
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx # Mechanical dial progress rings & prayer countdowns
    │   │   ├── Checklist.jsx # Habit loggers & water polygon logger
    │   │   ├── WorkoutGenerator.jsx # Workout builder & audio intervals
    │   │   ├── ProgressGallery.jsx # 75-day grid calendar
    │   │   └── Settings.jsx  # Localized timezone & GPS coordinators
    │   ├── utils/
    │   │   ├── api.js       # Client connection layer with Guest mode fallbacks
    │   │   └── prayer.js    # Offline astronomical prayer time equations
    │   └── App.jsx          # App root state controller
    └── index.html           # Font loads (Cinzel & Plus Jakarta Sans)
```

---

## ⚡ Setup & Run Instructions

### 1. Backend Server
From the `backend/` directory:
```bash
npm install
npm start
```
Starts backend API on `http://localhost:5000/`. Falls back automatically to JSON file storage if native SQLite packages are missing.

### 2. Frontend client
From the `frontend/` directory:
```bash
npm install
npm run dev
```
Starts development server on `http://localhost:5173/`.

### 3. Build for Production
From the `frontend/` directory:
```bash
npm run build
```
Generates production-ready static assets in `frontend/dist/` ready to host on **Vercel** or **Netlify**.

---

## 🎨 Aesthetic Highlights
- **Typography**: Built with **Cinzel Decorative** (logo badge), **Cinzel** (chronometer numbers & section headers), and **Plus Jakarta Sans** (crisp geometric body labels).
- **Obsidian & Gold Mesh Grid**: Dark slate matte backgrounds overlaid with a gold blueprint mesh.
- **Concentric watch dial ticks**: Dashboard rings rotate dynamically, indicating overall completion progress.

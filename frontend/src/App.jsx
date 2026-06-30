import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckSquare, 
  Compass, 
  Calendar, 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  RefreshCw, 
  Sparkles,
  ChevronRight,
  LogOut,
  Moon
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { api, isAuthenticated } from './utils/api.js';
import Dashboard from './components/Dashboard.jsx';
import Checklist from './components/Checklist.jsx';
import WorkoutGenerator from './components/WorkoutGenerator.jsx';
import ProgressGallery from './components/ProgressGallery.jsx';
import Settings from './components/Settings.jsx';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Auth Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Initial Data Load
  const loadData = async () => {
    setLoading(true);
    try {
      // Get profile details (local or remote)
      const profileData = await api.getProfile();
      setUser(profileData.user);

      // Get today's tracking details
      if (profileData.user.challenge_status === 'active') {
        const logData = await api.getTodayLog();
        setTodayLog(logData.log);
        
        const workoutData = await api.getWorkoutForToday();
        setWorkout(workoutData.exercises);
      } else {
        setTodayLog(null);
        setWorkout(null);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('Service Worker registered successfully:', reg.scope))
          .catch((err) => console.warn('Service Worker registration failed:', err));
      });
    }
  }, []);

  // Watch for checklist completeness to fire confetti
  useEffect(() => {
    if (todayLog && todayLog.is_completed === 1) {
      triggerConfetti();
    }
  }, [todayLog?.is_completed]);

  const triggerConfetti = () => {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // Confetti burst from edges
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!username || !password) {
      setAuthError('All fields are required');
      return;
    }

    try {
      if (authMode === 'login') {
        await api.login(username, password);
      } else {
        await api.register(username, password);
      }
      setShowAuthModal(false);
      setUsername('');
      setPassword('');
      await loadData();
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setTodayLog(null);
    setWorkout(null);
    loadData();
  };

  const handleStartChallenge = async () => {
    setLoading(true);
    try {
      await api.startChallenge();
      await loadData();
      setPage('checklist');
    } catch (err) {
      alert(err.message || 'Failed to start challenge');
    } finally {
      setLoading(false);
    }
  };

  const updateLogState = async (updatedFields) => {
    try {
      const result = await api.updateLog(updatedFields);
      setTodayLog(result.log);
      setUser(prev => ({
        ...prev,
        streak_current: result.userStreak,
        streak_longest: result.userLongestStreak !== undefined ? result.userLongestStreak : prev.streak_longest
      }));
    } catch (err) {
      console.error('Failed to save log details:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-height-screen flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080C15' }}>
        <div style={{ textAlign: 'center' }}>
          <Flame size={48} className="text-emerald-500 animate-pulse" style={{ color: '#10B981', animation: 'pulse-glow 1.5s infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#94A3B8', fontSize: '1.25rem', fontWeight: 600 }}>Loading Ultimate Warrior 75...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Banner Navigation */}
      <header className="glass-panel" style={{ margin: '1rem', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame size={28} style={{ color: '#10B981' }} />
          <span className="brand-logo" style={{ fontSize: '1.5rem', letterSpacing: '0.05em' }}>Ultimate Warrior 75</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user && user.challenge_status === 'active' && (
            <div className="streak-badge">
              <Flame size={16} style={{ marginRight: '0.25rem', fill: '#F59E0B' }} />
              Day {todayLog?.day_number || 1}
            </div>
          )}
          
          {user && user.username !== 'Guest Warrior' ? (
            <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
              <LogOut size={14} /> Sign Out
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
              <User size={14} /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Pages Content container */}
      <main className="container" style={{ flexGrow: 1, padding: '0 1rem 2rem' }}>
        {user?.challenge_status !== 'active' && page !== 'settings' ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem', margin: '2rem auto', maxWidth: '600px' }}>
            <Sparkles size={48} style={{ color: '#F59E0B', margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>Forge Peak Discipline</h2>
            <p style={{ color: '#94A3B8', marginBottom: '2rem', lineHeight: 1.6 }}>
              Welcome to the Ultimate Warrior 75 challenge. Push your physical boundaries with two 45-minute daily workouts and pure halal eating, while grounding your soul in 5 daily prayers, deep scriptural reading, and dynamic reflections.
            </p>
            <button className="btn btn-primary pulsing-btn" onClick={handleStartChallenge} style={{ fontSize: '1.1rem', padding: '1rem 2rem', borderRadius: '2rem' }}>
              Start Challenge <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard user={user} log={todayLog} workout={workout} />}
            {page === 'checklist' && <Checklist user={user} log={todayLog} updateLog={updateLogState} reloadData={loadData} />}
            {page === 'workouts' && <WorkoutGenerator user={user} workout={workout} setWorkout={setWorkout} />}
            {page === 'gallery' && <ProgressGallery user={user} />}
            {page === 'settings' && <Settings user={user} reloadData={loadData} />}
          </>
        )}
      </main>

      {/* Bottom Sticky Tab Navigation Bar */}
      <nav className="glass-panel" style={{ position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem', height: '4.25rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0 0.5rem', borderRadius: '1.25rem', zIndex: 999 }}>
        <button 
          onClick={() => setPage('dashboard')} 
          style={{ background: 'none', border: 'none', color: page === 'dashboard' ? '#10B981' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
        >
          <Flame size={20} style={{ marginBottom: '0.25rem', strokeWidth: page === 'dashboard' ? 2.5 : 2 }} />
          Dashboard
        </button>
        
        <button 
          onClick={() => setPage('checklist')} 
          style={{ background: 'none', border: 'none', color: page === 'checklist' ? '#10B981' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
        >
          <CheckSquare size={20} style={{ marginBottom: '0.25rem', strokeWidth: page === 'checklist' ? 2.5 : 2 }} />
          Checklist
        </button>

        <button 
          onClick={() => setPage('workouts')} 
          style={{ background: 'none', border: 'none', color: page === 'workouts' ? '#10B981' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
        >
          <Compass size={20} style={{ marginBottom: '0.25rem', strokeWidth: page === 'workouts' ? 2.5 : 2 }} />
          Workouts
        </button>

        <button 
          onClick={() => setPage('gallery')} 
          style={{ background: 'none', border: 'none', color: page === 'gallery' ? '#10B981' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
        >
          <Calendar size={20} style={{ marginBottom: '0.25rem', strokeWidth: page === 'gallery' ? 2.5 : 2 }} />
          History
        </button>

        <button 
          onClick={() => setPage('settings')} 
          style={{ background: 'none', border: 'none', color: page === 'settings' ? '#10B981' : '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.75rem', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
        >
          <SettingsIcon size={20} style={{ marginBottom: '0.25rem', strokeWidth: page === 'settings' ? 2.5 : 2 }} />
          Settings
        </button>
      </nav>

      {/* Authentication Modal Overlay */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 12, 21, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>
              {authMode === 'login' ? 'Welcome Back' : 'Join the Challenge'}
            </h3>
            
            {authError && <div style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#F43F5E', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{authError}</div>}

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.35rem' }}>Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block', marginBottom: '0.35rem' }}>Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#94A3B8' }}>
              {authMode === 'login' ? (
                <span>New here? <button style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('register')}>Create an account</button></span>
              ) : (
                <span>Already registered? <button style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('login')}>Log in</button></span>
              )}
            </div>

            <button 
              onClick={() => setShowAuthModal(false)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '1.25rem' }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

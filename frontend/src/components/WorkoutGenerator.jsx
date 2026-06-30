import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Play, 
  Pause, 
  RotateCcw, 
  RefreshCw, 
  Plus, 
  Check, 
  Clock, 
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { api } from '../utils/api.js';

export default function WorkoutGenerator({ user, workout, setWorkout }) {
  // Config form states
  const [environment, setEnvironment] = useState('home');
  const [focus, setFocus] = useState('full_body');
  const [swapping, setSwapping] = useState('');
  
  // Timer States
  const [timeRemaining, setTimeRemaining] = useState(45 * 60); // 45 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  // Load or generate today's workout
  const handleGenerate = async () => {
    try {
      const response = await api.getWorkoutForToday(environment, focus);
      setWorkout(response.exercises);
    } catch (error) {
      console.error('Failed to generate workout:', error);
    }
  };

  // Swap exercise action
  const handleSwap = async (exerciseName) => {
    setSwapping(exerciseName);
    try {
      const response = await api.swapExercise(exerciseName, environment);
      setWorkout(response.exercises);
      playSynthBeep(660, 0.15); // soft success chime
    } catch (error) {
      console.error('Failed to swap exercise:', error);
    } finally {
      setSwapping('');
    }
  };

  // Synthesize chimes/beeps for timer (no external asset needed)
  const playSynthBeep = (freq = 440, duration = 0.2) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
      
      // Smooth volume fade-out
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('AudioContext failed:', e.message);
    }
  };

  // Timer Ticker Loop
  useEffect(() => {
    if (timerRunning) {
      const id = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            clearInterval(id);
            playSynthBeep(880, 1.0); // loud completion beep
            return 0;
          }
          // Beep at intervals (e.g. half time, 10 min left, 1 min left)
          if (prev === 22.5 * 60) playSynthBeep(523, 0.4); // halfway chime
          if (prev === 60) playSynthBeep(440, 0.5); // 1 minute warning
          
          return prev - 1;
        });
      }, 1000);
      setTimerIntervalId(id);
      return () => clearInterval(id);
    } else {
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
    }
  }, [timerRunning]);

  // Clean timer cleanup
  useEffect(() => {
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [timerIntervalId]);

  const handleStartPause = () => {
    if (!timerRunning) {
      playSynthBeep(523, 0.1); // play click
    } else {
      playSynthBeep(349, 0.1); // pause click
    }
    setTimerRunning(!timerRunning);
  };

  const handleResetTimer = () => {
    playSynthBeep(440, 0.1);
    setTimerRunning(false);
    setTimeRemaining(45 * 60);
  };

  // Timer format helpers
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Timer Progress Arc (concentric circle representation)
  const timerPercent = (timeRemaining / (45 * 60)) * 100;
  const radius = 90;
  const circum = 2 * Math.PI * radius;
  const offset = circum - (timerPercent / 100) * circum;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personalized Workouts</span>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>Workout Generator</h2>
        </div>
      </div>

      {/* Generator setup panel */}
      {!workout ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <Compass size={40} style={{ color: '#10B981', margin: '0 auto 1.25rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>Generate 45m Workout Plan</h3>
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Get a tailored list of exercises balanced for your physical level ({user?.difficulty}) and goal ({user?.goal}).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', textAlign: 'left', marginBottom: '1.5rem' }} className="grid-responsive-two">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Training Environment</label>
              <select className="form-select" value={environment} onChange={e => setEnvironment(e.target.value)}>
                <option value="home">Home (Bodyweight & Bands)</option>
                <option value="gym">Gym (Weights & Cables)</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Workout Target Focus</label>
              <select className="form-select" value={focus} onChange={e => setFocus(e.target.value)}>
                <option value="full_body">Full Body (General strength)</option>
                <option value="push">Push (Chest, Shoulders, Triceps)</option>
                <option value="pull">Pull (Back, Biceps)</option>
                <option value="legs">Legs & Glutes</option>
                <option value="hiit">HIIT (High Intensity Cardio)</option>
                <option value="mobility">Mobility & Yoga Flow</option>
                <option value="walking">Outdoor Power Walk</option>
                <option value="running">Outdoor Jogging/Sprints</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleGenerate} style={{ width: '100%', maxWidth: '280px' }}>
            Generate Custom Workout
          </button>
        </div>
      ) : (
        <>
          {/* Active Workout Exercises List Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} style={{ color: '#10B981' }} />
                Today's Custom Routine
              </h3>
              <button className="btn btn-secondary" onClick={() => setWorkout(null)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}>
                Re-Generate Plan
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {workout.map((ex, index) => {
                const isWarmCool = ex.name.toLowerCase().includes('warm') || ex.name.toLowerCase().includes('stretch');
                return (
                  <div key={index} className="workout-card">
                    <div style={{ flexGrow: 1, paddingRight: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#F8FAFC' }}>{ex.name}</h4>
                        {ex.replacedFrom && (
                          <span style={{ fontSize: '0.7rem', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.08)', padding: '0.1rem 0.35rem', borderRadius: '0.25rem' }}>
                            Swapped
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem' }}>{ex.description}</p>
                      
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        {ex.sets && <span style={{ fontSize: '0.75rem', color: '#10B981', background: 'rgba(16, 185, 129, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>{ex.sets} Sets</span>}
                        {ex.reps && <span style={{ fontSize: '0.75rem', color: '#06B6D4', background: 'rgba(6, 182, 212, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>{ex.reps}</span>}
                        {ex.duration && <span style={{ fontSize: '0.75rem', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.08)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>{ex.duration}</span>}
                      </div>
                    </div>
                    
                    {!isWarmCool && (
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleSwap(ex.name)}
                        disabled={swapping === ex.name}
                        style={{ padding: '0.4rem', borderRadius: '0.5rem', flexShrink: 0 }}
                        title="Swap Exercise"
                      >
                        {swapping === ex.name ? (
                          <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        ) : (
                          <RefreshCw size={14} />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 45-Minute In-App Workout Timer Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} style={{ color: '#06B6D4' }} />
              75 Hard Workout Timer
            </h3>

            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
              <svg width="200" height="200">
                <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                <circle 
                  cx="100" 
                  cy="100" 
                  r={radius} 
                  fill="none" 
                  stroke={timeRemaining < 60 ? '#F43F5E' : '#06B6D4'} 
                  strokeWidth="10" 
                  strokeDasharray={circum}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.5s' }}
                />
              </svg>
              
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{formatTime(timeRemaining)}</span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                  {timerRunning ? 'Session Active' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Timer controls */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%', maxWidth: '280px' }}>
              <button 
                onClick={handleResetTimer} 
                className="btn btn-secondary" 
                style={{ flex: 1 }}
              >
                <RotateCcw size={16} /> Reset
              </button>
              
              <button 
                onClick={handleStartPause} 
                className="btn btn-primary" 
                style={{ flex: 2, background: timerRunning ? '#F43F5E' : '#10B981' }}
              >
                {timerRunning ? <Pause size={16} /> : <Play size={16} />}
                {timerRunning ? 'Pause' : 'Start Timer'}
              </button>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (min-width: 768px) {
          .grid-responsive-two {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}} />

    </div>
  );
}

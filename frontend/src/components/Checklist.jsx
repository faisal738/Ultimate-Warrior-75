import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Check, 
  Flame, 
  Droplet, 
  BookOpen, 
  ShieldCheck, 
  Heart, 
  Sparkles,
  Upload,
  Calendar,
  Smile
} from 'lucide-react';
import { api } from '../utils/api.js';

export default function Checklist({ user, log, updateLog, reloadData }) {
  const fileInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [bookTitle, setBookTitle] = useState(localStorage.getItem('75hm_book_title') || '');

  if (!log) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', margin: '2rem 0' }}>
        <p style={{ color: '#94A3B8' }}>Challenge logs not active. Go to Dashboard to start.</p>
      </div>
    );
  }

  // Toggles for binary flags
  const handleToggle = (field, currentVal) => {
    const newVal = currentVal === 1 ? 0 : 1;
    updateLog({ [field]: newVal });
  };

  // Water calculations
  // 1 Gallon is 3.8L. 16 cups of 240ml is 3.84L. Tapping cups changes log.water_drank.
  const cupsCount = 16;
  const cupVolumeLiters = 0.24;
  const waterTarget = user?.water_target_liters || 3.8;
  const filledCups = Math.min(cupsCount, Math.round((log.water_drank || 0) / cupVolumeLiters));

  const handleCupClick = (index) => {
    // If user clicked cup 5, fill up to cup 5. If clicked cup 5 again and it's the last filled, reduce.
    let newCups;
    if (index + 1 === filledCups) {
      newCups = index; // toggle last off
    } else {
      newCups = index + 1; // fill up to here
    }
    
    const newLiters = parseFloat((newCups * cupVolumeLiters).toFixed(2));
    updateLog({ water_drank: newLiters });
  };

  // Book title state save
  const handleBookTitleChange = (e) => {
    const val = e.target.value;
    setBookTitle(val);
    localStorage.setItem('75hm_book_title', val);
  };

  // File Upload handling
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoUploading(true);
    try {
      const response = await api.uploadPhoto(file);
      await reloadData(); // Reload profile & logs to update preview path
    } catch (error) {
      alert(error.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Photo directory helper
  const getPhotoUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('data:image')) return path; // Guest mode base64
    return `http://localhost:5000${path}`;
  };

  // Mood options
  const moods = [
    { emoji: '😢', name: 'sad' },
    { emoji: '😐', name: 'neutral' },
    { emoji: '🙂', name: 'good' },
    { emoji: '🤩', name: 'excellent' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Rules Tracker</span>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>Day {log.day_number} Checklist</h2>
        </div>
        <div style={{ background: log.is_completed === 1 ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', color: log.is_completed === 1 ? '#10B981' : '#64748B', border: `1px solid ${log.is_completed === 1 ? '#10B981' : 'var(--card-border)'}`, padding: '0.35rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {log.is_completed === 1 ? '✓ Day Complete' : 'Incomplete'}
        </div>
      </div>

      {/* The 75 Hard Core Rules */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} style={{ color: '#10B981' }} />
          Core Challenge Tasks
        </h3>

        {/* Outdoor Workout */}
        <div 
          className={`checklist-card glass-panel ${log.outdoor_workout === 1 ? 'checked' : ''}`}
          onClick={() => handleToggle('outdoor_workout', log.outdoor_workout)}
        >
          <div className="checkbox-custom">
            <Check />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Outdoor Workout (45 min)</h4>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.15rem' }}>Must be outdoors, exposed to elements, no cover.</p>
          </div>
        </div>

        {/* Indoor Workout */}
        <div 
          className={`checklist-card glass-panel ${log.indoor_workout === 1 ? 'checked' : ''}`}
          onClick={() => handleToggle('indoor_workout', log.indoor_workout)}
        >
          <div className="checkbox-custom">
            <Check />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Indoor Workout (45 min)</h4>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.15rem' }}>Gym weights, home bodyweight, or stretching session.</p>
          </div>
        </div>

        {/* Diet Followed */}
        <div 
          className={`checklist-card glass-panel ${log.diet_followed === 1 ? 'checked' : ''}`}
          onClick={() => handleToggle('diet_followed', log.diet_followed)}
        >
          <div className="checkbox-custom">
            <Check />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Follow Balanced Halal Diet</h4>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.15rem' }}>No cheat meals, no alcohol, 100% clean halal nutrition.</p>
          </div>
        </div>

        {/* Read 10 Pages */}
        <div 
          className={`checklist-card glass-panel ${log.reading_completed === 1 ? 'checked' : ''}`}
          onClick={() => handleToggle('reading_completed', log.reading_completed)}
        >
          <div className="checkbox-custom">
            <Check />
          </div>
          <div style={{ flexGrow: 1 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Read 10 Pages</h4>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.15rem' }}>Non-fiction, personal development, or Islamic books.</p>
            <input 
              type="text" 
              placeholder="Book Title currently reading..." 
              value={bookTitle}
              onChange={handleBookTitleChange}
              onClick={(e) => e.stopPropagation()} // Prevent card toggle trigger
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.4rem 0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)', borderRadius: '0.375rem', color: '#F8FAFC', fontSize: '0.8rem' }}
            />
          </div>
        </div>
      </div>

      {/* Hydration tracker */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={20} style={{ color: '#06B6D4' }} />
            Water Hydration
          </h3>
          <span style={{ fontSize: '0.9rem', color: '#06B6D4', fontWeight: 600 }}>
            {log.water_drank || 0}L / {waterTarget}L
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>Drink 1 Gallon (~3.8 Liters) of plain water daily. Tap cups to fill.</p>
        
        <div className="water-grid">
          {Array.from({ length: cupsCount }).map((_, i) => (
            <div 
              key={i} 
              className={`water-cup ${i < filledCups ? 'filled' : ''}`}
              onClick={() => handleCupClick(i)}
              title={`${(i + 1) * 240}ml`}
            >
              <div style={{ zIndex: 10, fontSize: '0.6rem', color: i < filledCups ? 'white' : '#64748B', fontWeight: 'bold' }}>
                {(i + 1) * 240 >= 1000 ? `${((i + 1) * 0.24).toFixed(1)}L` : `${(i + 1) * 240}m`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5 Daily Prayers Checklist */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} style={{ color: '#F59E0B' }} />
          Daily Salah Check
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }} className="grid-responsive-two">
          {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(s => {
            const field = `salah_${s.toLowerCase()}`;
            const isDone = log[field] === 1;
            return (
              <div 
                key={s} 
                className={`checklist-card glass-panel ${isDone ? 'checked' : ''}`}
                onClick={() => handleToggle(field, log[field])}
                style={{ marginBottom: 0, padding: '0.75rem 1rem' }}
              >
                <div className="checkbox-custom">
                  <Check />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{s} Prayer</h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Photo Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={20} style={{ color: '#10B981' }} />
          Daily Progress Photo
        </h3>
        
        {log.photo_path ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', borderRadius: '1rem', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.08)', boxShadow: 'var(--shadow-lg)' }}>
              <img 
                src={getPhotoUrl(log.photo_path)} 
                alt={`Day ${log.day_number} Progress`} 
                style={{ maxHeight: '250px', width: 'auto', display: 'block' }} 
              />
              <div style={{ position: 'absolute', bottom: 0, inset: 'x-0', background: 'rgba(0,0,0,0.6)', padding: '0.5rem', backdropFilter: 'blur(4px)' }}>
                <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>Day {log.day_number} Photo Saved</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => fileInputRef.current.click()}
                disabled={photoUploading}
              >
                <Camera size={16} /> Retake Photo
              </button>
            </div>
          </div>
        ) : (
          <div 
            style={{ border: '2px dashed var(--card-border)', borderRadius: '1rem', padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)', transition: 'var(--transition-smooth)' }}
            onClick={() => fileInputRef.current.click()}
          >
            {photoUploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '24px', height: '24px', border: '3px solid rgba(16,185,129,0.3)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Uploading photo...</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={32} style={{ color: '#64748B' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Upload or Take Photo</h4>
                <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Supports direct mobile camera capture. Max 5MB.</p>
              </div>
            )}
          </div>
        )}

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          capture="environment" // trigger camera directly on mobile browsers
          onChange={handleFileChange}
        />
      </div>

      {/* Additional Tracking Metrics (Sleep, Calories, Mood, Journal) */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Heart size={20} style={{ color: '#F43F5E' }} />
          Additional Logs (Discipline Enhancers)
        </h3>

        {/* Sleep Hours Slider */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#94A3B8' }}>Sleep Duration</span>
            <strong style={{ color: '#F8FAFC' }}>{log.sleep_hours || 0} Hours</strong>
          </div>
          <input 
            type="range" 
            min="0" 
            max="12" 
            step="0.5" 
            value={log.sleep_hours || 0} 
            onChange={(e) => updateLog({ sleep_hours: parseFloat(e.target.value) })}
            style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--card-border)', accentColor: '#F43F5E', cursor: 'pointer' }}
          />
        </div>

        {/* Calories Counter */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', color: '#94A3B8', marginBottom: '0.5rem' }}>Calorie Intake</label>
          <input 
            type="number" 
            className="form-input" 
            placeholder="e.g. 2100 kcal" 
            value={log.calories || ''}
            onChange={(e) => updateLog({ calories: parseInt(e.target.value) || 0 })}
          />
        </div>

        {/* Mood Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ display: 'block', fontSize: '0.9rem', color: '#94A3B8', marginBottom: '0.5rem' }}>Daily Mood</span>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {moods.map((m) => {
              const active = log.mood === m.name;
              return (
                <button
                  key={m.name}
                  onClick={() => updateLog({ mood: m.name })}
                  style={{ flex: 1, padding: '0.5rem', background: active ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${active ? '#F43F5E' : 'var(--card-border)'}`, borderRadius: '0.5rem', cursor: 'pointer', transition: 'var(--transition-smooth)', fontSize: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  {m.emoji}
                </button>
              );
            })}
          </div>
        </div>

        {/* Journal Reflection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', color: '#94A3B8', marginBottom: '0.5rem' }}>Daily Reflection / Gratitude Journal</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="What did you learn today? What are you grateful for?"
            value={log.reflection || ''}
            onChange={(e) => updateLog({ reflection: e.target.value })}
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>
      </div>

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

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  RefreshCw, 
  AlertTriangle,
  User,
  Shield,
  Activity
} from 'lucide-react';
import { api } from '../utils/api.js';

export default function Settings({ user, reloadData }) {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);
  
  // Connection Health Status
  const [dbStatus, setDbStatus] = useState('Checking...');

  useEffect(() => {
    if (user) {
      setProfile({
        difficulty: user.difficulty || 'intermediate',
        goal: user.goal || 'maintenance',
        gender: user.gender || 'men',
        weight: user.weight || 70,
        height: user.height || 170,
        water_target_liters: user.water_target_liters || 3.8,
        calculation_method: user.calculation_method || 'ISNA',
        latitude: user.latitude || 21.4225,
        longitude: user.longitude || 39.8262,
        timezone_offset: user.timezone_offset !== undefined ? user.timezone_offset : 3.0
      });
    }

    // Ping API server to check health and database engine
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => {
        setDbStatus(`${data.status} (${data.database})`);
      })
      .catch(() => {
        setDbStatus('Offline (Guest Local Storage)');
      });
  }, [user]);

  if (!profile) return null;

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.updateProfile(profile);
      setSuccessMsg('Settings saved successfully!');
      playChime(660);
      await reloadData();
    } catch (error) {
      alert(error.message || 'Failed to update profile settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      "WARNING: Are you sure you want to reset your Ultimate Warrior 75 challenge? This will reset your streak and day count back to Day 1, and set your status to Failed. This action CANNOT be undone!"
    );
    if (!confirmReset) return;

    try {
      await api.resetChallenge();
      playChime(330);
      alert('Challenge reset successfully. Start fresh!');
      await reloadData();
    } catch (error) {
      alert(error.message || 'Failed to reset challenge');
    }
  };

  const getTzOffset = (tz) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(new Date());
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      if (tzPart) {
        const val = tzPart.value;
        if (val === 'GMT') return 0;
        const match = val.match(/GMT([+-])(\d+)(?::(\d+))?/);
        if (match) {
          const sign = match[1] === '-' ? -1 : 1;
          const hours = parseInt(match[2], 10);
          const minutes = match[3] ? parseInt(match[3], 10) : 0;
          return sign * (hours + minutes / 60);
        }
      }
    } catch (e) {
      console.error('Timezone parsing error:', e);
    }
    return 0;
  };

  const handleTimezoneChange = (tzName) => {
    const offset = getTzOffset(tzName);
    setProfile(prev => ({
      ...prev,
      timezone: tzName,
      timezone_offset: offset
    }));
  };

  // Browser Geolocation GPS fetcher
  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(4));
        const lng = parseFloat(position.coords.longitude.toFixed(4));
        const browserTzOffset = -new Date().getTimezoneOffset() / 60;
        
        handleChange('latitude', lat);
        handleChange('longitude', lng);
        handleChange('timezone_offset', browserTzOffset);
        
        // Auto-save updated location coordinates and local timezone
        setProfile(prev => {
          const updated = { ...prev, latitude: lat, longitude: lng, timezone_offset: browserTzOffset };
          api.updateProfile(updated).then(() => {
            reloadData();
          });
          return updated;
        });

        setDetectingGps(false);
        playChime(523);
        setSuccessMsg('GPS coordinates and local timezone detected and saved!');
      },
      (error) => {
        console.error('GPS detection error:', error);
        alert(`Failed to get location: ${error.message}. Please input coordinates manually.`);
        setDetectingGps(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const playChime = (freq) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Preferences & Resets</span>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>App Settings</h2>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.9rem', textAlign: 'center', fontWeight: 600 }}>
            {successMsg}
          </div>
        )}

        {/* Profile Details Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} style={{ color: '#10B981' }} />
            Personal & Fitness Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="grid-responsive-two">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Weight (kg)</label>
              <input 
                type="number" 
                step="0.1"
                className="form-input" 
                value={profile.weight} 
                onChange={e => handleChange('weight', parseFloat(e.target.value) || 0)} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Height (cm)</label>
              <input 
                type="number" 
                className="form-input" 
                value={profile.height} 
                onChange={e => handleChange('height', parseInt(e.target.value) || 0)} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Target Hydration (Liters)</label>
              <input 
                type="number" 
                step="0.1"
                className="form-input" 
                value={profile.water_target_liters} 
                onChange={e => handleChange('water_target_liters', parseFloat(e.target.value) || 3.8)} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Gender</label>
              <select 
                className="form-select" 
                value={profile.gender} 
                onChange={e => handleChange('gender', e.target.value)}
              >
                <option value="men">Male</option>
                <option value="women">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Challenge Configs Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} style={{ color: '#06B6D4' }} />
            Challenge Configs
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="grid-responsive-two">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Workout Difficulty</label>
              <select 
                className="form-select" 
                value={profile.difficulty} 
                onChange={e => handleChange('difficulty', e.target.value)}
              >
                <option value="beginner">Beginner (Basic movement patterns)</option>
                <option value="intermediate">Intermediate (Balanced routine)</option>
                <option value="advanced">Advanced (High volume & power)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Fitness Goal</label>
              <select 
                className="form-select" 
                value={profile.goal} 
                onChange={e => handleChange('goal', e.target.value)}
              >
                <option value="fat_loss">Fat Loss (Higher HIIT frequency)</option>
                <option value="muscle_gain">Muscle Gain (Higher strength volume)</option>
                <option value="maintenance">Maintenance (Balanced fitness)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prayer Time Calculation and GPS Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} style={{ color: '#F59E0B' }} />
            Prayer Calculation Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }} className="grid-responsive-two">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Calculation Method</label>
              <select 
                className="form-select" 
                value={profile.calculation_method} 
                onChange={e => handleChange('calculation_method', e.target.value)}
              >
                <option value="ISNA">ISNA (North America - 15°)</option>
                <option value="MWL">MWL (Muslim World League - 18°)</option>
                <option value="EGYPT">Egyptian General Authority (19.5°)</option>
                <option value="KARACHI">University of Islamic Sciences, Karachi (18°)</option>
                <option value="TEHRAN">Institute of Geophysics, Tehran (17.7°)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Select Timezone</label>
              <select 
                className="form-select" 
                value={profile.timezone} 
                onChange={e => handleTimezoneChange(e.target.value)}
              >
                {!['Asia/Kolkata', 'Asia/Riyadh', 'Asia/Dubai', 'Asia/Karachi', 'Asia/Dhaka', 'Asia/Jakarta', 'Asia/Singapore', 'Asia/Tehran', 'Asia/Kabul', 'Africa/Cairo', 'Europe/Istanbul', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Los_Angeles'].includes(Intl.DateTimeFormat().resolvedOptions().timeZone) && (
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone} (Local Device Timezone)
                  </option>
                )}
                <option value="Asia/Kolkata">Asia/Kolkata (India Standard Time - UTC+5:30)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (Saudi Arabia / Mecca - UTC+3:00)</option>
                <option value="Asia/Dubai">Asia/Dubai (Gulf / UAE - UTC+4:00)</option>
                <option value="Asia/Karachi">Asia/Karachi (Pakistan Standard Time - UTC+5:00)</option>
                <option value="Asia/Dhaka">Asia/Dhaka (Bangladesh Standard Time - UTC+6:00)</option>
                <option value="Asia/Jakarta">Asia/Jakarta (Indonesia West Time - UTC+7:00)</option>
                <option value="Asia/Singapore">Asia/Singapore (Singapore / Malaysia - UTC+8:00)</option>
                <option value="Asia/Tehran">Asia/Tehran (Iran Standard Time - UTC+3:30)</option>
                <option value="Asia/Kabul">Asia/Kabul (Afghanistan Time - UTC+4:30)</option>
                <option value="Africa/Cairo">Africa/Cairo (Egypt Standard Time - UTC+2:00)</option>
                <option value="Europe/Istanbul">Europe/Istanbul (Turkey Time - UTC+3:00)</option>
                <option value="Europe/London">Europe/London (Greenwich Mean Time - UTC+0:00)</option>
                <option value="Europe/Paris">Europe/Paris (Central European Time - UTC+1:00)</option>
                <option value="America/New_York">America/New_York (US Eastern Time - UTC-5:00)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (US Pacific Time - UTC-8:00)</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', marginTop: '0.25rem' }}>
                Calculated Offset: UTC {profile.timezone_offset >= 0 ? `+${profile.timezone_offset}` : profile.timezone_offset}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>GPS Location</label>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleGpsDetect}
                disabled={detectingGps}
                style={{ width: '100%', display: 'flex', gap: '0.5rem' }}
              >
                {detectingGps ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                ) : (
                  <MapPin size={16} />
                )}
                {detectingGps ? 'Querying GPS...' : 'Detect GPS Coordinates'}
              </button>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Latitude</label>
              <input 
                type="number" 
                step="0.0001"
                className="form-input" 
                value={profile.latitude} 
                onChange={e => handleChange('latitude', parseFloat(e.target.value) || 0)} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.35rem' }}>Longitude</label>
              <input 
                type="number" 
                step="0.0001"
                className="form-input" 
                value={profile.longitude} 
                onChange={e => handleChange('longitude', parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={saving}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        >
          {saving ? 'Saving changes...' : 'Save Settings'}
        </button>
      </form>

      {/* Emergency Hard Resets */}
      <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(244,63,94,0.2)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F43F5E' }}>
          <AlertTriangle size={20} />
          Danger Zone
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
          Resetting the challenge will format today's checklist log and reset streaks back to Day 1.
        </p>
        <button className="btn btn-danger" onClick={handleReset} style={{ width: '100%' }}>
          Fail & Reset Challenge to Day 1
        </button>
      </div>

      {/* Database connection information panel */}
      <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748B' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Shield size={14} /> Backend System Status:
        </span>
        <span style={{ fontWeight: 600, color: dbStatus.includes('healthy') ? '#10B981' : '#F59E0B' }}>
          {dbStatus}
        </span>
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

import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Droplet, 
  Clock, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Compass,
  ChevronRight,
  BookOpen
} from 'lucide-react';

import { calculatePrayerTimes, getHijriDate } from '../utils/prayer.js';
import { api } from '../utils/api.js';

export default function Dashboard({ user, log, workout }) {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState({ name: '', time: '', countdown: '' });
  const [hijriDate, setHijriDate] = useState('');
  const [dailyQuote, setDailyQuote] = useState({ arabic: '', islamicText: '', source: '', reflection: '', fitnessQuote: '' });

  // Get current date/time adjusted to the target timezone offset
  const getTargetTime = () => {
    const nowUtcMs = Date.now() + new Date().getTimezoneOffset() * 60 * 1000;
    const targetOffset = user?.timezone_offset !== undefined ? user.timezone_offset : -new Date().getTimezoneOffset() / 60;
    return new Date(nowUtcMs + targetOffset * 60 * 60 * 1000);
  };

  // Load Prayer Times and Reminder
  useEffect(() => {
    if (user) {
      const times = calculatePrayerTimes(user.latitude, user.longitude, user.timezone_offset, getTargetTime());
      setPrayerTimes(times);
      setHijriDate(getHijriDate(getTargetTime()));

      // Fetch daily reminder
      api.getIslamicReminder().then(res => {
        setDailyQuote(res.reminder);
      });
    }
  }, [user]);

  // Next Prayer Countdown Ticker
  useEffect(() => {
    if (!prayerTimes) return;

    const interval = setInterval(() => {
      const now = getTargetTime();
      const currentFormatted = now.toTimeString().split(' ')[0].substring(0, 5); // "HH:MM"
      
      const prayers = [
        { name: 'Fajr', time: prayerTimes.fajr },
        { name: 'Sunrise', time: prayerTimes.sunrise },
        { name: 'Dhuhr', time: prayerTimes.dhuhr },
        { name: 'Asr', time: prayerTimes.asr },
        { name: 'Maghrib', time: prayerTimes.maghrib },
        { name: 'Isha', time: prayerTimes.isha }
      ];

      // Parse hours & minutes
      const parseTimeToMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      
      let next = null;
      for (const pr of prayers) {
        if (parseTimeToMinutes(pr.time) > nowMinutes) {
          next = pr;
          break;
        }
      }

      // If past Isha, the next prayer is Fajr tomorrow
      if (!next) {
        next = { ...prayers[0], isTomorrow: true };
      }

      // Calculate countdown string
      let diffMinutes;
      const targetMin = parseTimeToMinutes(next.time);
      if (next.isTomorrow) {
        diffMinutes = (24 * 60 - nowMinutes) + targetMin;
      } else {
        diffMinutes = targetMin - nowMinutes;
      }

      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      const s = 59 - now.getSeconds(); // approximate seconds

      const countdownStr = `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;

      setNextPrayer({
        name: next.name,
        time: next.time,
        countdown: countdownStr
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Calculate Progress Percentages for SVG Rings
  // Ring 1 (Outer): Workouts (0, 1 or 2)
  const workoutsDone = (log?.outdoor_workout || 0) + (log?.indoor_workout || 0);
  const workoutPercent = Math.min(100, (workoutsDone / 2) * 100);
  
  // Ring 2 (Middle): Hydration (water_drank vs water_target_liters)
  const waterTarget = user?.water_target_liters || 3.8;
  const waterPercent = Math.min(100, ((log?.water_drank || 0) / waterTarget) * 100);

  // Ring 3 (Inner): Prayers (0 to 5)
  const prayersDone = (log?.salah_fajr || 0) + (log?.salah_dhuhr || 0) + (log?.salah_asr || 0) + (log?.salah_maghrib || 0) + (log?.salah_isha || 0);
  const prayerPercent = Math.min(100, (prayersDone / 5) * 100);

  // SVG parameters
  const size = 220;
  const strokeWidth = 14;
  const center = size / 2;

  // Ring radii
  const r1 = 85; // Workout
  const r2 = 65; // Water
  const r3 = 45; // Prayer

  // Circumferences
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  const c3 = 2 * Math.PI * r3;

  // Offsets
  const offset1 = c1 - (workoutPercent / 100) * c1;
  const offset2 = c2 - (waterPercent / 100) * c2;
  const offset3 = c3 - (prayerPercent / 100) * c3;

  // Dynamic schedule generator based on calculated prayer times
  const getTimeline = () => {
    if (!prayerTimes) return [];

    // Helper to offset times (e.g. Fajr + 45 minutes)
    const addMinutesToTime = (timeStr, minutes) => {
      const [h, m] = timeStr.split(':').map(Number);
      let date = new Date();
      date.setHours(h, m + minutes, 0);
      return date.toTimeString().split(' ')[0].substring(0, 5);
    };

    return [
      { id: 'fajr', title: 'Fajr Prayer', time: prayerTimes.fajr, completed: log?.salah_fajr === 1, type: 'prayer' },
      { id: 'outdoor', title: 'Outdoor Workout (45 min)', time: addMinutesToTime(prayerTimes.sunrise, 30), completed: log?.outdoor_workout === 1, type: 'workout' },
      { id: 'breakfast', title: 'Halal Breakfast & Water', time: addMinutesToTime(prayerTimes.sunrise, 90), completed: log?.diet_followed === 1 && (log?.water_drank || 0) > 0, type: 'diet' },
      { id: 'dhuhr', title: 'Dhuhr Prayer', time: prayerTimes.dhuhr, completed: log?.salah_dhuhr === 1, type: 'prayer' },
      { id: 'asr', title: 'Asr Prayer', time: prayerTimes.asr, completed: log?.salah_asr === 1, type: 'prayer' },
      { id: 'indoor', title: 'Indoor Gym / Home Workout', time: addMinutesToTime(prayerTimes.asr, 45), completed: log?.indoor_workout === 1, type: 'workout' },
      { id: 'maghrib', title: 'Maghrib Prayer & Dinner', time: prayerTimes.maghrib, completed: log?.salah_maghrib === 1, type: 'prayer' },
      { id: 'isha', title: 'Isha Prayer & Reading', time: prayerTimes.isha, completed: log?.salah_isha === 1, type: 'prayer' },
      { id: 'reflection', title: 'Journal Reflection & Sleep', time: addMinutesToTime(prayerTimes.isha, 90), completed: !!log?.reflection, type: 'journal' }
    ];
  };

  const timeline = getTimeline();

  // Helper to determine active task index in timeline
  const getActiveTimelineIndex = () => {
    if (!prayerTimes) return 0;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTimeToMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    for (let idx = timeline.length - 1; idx >= 0; idx--) {
      if (nowMinutes >= parseTimeToMinutes(timeline[idx].time)) {
        return idx;
      }
    }
    return 0;
  };

  const activeIdx = getActiveTimelineIndex();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Massive Chronometer Day Watermark */}
      {log && (
        <div className="watermark-day">
          {log.day_number.toString().padStart(3, '0')}
        </div>
      )}
      
      {/* Hijri & Gregorian Dates Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', zIndex: 10 }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{hijriDate || 'Umm Al-Qura Calendar'}</span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome back, Warrior</h2>
        </div>
        <div style={{ color: '#94A3B8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <CalendarIcon size={16} />
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Progress Circles Dashboard and Next Prayer Countdown Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignContent: 'stretch', zIndex: 10 }} className="grid-responsive-two">
        
        {/* concentric rings panel */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#94A3B8', alignSelf: 'flex-start', marginBottom: '1.5rem' }}>Challenge Activity Rings</h3>
          <div className="rings-container">
            <svg width={size} height={size}>
              {/* Outer Ring: Workout (Emerald) */}
              <circle className="ring-circle-bg" cx={center} cy={center} r={r1} strokeWidth={strokeWidth} />
              <circle 
                className="ring-circle" 
                cx={center} 
                cy={center} 
                r={r1} 
                strokeWidth={strokeWidth} 
                stroke="#10B981"
                strokeDasharray={c1}
                strokeDashoffset={offset1}
                style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.3))' }}
              />

              {/* Middle Ring: Water (Cyan) */}
              <circle className="ring-circle-bg" cx={center} cy={center} r={r2} strokeWidth={strokeWidth} />
              <circle 
                className="ring-circle" 
                cx={center} 
                cy={center} 
                r={r2} 
                strokeWidth={strokeWidth} 
                stroke="#06B6D4"
                strokeDasharray={c2}
                strokeDashoffset={offset2}
                style={{ filter: 'drop-shadow(0 0 4px rgba(6,182,212,0.3))' }}
              />

              {/* Inner Ring: Prayer (Gold) */}
              <circle className="ring-circle-bg" cx={center} cy={center} r={r3} strokeWidth={strokeWidth} />
              <circle 
                className="ring-circle" 
                cx={center} 
                cy={center} 
                r={r3} 
                strokeWidth={strokeWidth} 
                stroke="#c5a059"
                strokeDasharray={c3}
                strokeDashoffset={offset3}
                style={{ filter: 'drop-shadow(0 0 4px var(--color-gold-glow))' }}
              />
            </svg>
            <div className="dashboard-ring-label">
              <span className="percentage">{Math.round((workoutPercent + waterPercent + prayerPercent) / 3)}%</span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Progress</span>
            </div>
          </div>

          {/* Legends */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem', width: '100%', justifyContent: 'space-around', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
              <span style={{ color: '#94A3B8', fontWeight: 500 }}>Workouts ({workoutsDone}/2)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4' }}></span>
              <span style={{ color: '#94A3B8', fontWeight: 500 }}>Hydration ({Math.round(waterPercent)}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c5a059' }}></span>
              <span style={{ color: '#94A3B8', fontWeight: 500 }}>Prayers ({prayersDone}/5)</span>
            </div>
          </div>
        </div>

        {/* Next Prayer widget panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#94A3B8' }}>Next Salah Countdown</h3>
              <Clock size={18} style={{ color: '#10B981' }} />
            </div>
            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800 }} className="timer-text">{nextPrayer.countdown || '--m --s'}</span>
              <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Until <strong style={{ color: '#F8FAFC' }}>{nextPrayer.name}</strong> at {nextPrayer.time || '--:--'}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '0.75rem' }}>Salah Status Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(s => {
                const checked = log ? log[`salah_${s.toLowerCase()}`] === 1 : false;
                return (
                  <div key={s} style={{ flex: 1, textAlign: 'center', background: checked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${checked ? '#10B981' : 'var(--card-border)'}`, padding: '0.5rem 0.25rem', transition: 'all 0.3s' }}>
                    <div style={{ fontSize: '0.75rem', color: checked ? '#10B981' : '#94A3B8', fontWeight: 600 }}>{s}</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: checked ? '#10B981' : '#64748B' }}>
                      {checked ? '✓' : '•'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Daily Reminders Box */}
      {dailyQuote && (
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03), rgba(197, 160, 89, 0.03)), var(--card-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={20} style={{ color: '#c5a059' }} />
            <h3 style={{ fontSize: '1.1rem' }}>Day {dailyQuote.day} Islamic Reminder</h3>
          </div>
          {dailyQuote.arabic && (
            <p dir="rtl" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', textAlign: 'right', marginBottom: '0.75rem', color: '#F8FAFC', lineHeight: 1.8 }}>
              {dailyQuote.arabic}
            </p>
          )}
          <blockquote style={{ borderLeft: '3px solid var(--color-gold)', paddingLeft: '1rem', margin: '0.5rem 0', fontStyle: 'italic', color: '#E2E8F0' }}>
            "{dailyQuote.islamicText}"
            <cite style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem', fontStyle: 'normal' }}>
              — {dailyQuote.source}
            </cite>
          </blockquote>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '1.1rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
            <strong style={{ color: '#10B981' }}>Spiritual Reflection:</strong> {dailyQuote.reflection}
          </p>
          <div style={{ marginTop: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderLeft: '3px solid var(--color-gold)', display: 'flex', gap: '0.5rem' }}>
            <Flame size={18} style={{ color: '#c5a059', flexShrink: 0 }} />
            <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              <strong style={{ color: '#c5a059' }}>Daily Motivation:</strong> {dailyQuote.fitnessQuote}
            </p>
          </div>
        </div>
      )}

      {/* Daily Timeline */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Daily Timeline Schedule</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {timeline.map((event, idx) => {
            const isActive = idx === activeIdx;
            const dotClass = event.completed 
              ? 'timeline-dot completed' 
              : isActive 
                ? 'timeline-dot active' 
                : 'timeline-dot';
                
            return (
              <div key={event.id} className="timeline-event">
                <div className={dotClass}>
                  {event.completed && <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>✓</span>}
                </div>
                <div className="timeline-content" style={{ borderLeft: isActive ? '3px solid #10B981' : '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: event.completed ? '#64748B' : '#F8FAFC' }}>
                      {event.title}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>{event.time}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    {event.type === 'prayer' ? 'Focus on Khushu (presence) and pray on time.' : 
                     event.type === 'workout' ? '45 minutes continuous physical activity.' : 
                     event.type === 'diet' ? 'Log your halal meals and keep tracking hydration.' : 
                     event.type === 'journal' ? 'Reflect on your day\'s choices and record mood.' : 'Daily discipline task.'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          .grid-responsive-two {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}} />

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Camera, Eye, X } from 'lucide-react';
import { api } from '../utils/api.js';

export default function ProgressGallery({ user }) {
  const [history, setHistory] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    api.getHistory().then(res => {
      setHistory(res.logs || []);
    });
  }, []);

  // Format YYYY-MM-DD to cleaner formats
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Directory helper for photos
  const getPhotoUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('data:image')) return path; // Guest mode base64
    return `http://localhost:5000${path}`;
  };

  // Compile calendar cells from Day 1 to Day 75
  const renderCalendarCells = () => {
    const cells = [];
    const logsMap = new Map();
    history.forEach(log => {
      logsMap.set(log.day_number, log);
    });

    for (let day = 1; day <= 75; day++) {
      const log = logsMap.get(day);
      let cellClass = 'calendar-cell';
      let statusIcon = '•';

      if (log) {
        if (log.is_completed === 1) {
          cellClass += ' completed';
          statusIcon = '✓';
        } else {
          // If it's today's log, it might not be complete yet. Don't mark as failed if it's active.
          const isTodayLog = log.date === new Date().toISOString().split('T')[0];
          if (!isTodayLog) {
            cellClass += ' failed';
            statusIcon = '×';
          }
        }
      } else {
        // If we have an active challenge and this day is in the future
        const start = user?.challenge_start_date ? new Date(user.challenge_start_date) : null;
        if (start) {
          const today = new Date();
          start.setHours(0,0,0,0);
          today.setHours(0,0,0,0);
          const currentDayNum = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
          if (day > currentDayNum) {
            cellClass += ' future';
          } else {
            cellClass += ' failed'; // missed logging this day
            statusIcon = '×';
          }
        } else {
          cellClass += ' future';
        }
      }

      cells.push(
        <div key={day} className={cellClass} title={log ? `Logged on ${formatDate(log.date)}` : `Day ${day}`}>
          <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Day</span>
          <span style={{ fontSize: '1rem', fontWeight: 800 }}>{day}</span>
          <span style={{ fontSize: '0.75rem', marginTop: '0.1rem' }}>{statusIcon}</span>
        </div>
      );
    }

    return cells;
  };

  // Get all logs containing photos
  const photoLogs = history.filter(l => l.photo_path !== null && l.photo_path !== '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Journey Metrics & History</span>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>Progress & Gallery</h2>
        </div>
      </div>

      {/* Calendar Grid panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={20} style={{ color: '#10B981' }} />
          75 Day Challenge Calendar
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
          Your history at a glance. Green indicates success, Red indicates failure/missed rules.
        </p>

        <div className="calendar-grid">
          {renderCalendarCells()}
        </div>
      </div>

      {/* Progress Photo feed panel */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={20} style={{ color: '#06B6D4' }} />
          Daily Progress Photos
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
          Visual transformation wall. Tapping an image opens full view.
        </p>

        {photoLogs.length === 0 ? (
          <div style={{ border: '1px dashed var(--card-border)', padding: '2rem', textAlign: 'center', borderRadius: '0.75rem', color: '#64748B' }}>
            No progress photos logged yet. Complete tasks and snap photos in Checklist page.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }} className="grid-responsive-three">
            {photoLogs.map(log => (
              <div 
                key={log.date} 
                className="glass-panel" 
                style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative', borderRadius: '0.75rem' }}
                onClick={() => setSelectedPhoto(log)}
              >
                <img 
                  src={getPhotoUrl(log.photo_path)} 
                  alt={`Day ${log.day_number}`} 
                  style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(8,12,21,0.6)', backdropFilter: 'blur(4px)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#10B981' }}>
                  Day {log.day_number}
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{formatDate(log.date)}</span>
                  <Eye size={12} style={{ color: 'white' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox photo modal */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8, 12, 21, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '80%' }}>
            <img 
              src={getPhotoUrl(selectedPhoto.photo_path)} 
              alt={`Day ${selectedPhoto.day_number}`} 
              style={{ maxWidth: '100vw', maxHeight: '70vh', borderRadius: '0.75rem', boxShadow: 'var(--shadow-lg)', display: 'block', margin: '0 auto' }}
            />
            
            <button 
              onClick={() => setSelectedPhoto(null)} 
              style={{ position: 'absolute', top: '-2.5rem', right: '0', background: 'none', border: 'none', color: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}
            >
              <X size={20} /> Close
            </button>
          </div>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>Day {selectedPhoto.day_number} Photo</h4>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.25rem' }}>{formatDate(selectedPhoto.date)}</p>
            {selectedPhoto.reflection && (
              <p style={{ color: '#E2E8F0', fontStyle: 'italic', fontSize: '0.9rem', marginTop: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '0.5rem', maxWidth: '400px' }}>
                "{selectedPhoto.reflection}"
              </p>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 600px) {
          .grid-responsive-three {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}} />

    </div>
  );
}

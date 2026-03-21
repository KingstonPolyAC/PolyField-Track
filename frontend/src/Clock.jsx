import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRunningClock } from './clockUtils';
import { useTranslation } from './i18n';

function Clock() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const hostname = window.location.hostname;
  const isDesktopApp = hostname === '' || hostname === 'wails.localhost' || window.location.protocol === 'wails:';
  const baseUrl = isDesktopApp ? 'http://127.0.0.1:3000' : '';

  const runningClock = useRunningClock(baseUrl);

  // Auto-hide back button after 3 seconds of no mouse movement (web only)
  const [showControls, setShowControls] = useState(true);
  const [hideTimeout, setHideTimeout] = useState(null);

  useEffect(() => {
    if (isDesktopApp) return;
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideTimeout) clearTimeout(hideTimeout);
      const t = setTimeout(() => setShowControls(false), 3000);
      setHideTimeout(t);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [isDesktopApp, hideTimeout]);

  const isRunning = runningClock.state === 'running';
  const isStopped = runningClock.state === 'stopped';
  const isArmed = runningClock.state === 'armed';
  const timeDisplay = runningClock.time || (isArmed ? t('clock.ready') : '—');
  const timeColor = isRunning ? '#1e88e5' : isStopped ? '#e0e0e0' : '#607d8b';

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

      {/* Back button — always visible on desktop, auto-hides on web */}
      {(isDesktopApp || showControls) && (
        <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 10 }}>
          <button
            onClick={() => navigate('/results')}
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#a0b4c8', border: '1px solid #2a4a6b', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ← {t('common.back')}
          </button>
        </div>
      )}

      {/* Event name + time centred */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '2vh' }}>
        <div style={{ fontSize: '4vw', color: '#a0b4c8', letterSpacing: '0.08em', textAlign: 'center', padding: '0 4vw' }}>
          {runningClock.eventName || '—'}
        </div>
        <div style={{ fontSize: `${Math.min(22, Math.floor(130 / (timeDisplay.length || 4)))}vw`, fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.03em', color: timeColor, lineHeight: 1 }}>
          {timeDisplay}
        </div>
      </div>

      {/* UNOFFICIAL TIME pinned to bottom */}
      <div style={{ paddingBottom: '3vh', fontSize: '2.2vw', color: '#f59e0b', letterSpacing: '0.15em' }}>
        {t('clock.unofficialTime')}
      </div>

    </div>
  );
}

export default Clock;

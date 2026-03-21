import { useRef, useState, useEffect } from 'react';

// Parse a FinishLynx formatted time string to milliseconds.
// Handles: "s.hh", "m:ss.hh", "h:mm:ss.hh"
export function parseTimeToMs(timeStr) {
  if (!timeStr) return null;
  const trimmed = timeStr.trim();
  if (!trimmed || trimmed === '—') return null;

  const parts = trimmed.split(':');
  let seconds = 0;

  if (parts.length === 1) {
    seconds = parseFloat(parts[0]);
  } else if (parts.length === 2) {
    seconds = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  } else if (parts.length === 3) {
    seconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
  }

  if (isNaN(seconds)) return null;
  return Math.round(seconds * 1000);
}

// Format milliseconds back to a time string with hundredths: "s.hh", "m:ss.hh", "h:mm:ss.hh"
export function formatMsToTime(ms) {
  if (ms === null || ms === undefined || ms < 0) return '—';

  const hundredths = Math.floor(ms / 10) % 100;
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const hh = String(hundredths).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${ss}.${hh}`;
  } else if (minutes > 0) {
    return `${minutes}:${ss}.${hh}`;
  } else {
    return `${totalSeconds}.${hh}`;
  }
}

// Custom hook: polls /running-clock every 200ms for FinishLynx corrections,
// then interpolates forward at requestAnimationFrame speed (~60fps) for smooth
// hundredths display between packets.
export function useRunningClock(baseUrl) {
  const clockBaseRef = useRef(null);
  const clockSkewRef = useRef(0); // client clock offset vs server (ms): add to Date.now() to get server time
  const rafRef = useRef(null);
  const [displayClock, setDisplayClock] = useState({ state: 'idle', time: '', eventName: '' });

  // rAF loop: interpolate forward using server-corrected time
  useEffect(() => {
    const tick = () => {
      const base = clockBaseRef.current;
      if (base && base.state === 'running' && base.ms !== null) {
        const serverNow = Date.now() + clockSkewRef.current;
        const elapsed = serverNow - base.receivedAt;
        setDisplayClock({
          state: 'running',
          time: formatMsToTime(base.ms + elapsed),
          eventName: base.eventName,
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Poll server every 200ms for corrections and clock skew measurement
  useEffect(() => {
    async function fetchClock() {
      try {
        const t0 = Date.now();
        const response = await fetch(`${baseUrl}/clock-data`);
        if (!response.ok) return;
        const data = await response.json();
        const t1 = Date.now();

        // Estimate server time at moment response was generated, accounting for half RTT
        if (data.serverNow) {
          const rtt = t1 - t0;
          const estimatedServerAtReceipt = data.serverNow + rtt / 2;
          clockSkewRef.current = estimatedServerAtReceipt - t1;
        }

        if (data.state === 'running') {
          const ms = parseTimeToMs(data.time);
          if (ms !== null) {
            clockBaseRef.current = {
              ms,
              receivedAt: data.receivedAt || Date.now(),
              state: 'running',
              eventName: data.eventName || '',
            };
          }
        } else {
          clockBaseRef.current = null;
          setDisplayClock({
            state: data.state || 'idle',
            time: data.time || '',
            eventName: data.eventName || '',
          });
        }
      } catch (err) {
        // silently fail — FinishLynx may not be connected
      }
    }
    fetchClock();
    const interval = setInterval(fetchClock, 200);
    return () => clearInterval(interval);
  }, [baseUrl]);

  return displayClock;
}

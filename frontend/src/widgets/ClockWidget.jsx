import React, { useRef, useState, useEffect, useCallback } from 'react';
import { trimClockTime, parseTimeToMs, formatMsToTime } from '../clockUtils';
import { useTranslation } from '../i18n';

export default function ClockWidget({ widget, clock, isBuilder }) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [displayStr, setDisplayStr] = useState('');
  const animRef = useRef(null);
  const keepGoingRef = useRef(null); // { baseMs, startedAt } — set when counting after stop

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const config = widget?.config || {};
  // stopOnFinish: freeze at photocell time when stopped. Default false = keep counting.
  const stopOnFinish = config.stopOnFinish === true;

  const cancelAnim = useCallback(() => {
    if (animRef.current) { cancelAnimationFrame(animRef.current); animRef.current = null; }
    keepGoingRef.current = null;
  }, []);

  // Handle state transitions (armed, stopped, timeofday, idle)
  useEffect(() => {
    const state = clock?.state || 'idle';

    if (state === 'stopped') {
      cancelAnim();
      if (!stopOnFinish) {
        // Keep counting forward from the photocell time
        const baseMs = parseTimeToMs(clock?.time) ?? 0;
        const startedAt = Date.now();
        keepGoingRef.current = { baseMs, startedAt };
        const tick = () => {
          const elapsed = Date.now() - keepGoingRef.current.startedAt;
          setDisplayStr(trimClockTime(formatMsToTime(keepGoingRef.current.baseMs + elapsed)) || '');
          animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayStr(trimClockTime(clock?.time) || '');
      }
    } else if (state === 'paused') {
      cancelAnim();
      setDisplayStr(trimClockTime(clock?.time) || '');
    } else if (state === 'armed') {
      cancelAnim();
      setDisplayStr(t('clock.ready'));
    } else if (state === 'timeofday') {
      cancelAnim();
      // Initial display set here; kept fresh / blanked by the receivedAt effect below
    } else if (state === 'idle') {
      cancelAnim();
      setDisplayStr('');
    }
    // 'running' is handled by the effect below

    return cancelAnim;
  }, [clock?.state, stopOnFinish, cancelAnim, t]);

  // Keep TOD display fresh and blank it when FinishLynx stops sending TOD packets.
  // Fires on every TOD packet (receivedAt changes) and every state transition.
  useEffect(() => {
    const s = clock?.state || 'idle';
    if (s !== 'timeofday') return;
    const age = Date.now() - (clock?.receivedAt || 0);
    if (age <= 3000) {
      setDisplayStr(clock?.time || '');
    }
    const id = setInterval(() => {
      if (Date.now() - (clock?.receivedAt || 0) > 3000) setDisplayStr('');
    }, 500);
    return () => clearInterval(id);
  }, [clock?.state, clock?.receivedAt]);

  // Re-translate the armed/ready string when language changes
  useEffect(() => {
    if ((clock?.state || 'idle') === 'armed') {
      setDisplayStr(t('clock.ready'));
    }
  }, [t]);

  // Sync running display with the hook's smooth interpolated time
  useEffect(() => {
    if ((clock?.state || 'idle') === 'running') {
      setDisplayStr(trimClockTime(clock?.time) || '0.00');
    }
  }, [clock?.time, clock?.state]);

  if (isBuilder) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#4a9', gap: '4px' }}>
        <div style={{ fontSize: '0.85em', fontWeight: 'bold', letterSpacing: '0.05em' }}>RUNNING CLOCK</div>
        <div style={{ fontSize: '1.4em', fontFamily: 'monospace', color: '#1e88e5' }}>19.70</div>
      </div>
    );
  }

  const state = clock?.state || 'idle';
  const isRunning = state === 'running';
  const keepGoingActive = state === 'stopped' && !stopOnFinish;
  const color = (isRunning || keepGoingActive) ? (config.colorRunning   || '#1e88e5')
              : state === 'stopped'             ? (config.colorStopped   || '#e0e0e0')
              : state === 'paused'              ? (config.colorStopped   || '#e0e0e0')
              : state === 'timeofday'           ? (config.colorTimeOfDay || '#e0e0e0')
              :                                   (config.colorReady     || '#607d8b');

  const charCount = (displayStr || '').length || 4;
  const hBased = containerSize.h * 0.75;
  const wBased = containerSize.w / (charCount * 0.6);
  const fontSize = Math.min(hBased, wBased, 200);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: config.backgroundColor || '#000', overflow: 'hidden', padding: '0 6px', boxSizing: 'border-box' }}>
      <div style={{ fontSize: fontSize + 'px', fontWeight: 'bold', fontFamily: 'monospace', color, lineHeight: 1, letterSpacing: '0.02em' }}>
        {displayStr}
      </div>
    </div>
  );
}

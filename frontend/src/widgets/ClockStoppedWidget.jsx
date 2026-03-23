import React, { useRef, useState, useEffect, useCallback } from 'react';
import { trimClockTime } from '../clockUtils';

export default function ClockStoppedWidget({ widget, clock, isBuilder }) {
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [visible, setVisible] = useState(false);
  const [displayedTime, setDisplayedTime] = useState('');
  const hideTimer = useRef(null);

  // useCallback ref fires whenever the element mounts — more reliable than useEffect + useRef
  const containerRef = useCallback(node => {
    if (!node) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(node);
  }, []);

  const config = widget.config || {};
  const displaySeconds = config.displaySeconds > 0 ? config.displaySeconds : 0;

  useEffect(() => {
    const state = clock?.state;

    if (state === 'stopped' && clock?.time) {
      setDisplayedTime(clock.time);
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (displaySeconds > 0) {
        hideTimer.current = setTimeout(() => setVisible(false), displaySeconds * 1000);
      }
    } else if (state === 'armed' || state === 'idle') {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(false);
      setDisplayedTime('');
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [clock?.state, clock?.time, displaySeconds]);

  if (isBuilder) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9a7', gap: '4px' }}>
        <div style={{ fontSize: '0.85em', fontWeight: 'bold', letterSpacing: '0.05em' }}>STOPPED TIME</div>
        <div style={{ fontSize: '1.4em', fontFamily: 'monospace', color: '#e0e0e0' }}>19.70</div>
        {displaySeconds > 0 && (
          <div style={{ fontSize: '0.6em', color: '#556' }}>hides after {displaySeconds}s</div>
        )}
      </div>
    );
  }

  const timeStr = trimClockTime(displayedTime) || '';
  const charCount = timeStr.length || 4;
  // Fall back to a sensible size if ResizeObserver hasn't measured yet
  const hBased = containerSize.h > 0 ? containerSize.h * 0.75 : 9999;
  const wBased = containerSize.w > 0 ? containerSize.w / (charCount * 0.6) : 9999;
  const fontSize = Math.min(hBased, wBased, 200);

  const textColor = config.color || '#e0e0e0';
  const bgColor = config.backgroundColor || '#000';

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bgColor, overflow: 'hidden', padding: '0 6px', boxSizing: 'border-box' }}>
      {visible && (
        <div style={{ fontSize: fontSize + 'px', fontWeight: 'bold', fontFamily: 'monospace', color: textColor, lineHeight: 1, letterSpacing: '0.02em' }}>
          {timeStr}
        </div>
      )}
    </div>
  );
}
